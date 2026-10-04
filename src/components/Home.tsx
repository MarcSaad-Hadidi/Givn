"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ArrowRight, Scan, ShieldCheck, Filter } from "lucide-react";
import type { Brand, Activity } from "@/lib/types";
import { BrandCard } from "./BrandCard";
import LivingAdSlot, { type Ad } from "./LivingAdSlot";
import BrandDetailModal from "./BrandDetailModal";
import SubmitBrandForm from "./SubmitBrandForm";
import GlobalPulse from "./GlobalPulse";
import ParticlesBackground from "./ParticlesBackground";
import Dialog from "./Dialog";

const AD_POOL_LEFT: Ad[] = [
  { title: "Proof Drop", subtitle: "Evidence uploaded → badge updates.", type: "tree" },
  { title: "EcoTrack", subtitle: "Carbon offset verification.", type: "energy" },
  { title: "WaterLife", subtitle: "Clean water projects verified.", type: "water" },
  { title: "MediChain", subtitle: "Medical supply support.", type: "health" },
  { title: "AgroFund", subtitle: "Direct farmer support verified.", type: "food" },
];

const AD_POOL_RIGHT: Ad[] = [
  { title: "Blue Future", subtitle: "Protecting marine ecosystems.", type: "ocean" },
  { title: "Bright Minds", subtitle: "Funding rural schools directly.", type: "school" },
  { title: "HomeBase", subtitle: "Housing for everyone, verified.", type: "house" },
  { title: "WildLife", subtitle: "Preserving biodiversity habitats.", type: "tree" },
  { title: "SolarShare", subtitle: "Community solar grids funded.", type: "energy" },
];

