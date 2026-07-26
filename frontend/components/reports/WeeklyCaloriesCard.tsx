"use client";

import { ArrowDown, ArrowUp, Minus, Flame } from "lucide-react";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import { Skeleton } from "@/components/ui/Skeleton";
import type { WeekOverWeekTrend } from "@/lib/types";

interface WeeklyCaloriesCardProps {
  data?: { day: string; calories: number }[];
  totalCalories?: number;
  averageDailyCalories?: number;
  weekOverWeek?: { calories?: WeekOverWeekTrend };
  variance?: number;
}

function computeVariance(values: number[]): number {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.round(Math.sqrt(squaredDiffs.reduce((s, v) => s + v, 0) / values.length));
}

export default function WeeklyCaloriesCard({
  data: propData,
  totalCalories: propTotal,
  averageDailyCalories: propAvg,
  weekOverWeek,
  variance: propVariance,
}: WeeklyCaloriesCardProps) {
  const hasData = (propData?.length ?? 0) > 0;
  const goal = NUTRITION_GOALS.CALORIES;
  const max = NUTRITION_GOALS.CALORIES;
  const totalCalories = hasData ? (propTotal ?? propData!.reduce((s, d) => s + d.calories, 0)) : null;
  const averageDailyCalories = hasData && totalCalories != null
    ? (propAvg ?? Math.round(totalCalories / Math.max(1, propData!.length)))
    : null;
  const variance = hasData ? (propVariance ?? computeVariance(propData!.map((d) => d.calories))) : null;

  const wowCalories = weekOverWeek?.calories;
  const wowDelta = wowCalories?.delta ?? 0;
  const wowDirection = wowCalories?.direction ?? "stable";
  const isCloserToGoal =
    wowDirection === "down"
      ? (averageDailyCalories ?? 0) > goal
      : (averageDailyCalories ?? 0) < goal;
  const wowColor =
    wowDirection === "stable"
      ? "text-zinc-400"
      : isCloserToGoal
        ? "text-emerald-500"
        : "text-amber-500";

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/50">
          <Flame className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Calorii Săptămâna Aceasta
        </span>
      </div>

      {!hasData ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="h-7 w-20" />
            <span className="text-[11px] font-medium text-zinc-400">kcal</span>
          </div>
          <Skeleton className="h-3 w-28" />
          <div className="flex h-32 items-end justify-between pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="flex h-24 items-end">
                  <Skeleton className="w-4 rounded-full" style={{ height: `${30 + ((i * 13) % 50)}%` }} />
                </div>
                <Skeleton className="h-3 w-4" />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-medium text-zinc-400">
            Date indisponibile — loghează mese pentru a vedea raportul
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold leading-none text-zinc-800">
              {(totalCalories ?? 0).toLocaleString("ro-RO")}
            </span>
            <span className="text-[11px] font-medium text-zinc-400">kcal</span>
          </div>

          <div className="mb-3 flex items-center gap-2">
            {averageDailyCalories != null && (
              <p className="text-[11px] font-bold text-emerald-500">
                Medie {averageDailyCalories.toLocaleString("ro-RO")} kcal/zi
              </p>
            )}
            {wowCalories && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${wowColor}`}>
                {wowDirection === "up" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : wowDirection === "down" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {wowDelta > 0 ? "+" : ""}{wowDelta.toLocaleString("ro-RO")} kcal
              </span>
            )}
          </div>

          <div className="relative h-32">
            <div className="absolute left-0 right-0 top-[28%] border-t border-dashed border-emerald-400/60" />

            <span className="absolute right-0 top-[22%] text-[11px] font-semibold text-zinc-500">
              {goal.toLocaleString("ro-RO")} Țintă
            </span>

            <div className="flex h-full items-end justify-between pt-4">
              {propData!.map((item) => (
                <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2">
                  <div className="flex h-24 items-end">
                    <div
                      className="w-4 rounded-full bg-gradient-to-t from-emerald-300 via-emerald-400 to-emerald-500 shadow-[0_6px_14px_rgba(16,185,129,0.14)]"
                      style={{ height: `${Math.max((item.calories / max) * 100, 18)}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-zinc-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {variance != null && (
            <p className="mt-3 text-center text-[11px] font-medium text-zinc-400">
              Varianță: ±{variance.toLocaleString("ro-RO")} kcal/zi
            </p>
          )}
        </>
      )}
    </section>
  );
}