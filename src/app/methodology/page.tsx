import { Database, Search, ShieldCheck } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">How Givn works.</h1>
        <p className="text-xl text-zinc-400 mb-16 leading-relaxed">
          Givn brings corporate donation records and supporting documents together so you can inspect the evidence behind reported impact.
        </p>

        <div className="space-y-16">
          <section className="relative pl-8 border-l border-emerald-500/30">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-black border border-emerald-500 rounded-full flex items-center justify-center text-emerald-500">
              <Search size={12} />
            </div>
            <h2 className="text-2xl font-bold mb-4">1. Brand submissions</h2>
            <p className="text-zinc-400 leading-7">
              Anyone can submit a brand name and website. A submission creates a brand record; donation evidence is added separately.
            </p>
          </section>

          <section className="relative pl-8 border-l border-emerald-500/30">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-black border border-emerald-500 rounded-full flex items-center justify-center text-emerald-500">
              <Database size={12} />
            </div>
            <h2 className="text-2xl font-bold mb-4">2. Evidence recording</h2>
            <p className="text-zinc-400 leading-7">
              An authorized administrator can upload a supporting document and record its brand, donation amount, currency, and title. Published proof records are stored with their evidence links and verification dates.
            </p>
          </section>

          <section className="relative pl-8 border-l border-transparent">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black">
              <ShieldCheck size={14} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">3. Public evidence</h2>
            <p className="text-zinc-400 leading-7">
              Brand details show recorded donations and links to their supporting documents. A verified label reflects evidence published as verified by an administrator. It does not certify every claim a company makes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
