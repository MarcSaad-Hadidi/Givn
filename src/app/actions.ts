"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import type { ActionState, Activity, Brand, Proof } from "@/lib/types";

type BrandRecord = Omit<Brand, "proof_count" | "total_donated" | "trust_score"> & {
  proof_count: number | string;
  total_donated: number | string;
  trust_score: number | string;
};

type ProofRecord = Omit<Proof, "amount" | "currency" | "title"> & {
  amount: number | string;
  currency: string | null;
  title?: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getBrands(): Promise<Brand[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("brand_trust_live")
    .select("id, slug, name, website, logo_url, category, claim, description, proof_count, total_donated, last_proof_at, trust_score, latest_status")
    .order("trust_score", { ascending: false })
    .returns<BrandRecord[]>();

  if (error) throw new Error("Unable to load brands");

  return (data ?? []).map((brand) => ({
    ...brand,
    proof_count: Number(brand.proof_count ?? 0),
    total_donated: Number(brand.total_donated ?? 0),
    trust_score: Number(brand.trust_score ?? 0),
  }));
}

export async function getHomeData() {
  const supabase = await supabaseServer();
  const [leaderboard, { data, error }] = await Promise.all([
    getBrands(),
    supabase
      .from("proofs")
      .select("id, amount, currency, verified_at, brand:brands(name)")
      .eq("status", "verified")
      .order("verified_at", { ascending: false })
      .limit(5)
      .returns<{
        id: string;
        amount: number | string;
        currency: string | null;
        verified_at: string | null;
        brand: { name: string } | null;
      }[]>(),
  ]);

  if (error) throw new Error("Unable to load recent activity");

  const recentActivity: Activity[] = (data ?? []).map((proof) => ({
    id: proof.id,
    brand: proof.brand?.name ?? "Unknown brand",
    amount: Number(proof.amount),
    currency: proof.currency ?? "USD",
    timestamp: proof.verified_at,
  }));

  return {
    totalVolume: leaderboard.reduce((total, brand) => total + brand.total_donated, 0),
    leaderboard,
    recentActivity,
  };
}

export async function getBrandProofs(brandId: string): Promise<Proof[]> {
  if (!uuidPattern.test(brandId)) throw new Error("Invalid brand");

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("proofs")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "verified")
    .order("verified_at", { ascending: true })
    .returns<ProofRecord[]>();

  if (error) throw new Error("Unable to load proofs");

  return (data ?? []).map((proof) => ({
    id: proof.id,
    brand_id: proof.brand_id,
    amount: Number(proof.amount),
    currency: proof.currency ?? "USD",
    proof_url: proof.proof_url,
    title: proof.title ?? null,
    verified_at: proof.verified_at,
  }));
}

export async function addBrand(_: unknown, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  if (!name || name.length > 120 || !slug || website.length > 2048) {
    return { success: false, message: "Indiquez un nom et un site web valides." };
  }

  try {
    const url = new URL(website);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return { success: false, message: "Le site web doit utiliser HTTP ou HTTPS." };
    }
  } catch {
    return { success: false, message: "Indiquez une URL de site web valide." };
  }

  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.from("brands").insert({ name, website, slug });
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Marque soumise avec succès." };
  } catch (error) {
    console.error("Brand submission failed", error);
    return { success: false, message: "Impossible de soumettre cette marque." };
  }
}

export async function uploadProof(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    if (!(await isAdmin())) {
      return { success: false, message: "Accès refusé. Compte non autorisé." };
    }

    const brandId = String(formData.get("brandId") ?? "");
    const amountText = String(formData.get("amount") ?? "").trim();
    const amount = Number(amountText);
    const currency = String(formData.get("currency") || "USD").toUpperCase();
    const title = String(formData.get("title") ?? "").trim();
    const file = formData.get("file");

    if (!uuidPattern.test(brandId) || !amountText || !Number.isFinite(amount) || amount < 0) {
      return { success: false, message: "Marque ou montant invalide." };
    }
    if (!["USD", "EUR", "ETH", "BTC"].includes(currency) || !title || title.length > 500) {
      return { success: false, message: "Devise ou description invalide." };
    }
    if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      return { success: false, message: "Choisissez un document de 5 Mo maximum." };
    }

    const extensions: Record<string, string> = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
    };
    const extension = extensions[file.type];
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const validFile =
      (extension === "pdf" && new TextDecoder().decode(header.slice(0, 5)) === "%PDF-") ||
      (extension === "png" && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte)) ||
      (extension === "jpg" && header[0] === 255 && header[1] === 216 && header[2] === 255);

    if (!validFile) {
      return { success: false, message: "Formats acceptés : PDF, PNG et JPG." };
    }

    const supabase = await supabaseServer();
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brandId)
      .maybeSingle();
    if (brandError || !brand) {
      return { success: false, message: "Cette marque est indisponible." };
    }

    const filePath = "uploads/" + crypto.randomUUID() + "." + extension;
    const bucket = supabase.storage.from("proofs");
    const { error: uploadError } = await bucket.upload(filePath, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: urlData } = bucket.getPublicUrl(filePath);
    const { error: dbError } = await supabase.from("proofs").insert({
      brand_id: brandId,
      amount,
      currency,
      proof_url: urlData.publicUrl,
      status: "verified",
      verified_at: new Date().toISOString(),
      title,
    });

    if (dbError) {
      const { error: cleanupError } = await bucket.remove([filePath]);
      if (cleanupError) console.error("Proof upload cleanup failed", cleanupError);
      throw dbError;
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Success! Proof added." };
  } catch (error) {
    console.error("Proof submission failed", error);
    return { success: false, message: "Impossible d'ajouter cette preuve." };
  }
}
