"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Dialog({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className="givn-dialog w-[calc(100%_-_2rem)] max-w-2xl max-h-[92dvh] p-0 text-white bg-[#080808] border border-white/10 rounded-3xl shadow-2xl hide-scrollbar overflow-y-auto"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div className="relative p-6 md:p-12">
        <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-zinc-400 bg-white/5 rounded-full hover:text-white hover:bg-white/10">
          <X size={20} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
