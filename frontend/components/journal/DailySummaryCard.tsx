import React from "react";
import { Flame, Utensils } from "lucide-react";

type DailySummaryCardProps = {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    mealCount: number;
};

import { NUTRITION_GOALS } from "@/lib/constants/nutrition";

function DailySummaryCard({
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    mealCount,
}: DailySummaryCardProps) {
    const macros = [
        { label: "Proteină", value: `${Math.round(proteinGrams)}g` },
        { label: "Carbohidrați", value: `${Math.round(carbsGrams)}g` },
        { label: "Grăsimi", value: `${Math.round(fatGrams)}g` },
    ];
    const progress = Math.min((calories / NUTRITION_GOALS.CALORIES) * 100, 100);

    return (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
            <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/50">
                            <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                            Rezumatul Zilei
                        </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-[28px] font-bold leading-none text-zinc-800">
                            {Math.round(calories).toLocaleString("en-US")}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-600">
                            kcal
                        </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-zinc-700">
                        {mealCount} {mealCount === 1 ? "masă" : "mese"} astăzi
                    </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <Flame className="h-6 w-6 fill-white" />
                </div>
            </div>

            <div className="mb-3 h-2 overflow-hidden rounded-full bg-emerald-50">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="grid grid-cols-3 gap-2">
                {macros.map((macro) => (
                    <div
                        key={macro.label}
                        className="rounded-xl bg-white/40 p-2.5"
                    >
                        <p className="text-[10px] font-medium text-zinc-700">
                            {macro.label}
                        </p>
                        <p className="mt-0.5 text-[15px] font-semibold text-zinc-800">
                            {macro.value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default React.memo(DailySummaryCard);