"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface AgeStepProps {
  value: number;
  onChange: (age: number) => void;
  onNext: () => void;
}

export default function AgeStep({ value, onChange, onNext }: AgeStepProps) {
  const [age, setAge] = useState(value || 25);

  function handleDecrement() {
    const next = Math.max(18, age - 1);
    setAge(next);
    onChange(next);
  }

  function handleIncrement() {
    const next = Math.min(100, age + 1);
    setAge(next);
    onChange(next);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = raw === "" ? 18 : Math.min(100, Math.max(18, parseInt(raw, 10)));
    setAge(num);
    onChange(num);
  }

  return (
    <section className="mx-6 mt-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-zinc-900 text-center">Câți ani ai?</h2>
      <p className="text-sm text-zinc-400 mt-1 text-center">Vârsta ajută la calcularea nevoilor calorice</p>

      <div className="mt-10 flex items-center gap-6">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
        >
          <Minus className="h-6 w-6 text-emerald-600" />
        </button>

        <div className="flex flex-col items-center">
          <input
            type="text"
            inputMode="numeric"
            value={age}
            onChange={handleInputChange}
            className="w-28 text-center text-6xl font-bold text-zinc-900 bg-transparent outline-none"
          />
          <span className="text-sm text-zinc-400 mt-1">ani</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/70 bg-white/20 shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6 text-emerald-600" />
        </button>
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