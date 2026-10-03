import { Activity, Clock } from "lucide-react";
import type { Activity as ActivityEvent } from "@/lib/types";

export default function GlobalPulse({ totalVolume, recentActivity }: { totalVolume: number; recentActivity: ActivityEvent[] }) {
  return (
    <div className="w-full bg-[#050505] border-b border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-emerald-500/5 blur-[80px] pointer-events-none" />
      <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <p className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Recorded Donation Amounts</p>
          <p className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tighter font-mono">{totalVolume.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-zinc-500 mt-2">Unconverted units across currencies</p>
        </div>
        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
          <p className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest mb-1"><Activity size={14} className="text-emerald-500" />Recent Reviewed Proofs</p>
          <div className="flex flex-col gap-2 w-full md:w-[320px]">
            {recentActivity.length ? recentActivity.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm animate-enter hover:bg-white/[0.05]" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-left min-w-0">
                  <p className="font-bold truncate">{item.brand}</p>
                  {item.timestamp && <time dateTime={item.timestamp} className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5"><Clock size={10} />{new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>}
                </div>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20">{item.amount.toLocaleString("en-US")} {item.currency}</span>
              </div>
            )) : <p className="text-zinc-500 text-xs italic py-2">No reviewed proofs yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
