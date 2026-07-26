"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Sun, Moon, Sunset, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SolarWindow } from "@/lib/types";
import { useSolarWindow } from "@/hooks/useSolarWindow";

const PHASE_CONFIG: Record<
  SolarWindow["phase"],
  { icon: typeof Sun; gradient: string; barColor: string; label: string; message: (eff: number) => string }
> = {
  alert: {
    icon: Sun,
    gradient: "from-emerald-400 via-emerald-300 to-amber-300",
    barColor: "bg-emerald-500",
    label: "Fereastră Activă",
    message: (eff) =>
      `Fereastra metabolică deschisă · ${Math.round(eff)}% eficiență`,
  },
  transition: {
    icon: Sunset,
    gradient: "from-amber-400 via-amber-300 to-orange-300",
    barColor: "bg-amber-500",
    label: "Tranziție",
    message: (eff) =>
      `Fereastra se închide · Impact +${Math.round(eff)}% pentru mesele târzii`,
  },
  "wind-down": {
    icon: Moon,
    gradient: "from-indigo-400 via-indigo-300 to-slate-300",
    barColor: "bg-indigo-500",
    label: "Închidere",
    message: () =>
      "Fereastra s-a închis · Corpul se pregătește de somn",
  },
  sleep: {
    icon: Moon,
    gradient: "from-slate-500 via-slate-400 to-slate-300",
    barColor: "bg-slate-500",
    label: "Somn",
    message: () =>
      "Corpul doarme · Mâncarea acum are impact maxim negativ",
  },
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getTimeRemaining(endIso: string): string | null {
  try {
    const end = new Date(endIso).getTime();
    if (isNaN(end)) return null;
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  } catch {
    return null;
  }
}

interface SolarWindowIndicatorProps {
  className?: string;
}

function SolarWindowIndicator({ className }: SolarWindowIndicatorProps) {
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { data, loading, error } = useSolarWindow();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className={cn("glass-card card-animate mx-5 mt-2 p-4", className)}>
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-200/50" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-zinc-200/50" />
            <div className="h-3 w-36 rounded-full bg-zinc-200/50" />
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-zinc-200/50" />
      </section>
    );
  }

  if (loading) {
    return (
      <section className={cn("glass-card card-animate mx-5 mt-2 p-4", className)}>
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-200/50" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-zinc-200/50" />
            <div className="h-3 w-36 rounded-full bg-zinc-200/50" />
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-zinc-200/50" />
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("glass-card card-animate mx-5 mt-2 p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200/50 text-zinc-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-zinc-800">
              Fereastră Metabolică
            </p>
            <p className="text-[11px] text-zinc-700">
              Setează locația pentru a activa fereastra circadiană
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const phase = (data.phase || "alert") as SolarWindow["phase"];
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.alert;
  const Icon = config.icon;
  const efficiency = data.currentMetabolicEfficiency ?? 0;
  const remaining =
    data.optimalEatingWindow && (phase === "alert" || phase === "transition")
      ? getTimeRemaining(data.optimalEatingWindow.end)
      : null;

  const phaseIconBg = {
    alert: "bg-emerald-50 ring-1 ring-emerald-200/50 text-emerald-600",
    transition: "bg-amber-50 ring-1 ring-amber-200/50 text-amber-600",
    "wind-down": "bg-indigo-50 ring-1 ring-indigo-200/50 text-indigo-500",
    sleep: "bg-slate-50 ring-1 ring-slate-200/50 text-slate-500",
  }[phase] ?? "bg-emerald-50 ring-1 ring-emerald-200/50 text-emerald-600";

  const phaseTextColor = {
    alert: "text-emerald-600",
    transition: "text-amber-600",
    "wind-down": "text-indigo-500",
    sleep: "text-slate-500",
  }[phase] ?? "text-emerald-600";

  return (
    <section
      data-circadian-phase={data.phase}
      className={cn("glass-card card-animate relative mx-5 mt-2 p-4 transition-all duration-[30s] ease-in-out", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", phaseIconBg)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Fereastră Metabolică
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  aria-label="Mai multe informații despre fereastra metabolică"
                  className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-700 hover:bg-zinc-100"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-[13px] font-semibold text-zinc-800">
              {config.label}
            </p>
          </div>
        </div>

        {showInfo && (
          <>
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setShowInfo(false)}
            />
            <div className="absolute left-4 right-4 top-16 z-[100] rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl animate-in fade-in duration-200">
              <p className="text-[11px] leading-relaxed text-zinc-600">
                Corpul procesează mâncarea diferit în funcție de ora solară. Această fereastră arată când metabolismul e mai eficient — mesele în fereastra optimă au impact mai mic asupra vârstei biologice.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-2 text-[10px] font-medium text-emerald-600"
              >
                Am înțeles
              </button>
            </div>
          </>
        )}

        <div className="text-right">
          <span className={cn("text-[28px] font-bold leading-none tracking-tight", phaseTextColor)}>
            {Math.round(efficiency)}
            <span className="text-[13px] font-medium text-zinc-600">%</span>
          </span>
          <p className="text-[10px] text-zinc-700">eficiență</p>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-900/[0.04]">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            config.gradient,
          )}
          style={{ width: `${Math.max(2, efficiency)}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-700">
        <span>
          {data.optimalEatingWindow
            ? `${formatTime(data.optimalEatingWindow.start)} – ${formatTime(data.optimalEatingWindow.end)}`
            : "Fereastră indisponibilă"}
        </span>
        {remaining && (
          <span className="font-medium text-zinc-700" suppressHydrationWarning>
            {remaining} rămas
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-700">
        {config.message(efficiency)}
      </p>
    </section>
  );
}

export default React.memo(SolarWindowIndicator);