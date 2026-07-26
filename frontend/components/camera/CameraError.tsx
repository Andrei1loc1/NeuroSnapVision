"use client";

import { Camera } from "lucide-react";

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export default function CameraError({ error, onRetry }: CameraErrorProps) {
  return (
    <section className="fixed inset-0 z-50 grid h-dvh place-items-center overflow-hidden bg-[#06130D] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#22c55e33,transparent_38%),radial-gradient(circle_at_bottom,#16a34a22,transparent_35%)]" />

      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <Camera size={30} />
        </div>

        <h2 className="text-xl font-semibold">Camera unavailable</h2>

        <p className="mt-2 text-sm leading-6 text-white/65">{error}</p>

        <button
          onClick={onRetry}
          className="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(34,197,94,0.35)] transition hover:scale-[1.03] active:scale-95"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
