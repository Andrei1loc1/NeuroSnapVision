"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { Info, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SleepNutritionCorrelation } from "@/lib/types";

interface BrainHealthCardProps {
  score?: number;
  trend?: number[];
  sleepNutrition?: SleepNutritionCorrelation;
}

export default function BrainHealthCard({
  score: propScore,
  trend: propTrend,
  sleepNutrition,
}: BrainHealthCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const hasTrend = (propTrend?.length ?? 0) >= 2;
  const data = hasTrend ? propTrend!.map((v) => ({ value: v })) : [];
  const hasScore = propScore != null && propScore > 0;
  const score = hasScore ? propScore! : null;

  return (
    <section className="glass-card card-animate relative mx-5 mt-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 ring-1 ring-violet-200/50">
              <Brain className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Sănătate Cerebrală
            </span>
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                aria-label="Mai multe informații despre scorul MIND"
                className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-700 hover:bg-zinc-100"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          {showInfo && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setShowInfo(false)}
              />
              <div className="absolute left-4 right-4 top-16 z-[100] rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl">
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Scorul MIND e bazat pe dieta MIND — un pattern alimentar validat științific care asociază anumite alimente cu sănătatea creierului pe termen lung.
                </p>
                <button onClick={() => setShowInfo(false)} className="mt-2 text-[10px] font-medium text-emerald-600">Am înțeles</button>
              </div>
            </>
          )}

          <div className="mt-2 flex items-baseline gap-1.5">
            {score != null ? (
              <span className="text-[28px] font-bold leading-none text-zinc-800">
                {score}
              </span>
            ) : (
              <Skeleton className="h-7 w-12" />
            )}
            <span className="text-[11px] font-medium text-zinc-600">
              /100
            </span>
          </div>

          <p className="mt-1.5 text-[11px] text-zinc-700">
            Scor nutriție MIND — alimente pentru creier
          </p>

          {score == null && !hasTrend && (
            <p className="mt-1 text-[11px] font-medium text-zinc-500">
              Date indisponibile — loghează mese pentru a vedea scorul
            </p>
          )}

          {sleepNutrition && (
            <p className="mt-1 text-[11px] font-medium text-zinc-700">
              {sleepNutrition.correlation_detected
                ? "Mesele târzii îți afectează somnul"
                : "Nu s-a detectat un pattern"}
            </p>
          )}
        </div>

        <div className="h-20 w-32 shrink-0">
          {mounted && hasTrend ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="brainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#brainGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Skeleton className="h-12 w-28" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}