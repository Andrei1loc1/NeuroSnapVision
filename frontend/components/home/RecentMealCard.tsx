import React from "react";
import Image from "next/image";

interface RecentMealCardProps {
  title?: string;
  mealType?: string;
  time?: string;
  calories?: number;
  imageUrl?: string | null;
}

function RecentMealCard({ title: propTitle, mealType: propMealType, time: propTime, calories: propCalories, imageUrl }: RecentMealCardProps) {
    const title = propTitle ?? "Greek Chicken Bowl";
    const mealType = propMealType ?? "Prânz";
    const time = propTime ?? "13:20";
    const calories = propCalories ?? 560;
    return (
        <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="mb-4 text-sm font-semibold text-zinc-600">
                        Masă Recentă
                    </p>

                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-zinc-400">
                        {mealType} · {time}
                    </p>

                    <p className="mt-4 text-xl font-semibold text-zinc-900">
                        {calories} <span className="text-xs font-medium text-zinc-400">kcal</span>
                    </p>
                </div>

                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] border border-white/70 shadow-md">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Image
                            src="/images/pizza.jpg"
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

export default React.memo(RecentMealCard);
