"use client";

import React, { useState } from "react";
import { Moon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SleepScoreCardProps {
  score: number;
  trend?: number[];
  insight?: string;
}

function getInsight(score: number): string {
  if (score <= 30) return "Somnul tău e sub prag. Prioritizează ora de culcare.";
  if (score <= 50) return "Somn de calitate redusă. Redu ecranele seara.";
  if (score <= 70) return "Somn decent. Routine-ul de seară face diferența.";
  if (score <= 85) return "Somn bun! Menține consistența.";
  return "Somn excelent. Păstrează obiceiurile actuale.";
}

function SleepScoreCard({ score, trend, insight }: SleepScoreCardProps) {
  const hasData = score > 0;

  const fallbackData = useState(() =>
    Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, score - 10 + Math.round(Math.random() * 20) - 10 + i * 2),
    }))
  )[0];

  const data = trend && trend.length > 0
    ? trend.map((v) => ({ value: v }))
    : hasData
      ? fallbackData
      : [];

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-200/50">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <p className="text-[13px] font-semibold text-zinc-700">Odihnă</p>
          </div>

          {hasData ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="bg-gradient-to-br from-indigo-600 to-indigo-400 bg-clip-text text-3xl font-bold leading-none tracking-tight text-transparent">
                  {score}
                </span>
                <span className="text-[13px] font-medium text-zinc-400">/100</span>
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                {insight ?? getInsight(score)}
              </p>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-zinc-400">
              Completează check-in-ul de dimineață pentru a vedea scorul de somn.
            </p>
          )}
        </div>

        {hasData && data.length > 0 && (
          <div className="ml-2 h-16 w-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#sleepGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

export default React.memo(SleepScoreCard);