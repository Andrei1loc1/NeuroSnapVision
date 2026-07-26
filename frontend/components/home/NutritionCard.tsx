"use client";

import React from "react";
import { Utensils } from "lucide-react";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";

interface NutritionCardProps {
  consumed?: number;
  goal?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  nutritionScore?: number;
}

function NutritionCard({
  consumed: propConsumed = 0,
  goal: propGoal,
  proteinGrams = 0,
  carbsGrams = 0,
  fatGrams = 0,
  nutritionScore,
}: NutritionCardProps) {
  const goal = propGoal ?? NUTRITION_GOALS.CALORIES;
  const percent = Math.round((propConsumed / goal) * 100);

  const macros = [
    { label: "Proteină", value: `${Math.round(proteinGrams)}g`, pct: Math.round((proteinGrams / NUTRITION_GOALS.PROTEIN) * 100), color: "bg-emerald-400" },
    { label: "Carbo", value: `${Math.round(carbsGrams)}g`, pct: Math.round((carbsGrams / NUTRITION_GOALS.CARBS) * 100), color: "bg-amber-400" },
    { label: "Grăsimi", value: `${Math.round(fatGrams)}g`, pct: Math.round((fatGrams / NUTRITION_GOALS.FATS) * 100), color: "bg-sky-400" },
  ];

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/50">
            <Utensils className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-[13px] font-semibold text-zinc-700">Alimentație</p>
        </div>
        {nutritionScore !== undefined && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-200/50">
            {nutritionScore}/100
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-zinc-900">
          {Math.round(propConsumed).toLocaleString("ro-RO")}
        </span>
        <span className="text-[13px] font-medium text-zinc-400">
          / {goal.toLocaleString("ro-RO")} kcal
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-900/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {macros.map((macro) => (
          <div key={macro.label} className="rounded-xl bg-zinc-900/[0.02] px-2.5 py-2">
            <p className="text-[10px] font-medium text-zinc-400">{macro.label}</p>
            <p className="mt-0.5 text-[13px] font-bold text-zinc-800">{macro.value}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-900/[0.06]">
              <div
                className={`h-full rounded-full ${macro.color} transition-all duration-700`}
                style={{ width: `${Math.min(macro.pct, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(NutritionCard);