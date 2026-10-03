import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadModule(path, stubs, globals = {}) {
  const exports = {};
  const source = readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  runInNewContext(outputText, {
    exports, module: { exports }, File, FormData, URL, Uint8Array, TextDecoder,
    crypto: webcrypto, console: { error() {} },
    require(id) {
      assert.ok(id in stubs, "Unexpected boundary import: " + id);
      return stubs[id];
    },
    ...globals,
  });
  return exports;
}

const brandId = "27b23470-c9c6-4a7b-812b-23b0b136e90d";
const initialState = { success: false, message: "" };
const documentFile = () => new File(["%PDF-1.7\n"], "receipt.pdf", { type: "application/pdf" });

function uploadForm(overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    brandId, amount: "0", currency: "USD", title: "Donation receipt", file: documentFile(),
    ...overrides,
  })) form.set(key, value);
  return form;
}

function harness(options = {}) {
  const queries = [], inserts = [], uploads = [], removals = [], invalidations = [];
  let clientCalls = 0;
  const bucket = {
    async upload(path, file, config) {
      uploads.push({ path, file, config });
      return { error: options.uploadError ?? null };
    },
    getPublicUrl(path) { return { data: { publicUrl: "https://evidence.example/" + path } }; },
    async remove(paths) { removals.push(...paths); return { error: null }; },
  };
  const client = {
    from(table) {
      const query = { table, filters: [], limit: null };
      queries.push(query);
      const chain = {
        select(columns) { query.columns = columns; return chain; },
        eq(column, value) { query.filters.push([column, value]); return chain; },
        order(column, order) { query.order = { column, ...order }; return chain; },
        limit(limit) { query.limit = limit; return chain; },
        async returns() {
          return { data: options.rows?.[table] ?? [], error: options.readError ?? null };
        },
        async maybeSingle() {
          return { data: options.missingBrand ? null : { id: brandId }, error: null };
        },
        async insert(row) {
          inserts.push({ table, row });
          return { error: options.insertError ?? null };
        },
      };
      return chain;
    },
    storage: { from(name) { assert.equal(name, "proofs"); return bucket; } },
  };
  const actions = loadModule("src/app/actions.ts", {
    "next/cache": { revalidatePath(path) { invalidations.push(path); } },
    "@/lib/auth": { async isAdmin() { return options.admin ?? true; } },
    "@/lib/supabase": { async supabaseServer() { clientCalls++; return client; } },
  });
  return { ...actions, queries, inserts, uploads, removals, invalidations, get clientCalls() { return clientCalls; } };
}

test("admin authorization requires configured, verified primary identity", async (t) => {
  const identity = (email, status = "verified") => ({
    primaryEmailAddress: { emailAddress: email, verification: { status } },
  });
  const cases = [
    ["missing configuration", undefined, identity("admin@example.com"), false],
    ["blank configuration", "  ", identity("admin@example.com"), false],
    ["anonymous", "admin@example.com", null, false],
    ["different user", "admin@example.com", identity("visitor@example.com"), false],
    ["unverified address", "admin@example.com", identity("admin@example.com", "unverified"), false],
    ["nonprimary admin address", "admin@example.com", { ...identity("visitor@example.com"), emailAddresses: [identity("admin@example.com").primaryEmailAddress] }, false],
    ["normalized verified identity", " ADMIN@example.com ", identity("admin@EXAMPLE.com"), true],
  ];
  for (const [name, configured, user, expected] of cases) {
    await t.test(name, async () => {
      let calls = 0;
      const { isAdmin } = loadModule("src/lib/auth.ts", {
        "server-only": {},
        "@clerk/nextjs/server": { async currentUser() { calls++; return user; } },
      }, { process: { env: { ADMIN_EMAIL: configured } } });
      assert.equal(await isAdmin(), expected);
      if (!configured?.trim()) assert.equal(calls, 0);
    });
  }
});

test("unauthorized proof submissions never access Supabase or Storage", async () => {
  const h = harness({ admin: false });
  assert.equal((await h.uploadProof(initialState, uploadForm())).success, false);
  assert.equal(h.clientCalls, 0);
});

test("invalid proof inputs are rejected before database or Storage access", async (t) => {
  const cases = [
    ["invalid brand", { brandId: "not-a-uuid" }],
    ["missing amount", { amount: "" }],
    ["negative amount", { amount: "-1" }],
    ["nonfinite amount", { amount: "Infinity" }],
    ["nonnumeric amount", { amount: "not-money" }],
    ["unknown currency", { currency: "OTHER" }],
    ["missing description", { title: " " }],
    ["oversized description", { title: "a".repeat(501) }],
    ["missing file", { file: "" }],
    ["empty file", { file: new File([], "receipt.pdf", { type: "application/pdf" }) }],
    ["oversized file", { file: new File([new Uint8Array(5 * 1024 * 1024 + 1)], "receipt.pdf", { type: "application/pdf" }) }],
    ["unsupported MIME", { file: new File(["%PDF-1.7"], "receipt.html", { type: "text/html" }) }],
    ["spoofed PDF", { file: new File(["<script>"], "receipt.pdf", { type: "application/pdf" }) }],
    ["spoofed PNG", { file: new File(["not a png"], "receipt.png", { type: "image/png" }) }],
  ];
  for (const [name, values] of cases) {
    await t.test(name, async () => {
      const h = harness();
      assert.equal((await h.uploadProof(initialState, uploadForm(values))).success, false);
      assert.equal(h.clientCalls, 0);
    });
  }
});

