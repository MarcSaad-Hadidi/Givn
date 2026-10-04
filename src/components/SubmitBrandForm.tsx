"use client";

import { useActionState, useEffect } from "react";
import { Globe, Building2, AlertCircle, Loader2, Check } from "lucide-react";
import { addBrand } from "@/app/actions";

const initialState = { message: "", success: false };

export default function SubmitBrandForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(addBrand, initialState);
  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(onSuccess, 2000);
    return () => clearTimeout(timer);
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <div role="status" className="flex flex-col items-center py-8 animate-enter">
        <Check className="w-12 h-12 text-emerald-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">Brand submitted</h3>
        <p className="text-zinc-400 text-center">Your candidate is now in the database for evidence review.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 w-full">
      <div className="relative">
        <label htmlFor="brand-name" className="sr-only">Brand name</label>
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input id="brand-name" name="name" placeholder="Brand name" required disabled={pending} className="pl-10 w-full h-10 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div className="relative">
        <label htmlFor="brand-website" className="sr-only">Brand website</label>
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input id="brand-website" name="website" type="url" placeholder="Website (https://brand.com)" required disabled={pending} className="pl-10 w-full h-10 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50" />
      </div>
      {state.message && <p role="alert" className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-700/50"><AlertCircle size={16} />{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
        {pending && <Loader2 size={16} className="animate-spin" />}{pending ? "Submitting..." : "Submit for Review"}
      </button>
    </form>
  );
}
