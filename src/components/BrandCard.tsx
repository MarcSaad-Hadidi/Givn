"use client";

import { type MouseEvent } from "react";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import type { Brand } from "@/lib/types";
import Badge from "./Badge";

export function BrandCard({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const color = brand.trust_score >= 80 ? "#10b981" : brand.trust_score >= 50 ? "#eab308" : "#ef4444";
  const circumference = 2 * Math.PI * 14;
  const amount = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(brand.total_donated);
  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    element.style.setProperty("--pointer-x", `${x}px`);
    element.style.setProperty("--pointer-y", `${y}px`);
    element.style.setProperty("--tilt-x", `${(y - rect.height / 2) / 18}deg`);
    element.style.setProperty("--tilt-y", `${(x - rect.width / 2) / -18}deg`);
  };

  return (
    <button type="button" onMouseMove={handleMouseMove} onClick={onClick} aria-label={`View proofs for ${brand.name}`} className="perspective-card group relative aspect-square w-full cursor-pointer select-none text-left">
      <div className="brand-card-surface preserve-3d relative w-full h-full rounded-2xl bg-[#090909] transition-transform duration-200 ease-out shadow-2xl border border-white/5 group-hover:border-white/10 transform-gpu">
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `radial-gradient(320px circle at var(--pointer-x, 50%) var(--pointer-y, 50%), ${color}33, transparent 65%)` }} />
        <div className="absolute inset-[1.5px] rounded-[15px] bg-gradient-to-br from-[#121212] via-[#090909] to-[#030303] overflow-hidden flex flex-col p-4 preserve-3d">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#0f0f0f] flex items-center justify-center border border-white/10 shadow-md group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              {brand.logo_url ? <Image src={brand.logo_url} alt="" width={40} height={40} unoptimized className="w-full h-full object-contain p-1" draggable={false} /> : <span className="text-sm font-black" style={{ color }}>{brand.name.charAt(0)}</span>}
            </div>
            <span className="scale-75 origin-top-right"><Badge status={brand.latest_status} /></span>
          </div>
          <div className="mb-auto space-y-1.5" style={{ transform: "translateZ(20px)" }}>
            <h3 className="text-sm font-black text-white truncate leading-tight group-hover:text-emerald-50">{brand.name}</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{brand.category || "Public Database"}</p>
            <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2 italic">{brand.claim || brand.description || "\u00A0"}</p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-end justify-between" style={{ transform: "translateZ(15px)" }}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="w-full h-full -rotate-90">
                <circle cx="16" cy="16" r="14" stroke="#1a1a1c" strokeWidth="2.5" fill="none" />
                <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2.5" fill="none" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, brand.trust_score)) / 100)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
              </svg>
              <span className="absolute text-[9px] font-black" style={{ color }}>{brand.trust_score}</span>
            </div>
            <div className="text-right">
              <span className="flex items-center justify-end gap-1 text-zinc-400 group-hover:text-emerald-400 text-sm font-black font-mono">{amount}<TrendingUp size={10} /></span>
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest block font-black">Unconverted units</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
