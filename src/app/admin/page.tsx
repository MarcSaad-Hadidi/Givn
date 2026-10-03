import Link from "next/link";
import { Activity, Lock } from "lucide-react";
import { getBrands } from "@/app/actions";
import SubmitProofForm from "@/components/SubmitProofForm";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Lock className="text-red-500" /> Access denied
          </h1>
          <p className="text-zinc-400 mb-6">This account cannot access the admin panel.</p>
          <Link href="/" className="text-emerald-400 underline">Back to Givn</Link>
        </div>
      </div>
    );
  }

  const brands = await getBrands();

  return (
    <div className="min-h-screen bg-[#020403] text-white font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto p-6 pt-28 md:p-12 md:pt-32">
        <header className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Givn <span className="text-zinc-600">Admin</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Record donation evidence and inspect brand activity.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 min-h-[500px]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity size={18} /> Brands
              </h2>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex justify-between p-3 bg-black/40 rounded border border-white/5 text-sm">
                    <span>{brand.name}</span>
                    <span className="text-emerald-500 font-mono">{brand.trust_score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-[#080808] border border-white/10 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-3xl pointer-events-none" />
              <h2 className="text-xl font-bold mb-6 relative z-10">Add donation proof</h2>
              <SubmitProofForm brands={brands} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
