"use client";

import {
    Area,
    AreaChart,
    ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";

interface NutritionScoreCardProps {
  score?: number;
  trend?: number[];
}

export default function NutritionScoreCard({ score: propScore, trend: propTrend }: NutritionScoreCardProps) {
    const hasTrend = (propTrend?.length ?? 0) >= 2;
    const data = hasTrend ? propTrend!.map((v) => ({ value: v })) : [];
    const hasScore = propScore != null && propScore > 0;
    const score = hasScore ? propScore! : null;
    return (
        <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-4 text-sm font-semibold text-zinc-600">
                        Nutrition Score
                    </p>

                    <div className="flex items-end gap-1">
                        {score != null ? (
                          <span className="text-[36px] font-semibold leading-none text-zinc-900">
                            {score}
                          </span>
                        ) : (
                          <Skeleton className="h-9 w-16" />
                        )}
                        <span className="mb-1.5 text-sm font-medium text-zinc-400">
                          /100
                        </span>
                    </div>

                    <p className="mt-3 text-xs font-medium text-zinc-400">
                        {score != null
                          ? "Great job! You're on a healthy trend."
                          : "Date indisponibile — loghează mese pentru a vedea scorul."}
                    </p>
                </div>

                <div className="h-24 w-40">
                    {hasTrend ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={data}>
                              <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#22c55e"
                                  strokeWidth={3}
                                  fill="#22c55e"
                                  fillOpacity={0.12}
                                  dot={false}
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Skeleton className="h-16 w-32" />
                      </div>
                    )}
                </div>
            </div>
        </section>
    );
}