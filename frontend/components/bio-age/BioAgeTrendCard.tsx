"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { BioAgeSnapshot } from "@/lib/types";

const PERIODS = [
  { key: "7", label: "7z", days: 7 },
  { key: "30", label: "30z", days: 30 },
  { key: "90", label: "90z", days: 90 },
  { key: "365", label: "1an", days: 365 },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

interface BioAgeTrendCardProps {
  snapshots: BioAgeSnapshot[];
  chronologicalAge: number;
}

function formatXAxis(dateStr: string, periodDays: number): string {
  const d = new Date(dateStr);
  if (periodDays <= 30) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[d.getMonth()];
}

function BioAgeTrendCard({
  snapshots,
  chronologicalAge,
}: BioAgeTrendCardProps) {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("30");

  const currentPeriod = PERIODS.find((p) => p.key === activePeriod)!;

  const filtered = useMemo(() => {
    if (snapshots.length < 2) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - currentPeriod.days);
    const result = snapshots
      .filter((s) => new Date(s.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  }, [snapshots, currentPeriod.days]);

  const chartData = useMemo(
    () =>
      filtered.map((s) => ({
        date: s.date,
        biological: s.biologicalAge,
      })),
    [filtered]
  );

  const stats = useMemo(() => {
    if (filtered.length < 2) return null;
    const current = filtered[filtered.length - 1].biologicalAge;
    const previous = filtered[0].biologicalAge;
    const delta = current - chronologicalAge;
    const trendDiff = current - previous;
    return { current, delta, trendDiff };
  }, [filtered, chronologicalAge]);

  if (snapshots.length < 2) {
    return (
      <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
        <p className="mb-3 text-sm font-semibold text-zinc-600">
          Evoluție Vârsta Stilului de Viață
        </p>
        <p className="text-center text-sm text-zinc-600 py-8">
          Completează check-in-uri pentru a vedea evoluția în timp.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
      <p className="mb-3 text-sm font-semibold text-zinc-600">
        Evoluție Vârsta Stilului de Viață
      </p>

      <div className="mb-4 flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
              activePeriod === p.key
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {chartData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatXAxis(v, currentPeriod.days)}
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Area
              type="monotone"
              dataKey="biological"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="#22c55e"
              fillOpacity={0.12}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
            />
            <ReferenceLine
              y={chronologicalAge}
              stroke="#d1d5db"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-sm text-zinc-600 py-8">
          Completează check-in-uri pentru a vedea evoluția în timp.
        </p>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/30 p-2 text-center">
            <p className="text-[10px] font-medium text-zinc-700">Curent</p>
            <p className="text-sm font-bold text-zinc-900">
              {stats.current.toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl bg-white/30 p-2 text-center">
            <p className="text-[10px] font-medium text-zinc-700">Diferență</p>
            <p
              className={`text-sm font-bold ${
                stats.delta <= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {stats.delta <= 0 ? "" : "+"}
              {stats.delta.toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl bg-white/30 p-2 text-center">
             <p className="text-[10px] font-medium text-zinc-700">Trendul Vârstei</p>
            <div className="flex items-center justify-center gap-1">
              {stats.trendDiff < -0.1 ? (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              ) : stats.trendDiff > 0.1 ? (
                <TrendingUp className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-zinc-600" />
              )}
              <p
                className={`text-sm font-bold ${
                  stats.trendDiff < -0.1
                    ? "text-emerald-500"
                    : stats.trendDiff > 0.1
                    ? "text-red-500"
                    : "text-zinc-700"
                }`}
              >
                {stats.trendDiff > 0 ? "+" : ""}
                {stats.trendDiff.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default React.memo(BioAgeTrendCard);