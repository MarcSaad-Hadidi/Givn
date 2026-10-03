# Givn

A public directory of corporate giving claims and supporting evidence. Givn lets visitors compare brands, inspect donation documents, and distinguish recorded claims from manually verified proofs.

## How it works

- Search and filter brands, compare the leaderboard, and inspect each brand's proof history and donation chart.
- Anyone can submit a brand for inclusion. An authorized administrator uploads supporting documents and records verified proofs.
- `brand_trust_live` supplies donation totals, proof counts, recency-based trust scores, and the latest proof status. A brand is shown as verified only when `latest_status === "verified"`. Amounts are summed as recorded; currencies are not converted.

## Architecture

```text
Next.js App Router -> Server Actions -> Supabase -> interactive UI
```

`src/app/page.tsx` fetches initial data on the server; `src/components/Home.tsx` owns search, filters, and dialogs. `src/app/actions.ts` is the single data and mutation entrypoint. Shared types and the cookie-aware Supabase server client live in `src/lib/`; components are flat in `src/components/`.

The stack is Next.js 16, React 19, TypeScript, Tailwind CSS 3, Clerk, and Supabase. Clerk handles sign-in. `src/proxy.ts` protects `/admin`, and both the admin page and upload action require a verified primary Clerk email matching the server-only `ADMIN_EMAIL`. Supabase uses the anonymous key and request cookies; database and Storage policies remain responsible for data access.

## Local development

Use Node.js 22 and npm. Run `npm ci`, create `.env.local` with the following keys, then run `npm run dev` and open [localhost:3000](http://localhost:3000).

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAIL=
```

Provision a Clerk application and a Supabase backend with `brands`, `proofs` (including the `title` field used by uploads), the `brand_trust_live` view, and a `proofs` Storage bucket with public document URLs. Configure policies for public reads and brand submissions and authorized proof uploads. [database/brand_trust_live.sql](database/brand_trust_live.sql) preserves the view query; it is not an automatic migration or a complete backend provisioning script.

```bash
npm run dev        # development server
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # focused action/auth regression tests
npm run build      # production build
npm start          # serve the production build
```

CI runs a deterministic install and all checks above except the development and production servers. Its build step uses a nonsecret placeholder Clerk publishable key and requires no live database. This verifies compilation and prerendering; running the application requires real environment values and configured backend policies. Proof uploads accept documents up to 5 MB; the Server Action request limit is 6 MB to allow multipart overhead.
