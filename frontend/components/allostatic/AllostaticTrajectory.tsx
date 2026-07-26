"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { AllostaticTrajectoryPoint } from "@/lib/api/four-levels";
import { cn } from "@/utils/cn";

interface AllostaticTrajectoryProps {
  data: AllostaticTrajectoryPoint[];
  loading?: boolean;
}

function getTrendColor(trend: string | null): { stroke: string; fill: string } {
  if (trend === "improving") return { stroke: "#22c55e", fill: "#22c55e" };
  if (trend === "deteriorating") return { stroke: "#ef4444", fill: "#ef4444" };
  return { stroke: "#eab308", fill: "#eab308" };
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-medium text-zinc-700">{label}</p>
      <p className="text-sm font-semibold text-zinc-800">
        Încărcătură: {payload[0].value.toFixed(1)}
      </p>
    </div>
  );
}

export default function AllostaticTrajectory({ data, loading }: AllostaticTrajectoryProps) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const trend = safeData.length >= 2
    ? safeData[safeData.length - 1].dailyLoad < safeData[safeData.length - 2].dailyLoad
      ? "improving"
      : safeData[safeData.length - 1].dailyLoad > safeData[safeData.length - 2].dailyLoad
        ? "deteriorating"
        : "stable"
    : "stable";

  const colors = useMemo(() => getTrendColor(trend), [trend]);

  const chartData = useMemo(
    () =>
      safeData.map((p) => ({
        date: new Date(p.date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" }),
        dailyLoad: p.dailyLoad,
        cumulativeLoad: p.cumulativeLoad,
      })),
    [safeData]
  );

  if (loading) {
    return (
      <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
        <p className="mb-1 text-sm font-semibold text-zinc-600">Traiectoria Alostatică</p>
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-500" />
        </div>
      </section>
    );
  }

  if (safeData.length === 0) {
    return (
      <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
        <p className="mb-1 text-sm font-semibold text-zinc-600">Traiectoria Alostatică</p>
        <p className="mt-4 text-center text-sm text-zinc-600">
          Încă nu există suficiente date. Scanează HRV pentru a începe.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-600">Traiectoria Alostatică</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
            trend === "improving"
              ? "bg-emerald-100 text-emerald-700"
              : trend === "deteriorating"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
          )}
        >
          {trend === "improving" ? "Îmbunătățire" : trend === "deteriorating" ? "Declin" : "Stabil"}
        </span>
      </div>

      <p className="mt-1 text-xs text-zinc-700">Ultimele 30 de zile</p>

      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="allostaticGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="dailyLoad"
              stroke={colors.stroke}
              strokeWidth={2.5}
              fill="url(#allostaticGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: colors.stroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}