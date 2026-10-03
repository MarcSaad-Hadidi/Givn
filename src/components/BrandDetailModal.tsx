"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { ExternalLink, TrendingUp, Clock, Fingerprint, CheckCircle, ArrowRight } from "lucide-react";
import { getBrandProofs } from "@/app/actions";
import type { Brand, Proof } from "@/lib/types";
import Badge from "./Badge";
import Dialog from "./Dialog";

const formatAmount = (amount: number) => amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
const formatDate = (date: string | null) => date
  ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "Date unavailable";

function AreaChart({ data }: { data: { label: string; value: number }[] }) {
  const gradientId = useId();
  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5"><p className="text-xs text-zinc-500 font-mono font-bold">NO DATA YET</p></div>;
  }
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min + ((max - min) * 0.2 || 100);
  const points = data.map((point, index) => ({ ...point, x: index / (data.length - 1) * 100, y: 45 - (point.value - min) / range * 40 }));
  const line = `M${points.map((point) => `${point.x},${point.y}`).join(" L")}`;
  return (
    <div className="w-full h-full relative select-none">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible" role="img" aria-label={`Cumulative recorded amounts: ${data.at(-1)!.value.toLocaleString("en-US")} unconverted units`}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.4" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
        <path d={`${line} L100,50 L0,50 Z`} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="#34d399" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={index} className="group">
            <title>{point.label}: {formatAmount(point.value)} unconverted units</title>
            <circle cx={point.x} cy={point.y} r="4" fill="transparent" vectorEffect="non-scaling-stroke" />
            <circle cx={point.x} cy={point.y} r="2" fill="#09090b" stroke="#34d399" strokeWidth="1" vectorEffect="non-scaling-stroke" className="transition-all group-hover:fill-emerald-400" />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <rect x={point.x - 12} y={point.y - 12} width="24" height="8" rx="2" fill="#10b981" />
              <text x={point.x} y={point.y - 7} textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">{new Intl.NumberFormat("en-US", { notation: "compact" }).format(point.value)}</text>
            </g>
          </g>
        ))}
      </svg>
      <span className="absolute top-0 right-0 text-[10px] font-mono text-emerald-500 font-bold bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">Current: {formatAmount(data.at(-1)!.value)}</span>
    </div>
  );
}

export default function BrandDetailModal({ brand, onClose }: { brand: Brand; onClose: () => void }) {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getBrandProofs(brand.id)
      .then((data) => { if (active) setProofs(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [brand.id]);

  let total = 0;
  const chart: { label: string; value: number }[] = [];
  for (const proof of proofs) {
    total += proof.amount;
    chart.push({ label: formatDate(proof.verified_at), value: total });
  }
  if (chart.length) chart.unshift({ label: "Start", value: 0 });

  return (
    <Dialog title={`Proofs for ${brand.name}`} onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="w-28 h-28 rounded-3xl bg-[#0c0c0c] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-5">
          {brand.logo_url ? <Image src={brand.logo_url} alt={brand.name} width={112} height={112} unoptimized className="w-full h-full object-contain" /> : <span className="text-4xl font-black">{brand.name.charAt(0)}</span>}
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter break-words">{brand.name}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={brand.latest_status} />
            {brand.website && /^https?:\/\//i.test(brand.website) && <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-emerald-400 hover:text-white"><ExternalLink size={12} /> Website</a>}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-emerald-500/30 pl-4 italic">{brand.claim || brand.description || "Corporate philanthropy evidence."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gradient-to-b from-zinc-900/40 to-black border border-white/5 rounded-3xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Trust Score</p>
          <span className="text-5xl font-black font-mono">{brand.trust_score}</span><span className="text-zinc-500"> /100</span>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-6 overflow-hidden"><div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, brand.trust_score))}%` }} /></div>
        </div>
        <div className="bg-gradient-to-b from-zinc-900/40 to-black border border-white/5 rounded-3xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Reviewed Proofs</p>
          <span className="text-5xl font-black font-mono">{brand.proof_count}</span>
          <p className="text-[10px] text-blue-400 mt-6 flex items-center gap-2"><Clock size={12} /> Last proof: {formatDate(brand.last_proof_at)}</p>
        </div>
        <div className="bg-gradient-to-b from-zinc-900/40 to-black border border-white/5 rounded-3xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Recorded Amount</p>
          <span className="text-3xl font-black font-mono break-all">{formatAmount(brand.total_donated)}</span>
          <p className="text-xs text-zinc-500 mt-4">Unconverted units across currencies</p>
        </div>
      </div>

      <div className="mb-12 bg-[#050505] rounded-3xl p-6 border border-white/10 min-h-[300px]">
        <div className="flex justify-between items-start mb-6">
          <div><h3 className="font-bold text-sm">Cumulative Recorded Amounts</h3><p className="text-xs text-zinc-500 mt-1">Unconverted units across currencies</p></div>
          <TrendingUp size={20} className="text-emerald-500" />
        </div>
        <div className="w-full h-48 md:h-64">{loading ? <p className="text-zinc-500 text-sm">Loading proofs...</p> : error ? <p className="text-amber-400 text-sm">Proofs are temporarily unavailable.</p> : <AreaChart data={chart} />}</div>
      </div>

      <div className="border-t border-white/10 pt-10">
        <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3"><Fingerprint size={20} className="text-emerald-500" /> Public Evidence</h3>
        <div className="space-y-4">
          {loading ? <p role="status" className="text-zinc-500 text-sm text-center">Loading reviewed proofs...</p> : error ? <p role="status" className="text-amber-400 text-sm text-center">Could not load proofs. Close this dialog and try again.</p> : proofs.length ? [...proofs].reverse().map((proof) => {
            const content = (
              <>
                <div className="flex items-start gap-4"><CheckCircle size={24} className="text-emerald-400 shrink-0" /><div><p className="text-sm font-bold">{proof.title || "Verified Donation Record"}</p><p className="text-xs text-zinc-500 mt-1">{formatDate(proof.verified_at)} · ID: {proof.id.slice(0, 8)}</p></div></div>
                <div className="flex items-center gap-4 shrink-0"><span className="font-mono font-bold">{formatAmount(proof.amount)} {proof.currency}</span>{proof.proof_url && <ArrowRight size={18} />}</div>
              </>
            );
            const className = "flex flex-col md:flex-row gap-4 md:items-center justify-between p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-colors";
            return proof.proof_url && /^https?:\/\//i.test(proof.proof_url)
              ? <a key={proof.id} href={proof.proof_url} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
              : <div key={proof.id} className={className}>{content}</div>;
          }) : <p className="p-8 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 text-sm">No reviewed proofs available yet.</p>}
        </div>
      </div>
    </Dialog>
  );
}
