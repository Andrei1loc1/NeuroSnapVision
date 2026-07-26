"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PERatioScore, FiberScore, UPFScore, FoodDiversityScore } from "@/lib/types";

interface MacroBalanceCardProps {
  data?: { name: string; value: number; color: string }[];
  peRatio?: PERatioScore;
  fiber?: FiberScore;
  upf?: UPFScore;
  foodDiversity?: FoodDiversityScore;
}

function MiniProgress({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200/60">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function MacroBalanceCard({
  data: propData,
  peRatio,
  fiber,
  upf,
  foodDiversity,
}: MacroBalanceCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const hasData = (propData?.length ?? 0) > 0;
  const data = hasData ? propData! : [];

  const peValue = peRatio?.average_pe_ratio ?? 0;
  const peTarget = peRatio?.target ?? 1.2;
  const peColor = peValue >= peTarget ? "#22c55e" : "#f59e0b";

  const fiberMeals = fiber?.fiber_meals ?? 0;
  const fiberTarget = fiber?.target ?? 14;
  const fiberColor = fiberMeals >= fiberTarget ? "#22c55e" : "#f59e0b";

  const upfPct = upf?.upf_percentage ?? 0;
  const upfColor = upfPct <= 20 ? "#22c55e" : upfPct <= 30 ? "#f59e0b" : "#ef4444";

  const divFoods = foodDiversity?.unique_foods ?? 0;
  const divTarget = foodDiversity?.target ?? 30;
  const divColor = divFoods >= divTarget ? "#22c55e" : "#f59e0b";

  const hasAnySecondary = Boolean(peRatio || fiber || upf || foodDiversity);

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[13px] font-semibold text-zinc-600">
          Balans Macro
        </p>
      </div>

      {!hasData && !hasAnySecondary ? (
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <p className="text-center text-[11px] font-medium text-zinc-400">
            Date indisponibile — loghează mese pentru a vedea raportul
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="h-36 w-36 shrink-0">
            {mounted && hasData && (
              <PieChart width={144} height={144}>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={2}
                >
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            )}
            {mounted && !hasData && (
              <div className="flex h-36 w-36 items-center justify-center">
                <Skeleton className="h-28 w-28 rounded-full" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-zinc-500">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-zinc-700">
                  {item.value}%
                </span>
              </div>
            ))}

            {peRatio && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: peColor }} />
                    <span className="text-xs font-medium text-zinc-500">P:E</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {peValue.toFixed(1)} g/100kcal
                  </span>
                </div>
                <MiniProgress value={peValue} max={peTarget * 1.5} color={peColor} />
              </div>
            )}

            {fiber && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fiberColor }} />
                    <span className="text-xs font-medium text-zinc-500">Fibre</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {fiberMeals}/{fiberTarget} mese
                  </span>
                </div>
                <MiniProgress value={fiberMeals} max={fiberTarget} color={fiberColor} />
              </div>
            )}

            {upf && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: upfColor }} />
                    <span className="text-xs font-medium text-zinc-500">Procesate</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {upfPct}%
                  </span>
                </div>
                <MiniProgress value={upfPct} max={50} color={upfColor} />
              </div>
            )}

            {foodDiversity && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: divColor }} />
                    <span className="text-xs font-medium text-zinc-500">Diversitate</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {divFoods}/{divTarget} alimente
                  </span>
                </div>
                <MiniProgress value={divFoods} max={divTarget} color={divColor} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}