"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";

const WORKOUT_TYPES = [
  { key: "strength", label: "Forță" },
  { key: "cardio", label: "Cardio" },
  { key: "mobility", label: "Mobilitate" },
  { key: "sport", label: "Sport" },
  { key: "walk", label: "Mers" },
];

const DURATION_PRESETS = [20, 30, 45, 60];

interface WorkoutCardProps {
  onSave: (data: { type: string; intensity: number; durationMin: number }) => void;
  loading?: boolean;
}

export default function WorkoutCard({ onSave, loading }: WorkoutCardProps) {
  const [type, setType] = useState("strength");
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<number | null>(30);
  const [customDuration, setCustomDuration] = useState("");

  const durationMin = duration ?? (parseInt(customDuration) || 30);

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
          <Dumbbell className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Antrenament
        </span>
      </div>

      <div className="space-y-3.5">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Tip
          </p>
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all ${
                  type === t.key
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "bg-white/40 text-zinc-600 ring-1 ring-white/60 backdrop-blur-sm hover:bg-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Intensitate (RPE)
            </p>
            <span className="text-[13px] font-bold text-zinc-700">{intensity}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="mt-1 flex justify-between text-[10px] text-zinc-700">
            <span>Ușor</span>
            <span>Maxim</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Durată
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  setCustomDuration("");
                }}
                className={`rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all ${
                  duration === d && !customDuration
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "bg-white/40 text-zinc-600 ring-1 ring-white/60 backdrop-blur-sm hover:bg-white/60"
                }`}
              >
                {d} min
              </button>
            ))}
            <div className="relative">
              <input
                type="number"
                placeholder="Alt"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  setDuration(null);
                }}
                className="h-[36px] w-20 rounded-xl border border-white/40 bg-white/40 px-3 py-2 text-[12px] text-zinc-700 backdrop-blur-sm placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            onSave({ type, intensity, durationMin })
          }
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Se salvează..." : "Salvează Antrenamentul"}
        </button>
      </div>
    </section>
  );
}