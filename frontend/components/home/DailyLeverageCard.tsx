"use client";

import { Check, Lightbulb, Utensils, Moon, Heart, Dumbbell, Sun, Brain } from "lucide-react";
import type { LeveragePoint, InterventionEfficacy } from "@/lib/types";
import React, { useState, useEffect } from "react";
import { getUserItem, setUserItem } from "@/lib/auth/userStorage";

const COACH_KEY = "neurosnap_daily_coach";
const LEVERAGE_DONE_KEY = "neurosnap_leverage_done";

const DIMENSION_ICONS: Record<string, typeof Utensils> = {
  nutrition: Utensils,
  sleep: Moon,
  ans: Heart,
  movement: Dumbbell,
  light: Sun,
  subjective: Brain,
};

const DIMENSION_COLORS: Record<string, { bg: string; icon: string; text: string; ring: string; gradient: string }> = {
  nutrition: { bg: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200/50", gradient: "from-emerald-50 to-emerald-100/40 border-emerald-200/50" },
  sleep: { bg: "bg-indigo-50", icon: "text-indigo-500", text: "text-indigo-700", ring: "ring-indigo-200/50", gradient: "from-indigo-50 to-indigo-100/40 border-indigo-200/50" },
  ans: { bg: "bg-rose-50", icon: "text-rose-500", text: "text-rose-700", ring: "ring-rose-200/50", gradient: "from-rose-50 to-rose-100/40 border-rose-200/50" },
  movement: { bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-700", ring: "ring-amber-200/50", gradient: "from-amber-50 to-amber-100/40 border-amber-200/50" },
  light: { bg: "bg-sky-50", icon: "text-sky-500", text: "text-sky-700", ring: "ring-sky-200/50", gradient: "from-sky-50 to-sky-100/40 border-sky-200/50" },
  subjective: { bg: "bg-violet-50", icon: "text-violet-500", text: "text-violet-700", ring: "ring-violet-200/50", gradient: "from-violet-50 to-violet-100/40 border-violet-200/50" },
};

const FALLBACK_BRIDGES: Record<string, string> = {
  nutrition: "Fiecare masă e un pas spre visul tău.",
  sleep: "Odihna de azi e puterea de mâine.",
  ans: "Calmul tău de azi e claritatea de mâine.",
  movement: "Fiecare pas te duce mai aproape.",
  light: "Ritmul tău circadian e busola sănătății.",
  subjective: "Sensul se construiește, nu se găsește.",
};

interface DailyLeverageCardProps {
  leveragePoint: LeveragePoint | null;
  efficacy?: InterventionEfficacy | null;
}

function DailyLeverageCard({ leveragePoint }: DailyLeverageCardProps) {
  const [completed, setCompleted] = useState(false);
  const [leverageBridge, setLeverageBridge] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = getUserItem(LEVERAGE_DONE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === today) setCompleted(true);

    try {
      const cached = getUserItem(COACH_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today && parsed.leverageBridge) {
          setLeverageBridge(parsed.leverageBridge);
        }
      }
    } catch (err) {
      console.warn("[DailyLeverageCard] failed to parse cached coach data", err);
    }
  }, []);

  function handleComplete() {
    const today = new Date().toISOString().split("T")[0];
    setUserItem(LEVERAGE_DONE_KEY, today);
    setCompleted(true);
  }

  const dimension = leveragePoint?.dimension ?? "nutrition";
  const action = leveragePoint?.action ?? "Completează check-in-ul de dimineață";
  const projectedImpact = leveragePoint?.projectedImpact ?? -0.02;
  const Icon = DIMENSION_ICONS[dimension] ?? Brain;
  const colors = DIMENSION_COLORS[dimension] ?? DIMENSION_COLORS.nutrition;

  const dashIdx = action.indexOf(" — ");
  const mainAction = dashIdx > 0 ? action.slice(0, dashIdx) : action;

  const coachLine = leverageBridge ?? FALLBACK_BRIDGES[dimension] ?? FALLBACK_BRIDGES.nutrition;

  return (
    <section className={`glass-card card-animate mx-5 mt-2 rounded-2xl border bg-gradient-to-r ${colors.gradient} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ring-1 ${colors.ring}`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Impactul Zilei
          </p>
          <p className="text-[13px] font-semibold text-zinc-800 leading-snug">
            {mainAction}
          </p>
        </div>

        <span className={`shrink-0 rounded-full ${colors.bg} ring-1 ${colors.ring} px-2 py-0.5 text-[11px] font-bold ${colors.text}`}>
          {projectedImpact.toFixed(2)} ani/an
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-white/40 px-3 py-2">
        <Lightbulb className="h-3 w-3 shrink-0 text-amber-500" />
        <p className="text-[11px] leading-snug text-zinc-600 italic">
          {coachLine}
        </p>
      </div>

      <button
        onClick={handleComplete}
        disabled={completed}
        className={`group mt-2.5 flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.97] ${
          completed
            ? "bg-emerald-50 text-emerald-600"
            : `${colors.bg} ${colors.text} ring-1 ${colors.ring} hover:shadow-sm`
        }`}
      >
        <Check className={`h-3 w-3 ${completed ? "text-emerald-500" : colors.icon}`} />
        {completed ? "Completat" : "Marchează ca Făcut"}
      </button>
    </section>
  );
}

export default React.memo(DailyLeverageCard);