export default function Home({ leaderboard: brands, totalVolume, recentActivity, unavailable = false }: { leaderboard: Brand[]; totalVolume: number; recentActivity: Activity[]; unavailable?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [modal, setModal] = useState<"brand" | "advertise" | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [viewFullList, setViewFullList] = useState(false);
  const categories = ["All", ...new Set(brands.map((brand) => brand.category || "Public Database"))];

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesCategory = activeCategory === "All" || (brand.category || "Public Database") === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        brand.name.toLowerCase().includes(q) ||
        (brand.claim ?? brand.description ?? "").toLowerCase().includes(q) || (brand.category ?? "").toLowerCase().includes(q);
      const matchesVerified = !verifiedOnly || brand.latest_status === "verified";

      return matchesCategory && matchesSearch && matchesVerified;
    });
  }, [brands, activeCategory, searchQuery, verifiedOnly]);

  const sortedBrands = [...filteredBrands].sort((a, b) => (b.total_donated || 0) - (a.total_donated || 0));
  const displayedBrandsList = viewFullList ? sortedBrands : sortedBrands.slice(0, 6);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#020403] text-white">
      <div className="fixed top-0 w-full z-40 pointer-events-none h-24 bg-gradient-to-b from-black/50 to-transparent lg:hidden" />

      <div className="flex-1 pt-10 md:pt-24 w-full px-4 relative">
        <ParticlesBackground />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative w-full z-10">
          <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24 pt-0 h-fit space-y-8">
            <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={2000} cycleDuration={10000} startIndex={0} />
            <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={1500} cycleDuration={10000} startIndex={1} />
            <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={1000} cycleDuration={10000} startIndex={2} />
            <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={500} cycleDuration={10000} startIndex={3} />
            <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={0} cycleDuration={10000} startIndex={4} />
          </div>
          <div className="col-span-1 lg:col-span-8 flex flex-col items-center text-center pt-10 min-h-screen">
            <div className="mb-12 md:mb-20 w-full relative">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-8 animate-[pop-in_0.7s_ease-out] glow-text">
                They say they donate.
                <br />
                <span className="text-zinc-600">Givn shows the proof.</span>
              </h1>

              <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-base md:text-lg animate-[pop-in_0.9s_ease-out] leading-relaxed">
                Brands can claim anything. Givn only shows what is verifiable. Transparent tracking for corporate philanthropy.
              </p>

              <div className="w-full mb-8 animate-[pop-in_1.0s_ease-out] rounded-2xl overflow-hidden border border-white/5">
                <GlobalPulse
                  totalVolume={totalVolume}
                  recentActivity={recentActivity}
                />
              </div>

              <div className="w-full max-w-lg mx-auto flex gap-3 mb-6 animate-[pop-in_1.1s_ease-out]">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                    <Search size={16} />
                  </div>
                  <input
                    type="search"
                    aria-label="Search brands and categories"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brands, categories..."
                    className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600 shadow-xl"
                  />
                </div>

                <button
                  onClick={() => setModal("brand")}
                  className="relative group overflow-hidden rounded-xl p-[2px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                >
                  <div className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#10b981_50%,#000000_100%)]" />
                  <div className="relative h-full bg-black rounded-[10px] px-8 flex items-center justify-center gap-2 transition-all group-hover:bg-zinc-900">
                    <Plus size={20} className="text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors uppercase text-xs">
                      Add Brand
                    </span>
                  </div>
                </button>
              </div>

              {unavailable && <p role="status" className="mt-3 text-xs text-amber-400">The database is temporarily unavailable. Please try again later.</p>}
            </div>
            <div className="w-full lg:hidden mb-16 px-4">
              <LivingAdSlot pool={AD_POOL_LEFT} initialDelay={1000} cycleDuration={14000} startIndex={0} />
            </div>
            <div id="categories" className="flex flex-col items-center mb-16 scroll-mt-24 w-full">
              <div className="flex items-center gap-2 mb-6">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Filter by trust</p>
                <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
                <button
                  aria-pressed={verifiedOnly}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                    verifiedOnly
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700"
                  }`}
                >
                  {verifiedOnly ? <ShieldCheck size={12} /> : <Filter size={12} />}
                  Verified Only
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    aria-pressed={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                      activeCategory === cat
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] transform scale-105"
                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-200 hover:bg-emerald-500/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full lg:hidden mb-16 px-4">
              <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={2000} cycleDuration={16000} startIndex={1} />
            </div>
            <div id="database" className="mb-24 scroll-mt-24 w-full text-left">
              <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Live Database</h2>
                  <p className="text-xs text-zinc-500">Brands and their reviewed public evidence</p>
                </div>
                <button
                  onClick={() => setViewFullList(!viewFullList)}
                  className="text-xs text-zinc-500 flex items-center gap-1 hover:text-white transition-colors bg-transparent border-0 font-medium cursor-pointer"
                >
                  {viewFullList ? "View less" : "View full"} <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedBrandsList.map((brand, i) => (
                  <div
                    key={brand.id}
                    className="animate-enter min-w-0"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <BrandCard brand={brand} onClick={() => setSelectedBrand(brand)} />
                  </div>
                ))}

                {!unavailable && displayedBrandsList.length === 0 && (
                  <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-white/5">
                    <p className="text-zinc-500 font-medium">No matching brands.</p>
                  </div>
                )}
              </div>
            </div>
            <div id="leaderboard" className="mb-32 scroll-mt-24 w-full text-left">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">Impact leaderboard</h2>
                  <p className="text-xs text-zinc-500">Ranked by recorded amounts · unconverted units</p>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-x-auto bg-[#0A0A0A] shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-xs text-zinc-500 uppercase tracking-wider">
                      <th className="p-4 font-semibold w-16 text-center">#</th>
                      <th className="p-4 font-semibold">Brand</th>
                      <th className="p-4 font-semibold hidden sm:table-cell">Category</th>
                      <th className="p-4 font-semibold text-right">Trust Score</th>
                      <th className="p-4 font-semibold text-right">Recorded Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {sortedBrands.map((brand, index) => (
                      <tr
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand)}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group cursor-pointer h-16 animate-enter"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4 text-zinc-500 font-mono text-xs text-center font-bold">
                          {index === 0 ? <span className="text-xl">👑</span> : index + 1}
                        </td>
                        <td className="p-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                          <button type="button" onClick={() => setSelectedBrand(brand)} className="text-left hover:underline" aria-label={`View proofs for ${brand.name}`}>{brand.name}</button>
                          <div className="sm:hidden text-xs text-zinc-500 font-normal mt-1">{brand.category || "Public Database"}</div>
                        </td>
                        <td className="p-4 text-zinc-400 hidden sm:table-cell">
                          <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">{brand.category || "Public Database"}</span>
                        </td>
                        <td className="p-4 text-right font-mono text-white font-medium">{brand.trust_score}/100</td>
                        <td className="p-4 flex justify-end items-center h-full font-mono text-emerald-400 font-bold">
                          {brand.total_donated && brand.total_donated > 0
                             ? brand.total_donated.toLocaleString("en-US")
                             : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24 pt-0 h-fit space-y-6">
            <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={2000} cycleDuration={10000} startIndex={0} />
            <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={1500} cycleDuration={10000} startIndex={1} />
            <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={1000} cycleDuration={10000} startIndex={2} />
            <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={500} cycleDuration={10000} startIndex={3} />
            <LivingAdSlot pool={AD_POOL_RIGHT} initialDelay={0} cycleDuration={10000} startIndex={4} />

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button type="button"
                className="flex items-center gap-2 group opacity-70 hover:opacity-100 transition-all"
                onClick={() => setModal("advertise")}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors text-right whitespace-nowrap">
                  Advertise Here
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/10 bg-black py-20 px-6 mt-20">
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-16 text-sm max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-1">
            <span className="font-bold text-xl tracking-tight mb-6 block text-white">Givn</span>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
              Corporate philanthropy made visible through reviewed public evidence.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <button onClick={() => scrollToSection("database")} className="hover:text-emerald-400 transition-colors">
                  Database
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("leaderboard")} className="hover:text-emerald-400 transition-colors">
                  Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => setModal("brand")} className="hover:text-emerald-400 transition-colors">
                  Submit Brand
                </button>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-4">Legal & Trust</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <a href="/methodology" className="hover:text-emerald-400 transition-colors">
                  Methodology
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1 text-right">
            <p className="text-zinc-600 text-xs">© Givn</p>
          </div>
        </div>
      </footer>

      {selectedBrand && <BrandDetailModal key={selectedBrand.id} brand={selectedBrand} onClose={() => setSelectedBrand(null)} />}
      {modal === "brand" && (
        <Dialog title="Submit a brand for review" onClose={() => setModal(null)}>
          <div className="flex flex-col items-center">
            <Scan size={32} className="text-emerald-400 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Submit a brand for review</h2>
            <p className="text-xs text-zinc-500 mb-8">Add a candidate to the public database.</p>
            <SubmitBrandForm onSuccess={() => setModal(null)} />
          </div>
        </Dialog>
      )}
      {modal === "advertise" && (
        <Dialog title="Living Ads on Givn" onClose={() => setModal(null)}>
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Living Ads on Givn</h2>
            <p className="text-zinc-400 text-sm mb-8">These animations illustrate how brand impact could be presented. Submit your brand for evidence review.</p>
            <button type="button" onClick={() => setModal("brand")} className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition-colors">Submit a Brand</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
