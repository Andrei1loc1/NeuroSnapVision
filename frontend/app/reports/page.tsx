"use client";

import ReportsHeader from "@/components/reports/ReportsHeader";
import WeeklyCaloriesCard from "@/components/reports/WeeklyCaloriesCard";
import MacroBalanceCard from "@/components/reports/MacroBalanceCard";
import AiRecommendationsCard from "@/components/reports/AIRecommendationsCard";
import BrainHealthCard from "@/components/home/BrainHealthCard";
import WeeklyReportDownloadCard from "@/components/reports/WeeklyReportDownloadCard";
import { Skeleton, SkeletonChart, SkeletonText } from "@/components/ui/Skeleton";
import { useReports } from "@/hooks/useReports";
import { ArrowUp, ArrowDown, Minus, Clock, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

const macroColorMap: Record<string, string> = {
  protein: "#22c55e",
  carbs: "#38bdf8",
  fat: "#fbbf24",
};

const CARD_CLASS =
  "glass-card card-animate mx-5 mt-2 p-4";

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/60">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function formatHour(h: number | null): string {
  if (h == null) return "—";
  return `${h}:00`;
}

export default function ReportsPage() {
  const {
    weeklyCalories,
    reportData,
    loading,
    error,
    dateRangeLabel,
    totalCalories,
    averageDailyCalories,
    brainHealthScore,
    foodDiversity,
    upf,
    peRatio,
    fiber,
    nutrientTiming,
    compliance,
    sleepNutrition,
    weekOverWeek,
    smartRecommendations,
    variance,
  } = useReports();

  const macroData = reportData
    ? [
        { name: "Proteine", value: reportData.macroBalance.protein, color: macroColorMap.protein },
        { name: "Carbohidrați", value: reportData.macroBalance.carbs, color: macroColorMap.carbs },
        { name: "Grăsimi", value: reportData.macroBalance.fat, color: macroColorMap.fat },
      ]
    : undefined;

  const recs = reportData?.recommendations;

  const wowCalories = weekOverWeek?.trends?.calories_avg ?? null;

  if (loading) {
    return (
      <div className="space-y-2 pb-14">
        <div className="glass-card mx-5 mt-2 p-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>

        {/* WeeklyCaloriesCard skeleton */}
        <div className="glass-card card-animate mx-5 mt-2 p-4 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-32" />
          <SkeletonChart className="h-32" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* MacroBalanceCard skeleton */}
        <div className="glass-card card-animate mx-5 mt-2 p-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <SkeletonText lines={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F7FBF9] via-[#EAF7F1] to-[#DFF3EA]">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const isEmpty = !reportData && !weeklyCalories;

  return (
    <div className="space-y-2 pb-14">
      <ReportsHeader dateRangeLabel={dateRangeLabel} />

      {isEmpty && (
        <div className="glass-card card-animate mx-5 mt-2 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
            <TrendingUp className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-[13px] font-semibold text-zinc-600">Nu avem rapoarte săptămânale încă</p>
          <p className="mx-auto mt-1.5 max-w-[240px] text-[11px] leading-relaxed text-zinc-400">
            Loghează mese timp de câteva zile pentru a genera primul raport săptămânal.
          </p>
        </div>
      )}

      <WeeklyCaloriesCard
        data={weeklyCalories ?? undefined}
        totalCalories={totalCalories}
        averageDailyCalories={averageDailyCalories}
        weekOverWeek={wowCalories ? { calories: wowCalories } : undefined}
        variance={variance}
      />

      <MacroBalanceCard
        data={macroData}
        peRatio={peRatio ?? undefined}
        fiber={fiber ?? undefined}
        upf={upf ?? undefined}
        foodDiversity={foodDiversity ?? undefined}
      />

      {nutrientTiming && (
        <section className={CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 ring-1 ring-sky-200/50">
              <Clock className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Ritm Alimentar</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-600">Prima masă</span>
                <span className="text-[13px] font-semibold text-zinc-800">
                  {formatHour(nutrientTiming.first_meal_hour)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-600">Ultima masă</span>
                <span className="text-[13px] font-semibold text-zinc-800">
                  {formatHour(nutrientTiming.last_meal_hour)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-600">Fereastră</span>
                <span className="text-[13px] font-semibold text-zinc-800">
                  {nutrientTiming.eating_window_hours != null
                    ? `${nutrientTiming.eating_window_hours} ore`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-[22px] font-bold leading-none text-zinc-800">
                  {nutrientTiming.nutrient_timing_score}
                </span>
                <span className="text-[11px] font-medium text-zinc-600">/100</span>
              </div>
              <div className="mt-1.5 w-24">
                <ProgressBar
                  value={nutrientTiming.nutrient_timing_score}
                  max={100}
                  color={nutrientTiming.nutrient_timing_score >= 70 ? "#22c55e" : "#f59e0b"}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={CARD_CLASS}>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/50">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Consecvență</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold leading-none text-zinc-800">
                {compliance.compliance_score}
              </span>
              <span className="text-[11px] font-medium text-zinc-600">/100</span>
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-zinc-700">
              Ai urmat {compliance.followed} din {compliance.total} recomandări
            </p>
            {compliance.streak > 0 && (
              <p className="mt-0.5 text-[11px] font-bold text-emerald-500">
                {compliance.streak} zile consecutiv
              </p>
            )}
          </div>

          <div className="w-24">
            <ProgressBar
              value={compliance.compliance_score}
              max={100}
              color={compliance.compliance_score >= 70 ? "#22c55e" : "#f59e0b"}
            />
          </div>
        </div>
      </section>

      <BrainHealthCard
        score={brainHealthScore}
        sleepNutrition={sleepNutrition ?? undefined}
      />

      {weekOverWeek && Object.keys(weekOverWeek.trends).length > 0 && (
        <section className={CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">vs Săptămâna Trecută</span>
          </div>

          <div className="space-y-3">
            {Object.entries(weekOverWeek.trends).map(([key, trend]) => {
              const isUp = trend.direction === "up";
              const isDown = trend.direction === "down";
              const color = isUp ? "text-emerald-500" : isDown ? "text-amber-500" : "text-zinc-600";
              const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
              const labelMap: Record<string, string> = {
                food_diversity: "Diversitate",
                upf: "Procesate",
                pe_ratio: "P:E",
                fiber: "Fibre",
                nutrient_timing: "Ritm",
                compliance: "Consecvență",
                calories_avg: "Calorii medii",
              };

              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700">
                    {labelMap[key] ?? key}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
                    <Icon className="h-3 w-3" />
                    {trend.delta > 0 ? "+" : ""}{trend.delta}
                  </span>
                </div>
              );
            })}
          </div>

          {weekOverWeek.improving_metrics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {weekOverWeek.improving_metrics.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600"
                >
                  <TrendingUp className="h-2.5 w-2.5" />
                  {m}
                </span>
              ))}
            </div>
          )}

          {weekOverWeek.declining_metrics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {weekOverWeek.declining_metrics.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600"
                >
                  <TrendingDown className="h-2.5 w-2.5" />
                  {m}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <AiRecommendationsCard
        smartRecommendations={smartRecommendations.length > 0 ? smartRecommendations : undefined}
        recommendations={recs}
      />

      <WeeklyReportDownloadCard
        dateRangeLabel={dateRangeLabel}
        reportData={reportData}
        weeklyCalories={weeklyCalories}
        averageDailyCalories={averageDailyCalories}
        brainHealthScore={brainHealthScore}
      />
    </div>
  );
}
