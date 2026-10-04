export type ProofStatus = "draft" | "submitted" | "under_review" | "verified" | "rejected";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  category: string | null;
  claim: string | null;
  description: string | null;
  proof_count: number;
  total_donated: number;
  last_proof_at: string | null;
  trust_score: number;
  latest_status: ProofStatus | null;
};

export type Proof = {
  id: string;
  brand_id: string;
  amount: number;
  currency: string;
  proof_url: string | null;
  title: string | null;
  verified_at: string | null;
};

export type Activity = {
  id: string;
  brand: string;
  amount: number;
  currency: string;
  timestamp: string | null;
};

export type ActionState = {
  success: boolean;
  message: string;
};
