"use client";

import { Clock, Flame, ArrowRight } from "lucide-react";
import DeleteMealButton from "@/components/journal/DeleteMealButton";

export type JournalMeal = {
    id: string;
    time: string;
    label: string;
    title: string;
    calories: number;
    image?: string | null;
    macros: string;
    portionSize?: string | null;
    metabolicMultiplier?: number | null;
    stressMultiplier?: number | null;
};

type MealTimelineProps = {
    meals: JournalMeal[];
    onMealDeleted?: (id: string) => void;
};

export default function MealTimeline({ meals, onMealDeleted }: MealTimelineProps) {
    function handleDeleted(mealId: string) {
        onMealDeleted?.(mealId);
    }

    if (meals.length === 0) {
        return (
            <section className="mx-5 mt-4 pb-32">
                <div className="glass-card card-animate flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
                    <p className="text-[13px] font-semibold text-zinc-700">
                        Nicio masă înregistrată azi
                    </p>
                    <p className="flex items-center gap-1 text-[12px] italic text-zinc-400">
                        Scanează o masă pentru a o adăuga
                        <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400" />
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-5 mt-4 pb-32">
            <div className="relative">
                <div className="absolute left-[14px] top-4 bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500 from-[0%] via-emerald-500 via-[87%] to-transparent" />

                <div className="space-y-6">
                    {meals.map((meal) => (
                        <div key={meal.id} className="relative grid grid-cols-[28px_1fr] gap-4">
                            <div className="relative z-10 flex justify-center pt-1.5">
                                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white/60" />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 flex h-6 items-center gap-2">
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200/50">
                                        {meal.label}
                                    </span>
                                    {meal.portionSize && (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200/50">
                                            {meal.portionSize}
                                        </span>
                                    )}

                                    <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {meal.time}
                                    </span>

                                    {meal.metabolicMultiplier != null && meal.metabolicMultiplier > 1.0 && (
                                        <span className="group relative flex items-center" title={meal.metabolicMultiplier >= 1.3 ? "Impact metabolic semnificativ — masă tardivă" : "Impact metabolic ușor crescut"}>
                                            <span className={`h-2 w-2 rounded-full ${meal.metabolicMultiplier >= 1.3 ? "bg-red-400" : "bg-amber-400"}`} />
                                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-max rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                                                {meal.metabolicMultiplier >= 1.3 ? "Impact metabolic semnificativ — masă tardivă" : "Impact metabolic ușor crescut"}
                                            </span>
                                        </span>
                                    )}

                                    {meal.stressMultiplier != null && meal.stressMultiplier > 1.0 && (
                                        <span className="group relative flex items-center" title={meal.stressMultiplier >= 1.3 ? "Masă logată în stare de stres — impact metabolic crescut" : "Masă logată în stare de ușoară tensiune"}>
                                            <span className={`h-2 w-2 rounded-full ${meal.stressMultiplier >= 1.3 ? "bg-blue-500" : "bg-blue-400"}`} />
                                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-max rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                                                {meal.stressMultiplier >= 1.3 ? "Masă logată în stare de stres — impact metabolic crescut" : "Masă logată în stare de ușoară tensiune"}
                                            </span>
                                        </span>
                                    )}
                                </div>

                                <div className="glass-card card-animate relative overflow-hidden rounded-2xl p-4">
                                    <DeleteMealButton
                                        mealId={meal.id}
                                        mealTitle={meal.title}
                                        onDeleted={handleDeleted}
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-white/80 shadow-sm">
                                             {/* eslint-disable-next-line @next/next/no-img-element */}
                                             <img
                                                 src={meal.image ?? "/images/pizza.jpg"}
                                                 alt={meal.title}
                                                 className="h-full w-full object-cover"
                                             />
                                        </div>

                                        <div className="min-w-0 flex-1 pr-8">
                                            <h3 className="truncate text-[15px] font-semibold tracking-tight text-zinc-800">
                                                {meal.title}
                                            </h3>

                                            <p className="mt-1.5 flex items-center gap-1 text-[13px] font-bold text-emerald-500">
                                                <Flame className="h-3.5 w-3.5 fill-emerald-500" />
                                                {Math.round(meal.calories)} kcal
                                            </p>

                                            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                                                {meal.macros}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}