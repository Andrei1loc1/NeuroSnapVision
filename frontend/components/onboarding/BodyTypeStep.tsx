"use client";

import { Feather, Scale, Dumbbell } from "lucide-react";

interface BodyTypeStepProps {
  value: string;
  onChange: (bodyType: string) => void;
  onNext: () => void;
}

const OPTIONS = [
  { id: "slim", label: "Slab", description: "Siluetă zveltă, greutate mică", icon: Feather },
  { id: "medium", label: "Mediu", description: "Constituție echilibrată", icon: Scale },
  { id: "robust", label: "Robust", description: "Oase late, constituție puternică", icon: Dumbbell },
] as const;

export default function BodyTypeStep({ value, onChange, onNext }: BodyTypeStepProps) {
  return (
    <section className="mx-6 mt-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-zinc-900 text-center">Tipul tău corporal</h2>
      <p className="text-sm text-zinc-400 mt-1 text-center">Alege descrierea care se potrivește cel mai bine</p>

      <div className="mt-10 flex flex-col gap-4 w-full">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex items-center gap-4 w-full rounded-[22px] border px-6 py-5 transition-all active:scale-[0.98] ${
                selected
                  ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/10"
                  : "border-white/70 bg-white/20 shadow-sm"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected ? "bg-emerald-500/30" : "bg-white/40"}`}>
                <Icon className={`h-6 w-6 ${selected ? "text-emerald-600" : "text-zinc-500"}`} />
              </div>
              <div className="text-left">
                <span className={`text-lg font-semibold block ${selected ? "text-emerald-700" : "text-zinc-700"}`}>
                  {opt.label}
                </span>
                <span className="text-sm text-zinc-400">{opt.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-8" />

      <button
        onClick={onNext}
        disabled={!value}
        className="mb-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
      >
        Continuă
      </button>
    </section>
  );
}