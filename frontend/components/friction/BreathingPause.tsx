"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Portal } from "@/components/ui/Portal";

interface BreathingPauseProps {
  onComplete: () => void;
  onCancel: () => void;
}

type BreathPhase = "inhale" | "hold" | "exhale";

const PHASE_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const CYCLE_MESSAGES = [
  "Înainte să mănânci, respiră.",
  "Corpul tău are nevoie de liniște ca să digere.",
  "Aproape gata.",
];

const TOTAL_CYCLES = 3;

export default function BreathingPause({ onComplete, onCancel }: BreathingPauseProps) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [phaseSeconds, setPhaseSeconds] = useState(PHASE_DURATIONS.inhale);
  const [totalSeconds, setTotalSeconds] = useState(
    TOTAL_CYCLES * (PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale)
  );
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (finished) return;

    timerRef.current = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev <= 1) {
          const nextPhase: Record<BreathPhase, BreathPhase | "done"> = {
            inhale: "hold",
            hold: "exhale",
            exhale: "inhale",
          };
          const next = nextPhase[phase];

          if (next === "done") {
            setFinished(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }

          if (phase === "exhale") {
            setCycle((c) => {
              if (c + 1 >= TOTAL_CYCLES) {
                setFinished(true);
                if (timerRef.current) clearInterval(timerRef.current);
                return c;
              }
              return c + 1;
            });
          }

          setPhase(next as BreathPhase);
          return PHASE_DURATIONS[next as BreathPhase];
        }
        setTotalSeconds((t) => t - 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, finished]);

  const scaleMap: Record<BreathPhase, string> = {
    inhale: "scale-125",
    hold: "scale-125",
    exhale: "scale-75",
  };

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel();
  }, [onCancel]);

  if (finished) {
    return (
      <Portal>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1040] via-[#0f0a2e] to-[#060318]">
        <div className="flex flex-col items-center gap-6 px-6">
          <div className="h-20 w-20 rounded-full bg-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]" />
          <p className="text-2xl font-semibold text-white/90">Poți continua.</p>
          <button
            onClick={onComplete}
            className="mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.97]"
          >
            Continuă
          </button>
        </div>
      </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1040] via-[#0f0a2e] to-[#060318]">
      <button
        onClick={handleCancel}
        aria-label="Închide exercițiul de respirație"
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center gap-8 px-6">
        <p className="max-w-[280px] text-center text-lg font-medium text-white/80">
          {CYCLE_MESSAGES[cycle] ?? CYCLE_MESSAGES[2]}
        </p>

        <div className="relative flex h-48 w-48 items-center justify-center">
          <div
            className={`h-36 w-36 rounded-full bg-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-transform duration-[${PHASE_DURATIONS[phase] * 1000}ms] ease-in-out ${scaleMap[phase]}`}
            style={{ transitionDuration: `${PHASE_DURATIONS[phase] * 1000}ms` }}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-indigo-300">
            {phase === "inhale" ? "Inspiră" : phase === "hold" ? "Ține" : "Expiră"}
          </span>
          <span className="text-4xl font-bold tabular-nums text-white">
            {phaseSeconds}
          </span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < cycle ? "bg-indigo-400" : i === cycle ? "bg-indigo-400/60" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        <span className="text-xs text-white/40">{totalSeconds} secunde rămase</span>
      </div>
      </div>
    </Portal>
  );
}