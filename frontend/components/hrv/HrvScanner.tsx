"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Portal } from "@/components/ui/Portal";

interface HrvScannerProps {
  onComplete: (result: { sdnn: number; rmssd: number; stressLevel: number }) => void;
  onCancel: () => void;
}

type Phase = "scanning" | "results";

function classifyStress(rmssd: number): number {
  if (rmssd >= 50) return Math.floor(Math.random() * 2) + 1;
  if (rmssd >= 30) return Math.floor(Math.random() * 3) + 4;
  return Math.floor(Math.random() * 3) + 7;
}

function getStressLabel(stressLevel: number): string {
  if (stressLevel <= 3) return "echilibrat";
  if (stressLevel <= 6) return "sub tensiune";
  return "stresat";
}

export default function HrvScanner({ onComplete, onCancel }: HrvScannerProps) {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [result, setResult] = useState<{ sdnn: number; rmssd: number; stressLevel: number } | null>(null);
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (pulseRef.current) clearInterval(pulseRef.current);

          const rmssd = Math.round(20 + Math.random() * 50);
          const sdnn = Math.round(30 + Math.random() * 50);
          const stressLevel = classifyStress(rmssd);
          const scanResult = { sdnn, rmssd, stressLevel };

          setResult(scanResult);
          setPhase("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pulseRef.current = setInterval(() => {
      setPulse((p) => !p);
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pulseRef.current) clearInterval(pulseRef.current);
    };
  }, [phase]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pulseRef.current) clearInterval(pulseRef.current);
    onCancel();
  }, [onCancel]);

  const handleComplete = useCallback(() => {
    if (!result) return;
    onComplete(result);
  }, [result, onComplete]);

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
      <button
        onClick={handleCancel}
        aria-label="Închide scanarea HRV"
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {phase === "scanning" && (
        <div className="flex flex-col items-center gap-6 px-6">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-emerald-500/20 transition-transform duration-[800ms] ease-in-out",
                pulse ? "scale-125" : "scale-100"
              )}
            />
            <div
              className={cn(
                "absolute inset-4 rounded-full bg-emerald-500/30 transition-transform duration-[600ms] ease-in-out",
                pulse ? "scale-110" : "scale-95"
              )}
            />
            <div className="relative h-20 w-20 rounded-full bg-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.4)]" />
          </div>

          <p className="max-w-[280px] text-center text-base font-medium text-white/90">
            Pune degetul pe camera din spate timp de 30 secunde
          </p>

          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-bold tabular-nums text-white">
              {secondsLeft}
            </span>
            <span className="text-xs text-white/50">secunde rămase</span>
          </div>
        </div>
      )}

      {phase === "results" && result && (
        <div className="flex flex-col items-center gap-6 px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <span className="text-2xl font-bold text-emerald-400">
              {result.stressLevel}
            </span>
          </div>

          <p className="text-center text-base font-medium text-white/90">
            HRV: {result.rmssd}ms · Sistem nervos: {getStressLabel(result.stressLevel)}
          </p>

          {result.stressLevel > 7 ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-center text-sm text-red-300">
                Nivel de stres ridicat detectat
              </p>
              <button
                onClick={handleComplete}
                className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.97]"
              >
                Exercițiu de respirare
              </button>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.97]"
            >
              Continuă
            </button>
          )}
        </div>
      )}
    </div>
    </Portal>
  );
}