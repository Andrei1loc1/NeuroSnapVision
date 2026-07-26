"use client";

import { useState, useEffect } from "react";
import { useHrv } from "@/hooks/useHrv";
import { cn } from "@/utils/cn";
import { Info } from "lucide-react";

function getStressConfig(stressLevel: number) {
  if (stressLevel <= 3) return { bg: "bg-emerald-50", ring: "ring-emerald-200/50", dot: "bg-emerald-500", text: "text-emerald-700", label: "Echilibrat" };
  if (stressLevel <= 6) return { bg: "bg-amber-50", ring: "ring-amber-200/50", dot: "bg-amber-500", text: "text-amber-700", label: "Sub tensiune" };
  return { bg: "bg-rose-50", ring: "ring-rose-200/50", dot: "bg-rose-500", text: "text-rose-700", label: "Stresat" };
}

export default function StressStateBadge() {
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { hrvStatus, loading } = useHrv();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1 ring-1 ring-zinc-200/50")}>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        <span className="text-[10px] font-medium text-zinc-600">—</span>
      </div>
    );
  }

  if (loading && !hrvStatus) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1 ring-1 ring-zinc-200/50")}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-300 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-300" />
        </span>
        <span className="text-[10px] font-medium text-zinc-600">Se încarcă</span>
      </div>
    );
  }

  if (!hrvStatus) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1 ring-1 ring-zinc-200/50")}>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        <span className="text-[10px] font-medium text-zinc-600">—</span>
      </div>
    );
  }

  const config = getStressConfig(hrvStatus.latestStressLevel);

  return (
    <div className="relative">
      <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1", config.bg, config.ring)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
        <span className={cn("text-[10px] font-semibold", config.text)}>
          {config.label}
        </span>
        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Mai multe informații despre HRV"
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-zinc-600 transition-colors hover:text-zinc-800 hover:bg-white/50"
        >
          <Info className="h-2.5 w-2.5" />
        </button>
      </div>
      {showInfo && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setShowInfo(false)}
          />
          <div className="absolute right-0 top-full z-[100] mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl">
            <p className="text-[11px] leading-relaxed text-zinc-600">
              HRV (Heart Rate Variability) măsoară variația dintre bătăile inimii — un indicator al stării sistemului nervos. Valori mici = stres, valori mari = echilibru.
            </p>
            <button onClick={() => setShowInfo(false)} className="mt-2 text-[10px] font-medium text-emerald-600">Am înțeles</button>
          </div>
        </>
      )}
    </div>
  );
}