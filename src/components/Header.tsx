"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Scan } from "lucide-react";

export default function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 transition-all">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center group-hover:scale-110 transition-transform bg-white/5 group-hover:bg-emerald-500/20 group-hover:border-emerald-500">
                <div className="w-3 h-3 bg-white rounded-full group-hover:bg-emerald-400"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">Givn.</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
             <Link href="/methodology" className="text-sm font-medium text-zinc-400 hover:text-white transition">
                Methodology
             </Link>
             <SignedIn>
                <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <Scan size={14} />
                  ADMIN PANEL
                </Link>
             </SignedIn>
          </div>
        </div>
        <div>
          <SignedIn>
            <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" appearance={{
                    elements: {
                        avatarBox: "w-9 h-9 border border-white/20"
                    }
                }}/>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Connexion
              </button>
            </SignInButton>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
}