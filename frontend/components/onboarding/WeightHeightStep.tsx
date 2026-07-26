"use client";

import { useState } from "react";

interface WeightHeightStepProps {
  weight: number;
  height: number;
  onWeightChange: (weight: number) => void;
  onHeightChange: (height: number) => void;
  onNext: () => void;
}

export default function WeightHeightStep({ weight, height, onWeightChange, onHeightChange, onNext }: WeightHeightStepProps) {
  const [w, setW] = useState(weight || 70);
  const [h, setH] = useState(height || 175);

  function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = raw === "" ? 30 : Math.min(300, Math.max(30, parseInt(raw, 10)));
    setW(num);
    onWeightChange(num);
  }

  function handleHeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = raw === "" ? 100 : Math.min(250, Math.max(100, parseInt(raw, 10)));
    setH(num);
    onHeightChange(num);
  }

  return (
    <section className="mx-6 mt-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-zinc-900 text-center">Greutate și înălțime</h2>
      <p className="text-sm text-zinc-400 mt-1 text-center">Ne ajută să calculăm nevoile tale calorice</p>

      <div className="mt-10 w-full flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">Greutate (kg)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { const v = Math.max(30, w - 1); setW(v); onWeightChange(v); }}
              className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-xl font-bold text-emerald-600">−</span>
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={w}
              onChange={handleWeightChange}
              className="w-24 text-center text-5xl font-bold text-zinc-900 bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => { const v = Math.min(300, w + 1); setW(v); onWeightChange(v); }}
              className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-xl font-bold text-emerald-600">+</span>
            </button>
          </div>
          <span className="text-xs text-zinc-400">kilograme</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">Înălțime (cm)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { const v = Math.max(100, h - 1); setH(v); onHeightChange(v); }}
              className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-xl font-bold text-emerald-600">−</span>
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={h}
              onChange={handleHeightChange}
              className="w-24 text-center text-5xl font-bold text-zinc-900 bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => { const v = Math.min(250, h + 1); setH(v); onHeightChange(v); }}
              className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-xl font-bold text-emerald-600">+</span>
            </button>
          </div>
          <span className="text-xs text-zinc-400">centimetri</span>
        </div>
      </div>

      <div className="flex-1 min-h-8" />

      <button
        onClick={onNext}
        className="mb-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
      >
        Continuă
      </button>
    </section>
  );
}