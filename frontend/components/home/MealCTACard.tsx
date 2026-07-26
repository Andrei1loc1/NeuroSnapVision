"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MealCTACard() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/vision-ai")}
      className="mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl border border-emerald-200/60 bg-white/50 p-4 text-left backdrop-blur-xl shadow-[0_8px_24px_rgba(20,83,45,0.10)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(20,83,45,0.16)] active:scale-[0.99]"
      aria-label="Loghează o masă"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
        <Camera className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-zinc-900">Loghează o masă</span>
        <span className="text-[11px] text-zinc-500">Scanează cu AI</span>
      </span>
      <span className="ml-auto text-emerald-500 text-lg font-semibold leading-none">→</span>
    </button>
  );
}