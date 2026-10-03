import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

export default function Page() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020403] overflow-hidden selection:bg-emerald-500 selection:text-black">
      <ParticlesBackground />
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/5 transition-all">
                <ArrowLeft size={16} />
            </div>
            Back to Givn
        </Link>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/10 bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"></div>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">Givn</span>
        </div>

        <SignIn 
          appearance={{
            layout: { socialButtonsPlacement: "bottom" },
            elements: {
              rootBox: "w-full",
              card: "bg-[#090909]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full sm:w-[400px] p-2",
              headerTitle: "text-white font-bold text-xl",
              headerSubtitle: "text-zinc-500 text-xs",
              formFieldLabel: "text-zinc-400 text-xs uppercase font-bold tracking-wider ml-1",
              formFieldInput: "bg-black/50 border-white/10 text-white focus:border-emerald-500/50 rounded-xl p-3 placeholder:text-zinc-700 transition-all",
              formButtonPrimary: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all uppercase text-xs tracking-widest",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-bold",
              identityPreviewText: "text-zinc-300",
              formFieldAction: "text-emerald-400 hover:text-emerald-300",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-xl",
              dividerLine: "bg-white/10",
              dividerText: "text-zinc-600 uppercase text-[10px] font-bold tracking-widest"
            }
          }}
        />
        
        <p className="text-zinc-600 text-xs max-w-xs text-center">
            Learn how donation evidence is published in our <Link href="/methodology" className="text-zinc-500 underline hover:text-emerald-400">methodology</Link>.
        </p>
      </div>
    </div>
  );
}