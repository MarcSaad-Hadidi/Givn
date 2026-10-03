"use client";

import { useActionState, useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { uploadProof } from "@/app/actions";
import type { Brand } from "@/lib/types";

const initialState = { message: "", success: false };
const inputClass = "w-full bg-black/50 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500";

export default function SubmitProofForm({ brands }: { brands: Pick<Brand, "id" | "name">[] }) {
  const [state, formAction, pending] = useActionState(uploadProof, initialState);
  const [fileName, setFileName] = useState("");
  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="proof-brand" className="block text-xs uppercase text-zinc-500 mb-2 font-bold">Brand Entity</label>
        <select id="proof-brand" name="brandId" required className={inputClass}>
          <option value="">Select a brand...</option>
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="proof-title" className="flex items-center gap-2 text-xs uppercase text-zinc-500 mb-2 font-bold"><FileText size={12} />Context / Description</label>
        <input id="proof-title" name="title" placeholder="Report title and page number" required className={inputClass} />
        <p className="text-xs text-zinc-500 mt-1">Appears in the public proof details.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label htmlFor="proof-amount" className="block text-xs uppercase text-zinc-500 mb-2 font-bold">Amount</label>
          <input id="proof-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="proof-currency" className="block text-xs uppercase text-zinc-500 mb-2 font-bold">Currency</label>
          <select id="proof-currency" name="currency" className={inputClass}>
            {["USD", "EUR", "ETH", "BTC"].map((currency) => <option key={currency}>{currency}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="proof-file" className="block text-xs uppercase text-zinc-500 mb-2 font-bold">Evidence Document</label>
        <div className="relative border border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10">
          <input id="proof-file" type="file" name="file" accept="application/pdf,image/png,image/jpeg" required onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="p-8 flex flex-col items-center text-zinc-400">
            <UploadCloud size={24} className="mb-2" /><span className="text-xs font-bold break-all">{fileName || "Click to upload proof"}</span><span className="text-xs mt-1">PDF, PNG, JPG (Max 5MB)</span>
          </div>
        </div>
      </div>
      {state.message && <p role={state.success ? "status" : "alert"} className={`p-4 rounded-xl flex items-center gap-3 text-sm ${state.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{state.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2">
        <UploadCloud size={20} />{pending ? "Uploading proof..." : "Upload Proof Record"}
      </button>
    </form>
  );
}
