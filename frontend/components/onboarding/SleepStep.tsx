"use client";

import { useState, useCallback } from "react";
import { Moon } from "lucide-react";

interface SleepStepProps {
  value: number;
  onChange: (hours: number) => void;
  onComplete: () => void;
  submitting?: boolean;
}

export default function SleepStep({ value, onChange, onComplete, submitting }: SleepStepProps) {
  const [hours, setHours] = useState(value || 7);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 4 && val <= 10) {
      setHours(val);
      onChange(val);
    }
  }, [onChange]);

  function snapAndSet() {
    const val = Math.round(hours * 2) / 2;
    setHours(val);
    onChange(val);
  }

  return (
    <section className="mx-6 mt-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-zinc-900 text-center">Câte ore dormi în medie?</h2>
      <p className="text-sm text-zinc-400 mt-1 text-center">Somnul influențează direct nutriția</p>

      <div className="mt-16 flex flex-col items-center w-full">
        <div className="flex items-center gap-3 mb-8">
          <Moon className="h-8 w-8 text-emerald-500" />
          <span className="text-6xl font-bold text-zinc-900">{hours.toFixed(1)}</span>
          <span className="text-lg text-zinc-400 mt-auto mb-2">ore</span>
        </div>

        <div className="w-full px-2 relative">
          <input
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={hours}
            onChange={handleChange}
            onMouseUp={snapAndSet}
            onTouchEnd={snapAndSet}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-emerald-200 to-emerald-500 accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-400"
          />

          <div className="flex justify-between mt-3 px-0.5">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="text-xs text-zinc-400 w-8 text-center">
                {4 + i}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-8" />

      <button
        onClick={onComplete}
        disabled={submitting}
        className="mb-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Se pregătește...
          </>
        ) : (
          "Începe călătoria"
        )}
      </button>
    </section>
  );
}