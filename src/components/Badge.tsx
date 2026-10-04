import { ShieldCheck, Clock, AlertCircle } from "lucide-react";
import type { Brand } from "@/lib/types";

export default function Badge({ status }: { status: Brand["latest_status"] }) {
  const verified = status === "verified";
  const rejected = status === "rejected";
  const Icon = verified ? ShieldCheck : rejected ? AlertCircle : Clock;
  const color = verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : rejected ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400";

  return (
    <span className={`relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${color}`}>
      {verified && <span aria-hidden="true" className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />}
      <Icon size={12} className="relative z-10" />
      <span className="text-[10px] font-bold tracking-widest uppercase relative z-10">{verified ? "Verified" : rejected ? "Rejected" : "Pending"}</span>
    </span>
  );
}