test("proof upload verifies the brand and stops after Storage failures", async () => {
  const absent = harness({ missingBrand: true });
  assert.equal((await absent.uploadProof(initialState, uploadForm())).success, false);
  assert.equal(absent.uploads.length, 0);
  const failed = harness({ uploadError: { message: "Storage unavailable" } });
  assert.equal((await failed.uploadProof(initialState, uploadForm())).success, false);
  assert.equal(failed.inserts.length, 0);
  assert.equal(failed.invalidations.length, 0);
});

test("failed proof insert removes the already uploaded document", async () => {
  const h = harness({ insertError: { message: "Database unavailable" } });
  assert.equal((await h.uploadProof(initialState, uploadForm())).success, false);
  assert.equal(h.removals.length, 1);
  assert.equal(h.removals[0], h.uploads[0].path);
  assert.equal(h.invalidations.length, 0);
});

test("verified proof accepts zero amount and invalidates public and admin data", async () => {
  const h = harness();
  assert.equal((await h.uploadProof(initialState, uploadForm({ currency: "eur" }))).success, true);
  assert.equal(h.inserts.length, 1);
  const { table, row } = h.inserts[0];
  assert.equal(table, "proofs");
  assert.equal(row.brand_id, brandId);
  assert.equal(row.amount, 0);
  assert.equal(row.currency, "EUR");
  assert.equal(row.status, "verified");
  assert.equal(row.title, "Donation receipt");
  assert.ok(Number.isFinite(Date.parse(row.verified_at)));
  assert.equal(row.proof_url, "https://evidence.example/" + h.uploads[0].path);
  assert.deepEqual(h.invalidations, ["/", "/admin"]);
});

test("brand submissions reject unsafe URLs and use only supported brand fields", async () => {
  for (const website of ["javascript:alert(1)", "https://user:password@example.com", "not a URL", ""]) {
    const h = harness();
    const form = new FormData();
    form.set("name", "Brand"); form.set("website", website);
    assert.equal((await h.addBrand(null, form)).success, false);
    assert.equal(h.clientCalls, 0);
  }
  const h = harness(), form = new FormData();
  form.set("name", "  Café & Co  "); form.set("website", "https://example.com");
  assert.equal((await h.addBrand(null, form)).success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(h.inserts)), [{
    table: "brands", row: { name: "Café & Co", website: "https://example.com", slug: "cafe-co" },
  }]);
  const failed = harness({ insertError: { message: "Submission rejected" } });
  assert.equal((await failed.addBrand(null, form)).success, false);
  assert.equal(failed.invalidations.length, 0);
});

test("home totals come from the view and recent activity is bounded", async () => {
  const h = harness({ rows: {
    brand_trust_live: [{ id: brandId, proof_count: "2", total_donated: "125.5", trust_score: "100" }],
    proofs: [{ id: "proof", amount: "25.5", currency: "EUR", verified_at: null, brand: { name: "Brand" } }],
  } });
  const data = await h.getHomeData();
  assert.equal(data.totalVolume, 125.5);
  assert.equal(data.leaderboard[0].proof_count, 2);
  assert.equal(data.leaderboard[0].trust_score, 100);
  assert.equal(data.recentActivity[0].amount, 25.5);
  assert.equal(data.recentActivity[0].currency, "EUR");
  const activityQuery = h.queries.find((query) => query.table === "proofs");
  assert.equal(activityQuery.limit, 5);
  assert.deepEqual(activityQuery.filters, [["status", "verified"]]);
  assert.equal(h.queries.filter((query) => query.table === "brand_trust_live").length, 1);
  await assert.rejects(harness({ readError: { message: "offline" } }).getBrands(), /Unable to load/);
  assert.equal((await harness().getHomeData()).leaderboard.length, 0);
});

test("proof history validates identity, reads only verified proofs and tolerates absent title", async () => {
  const h = harness({ rows: { proofs: [{
    id: "proof", brand_id: brandId, amount: "0", currency: null,
    proof_url: "https://example.com/proof.pdf", verified_at: null,
  }] } });
  await assert.rejects(h.getBrandProofs("invalid"), /Invalid brand/);
  assert.equal(h.clientCalls, 0);
  const proofs = await h.getBrandProofs(brandId);
  assert.equal(proofs[0].amount, 0);
  assert.equal(proofs[0].currency, "USD");
  assert.equal(proofs[0].title, null);
  assert.deepEqual(h.queries[0].filters, [["brand_id", brandId], ["status", "verified"]]);
});
