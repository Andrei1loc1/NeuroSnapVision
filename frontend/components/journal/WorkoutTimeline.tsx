"use client";

import { useEffect, useState } from "react";
import { Clock, Dumbbell, Flame, Bike, Footprints, StretchHorizontal, Trophy, Zap, ArrowRight } from "lucide-react";
import type { WorkoutLog } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { getStoredProfile } from "@/lib/auth/profile";

const TYPE_LABELS: Record<string, string> = {
  strength: "Forță",
  cardio: "Cardio",
  mobility: "Mobilitate",
  sport: "Sport",
  walk: "Mers",
  other: "Altul",
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  strength: Dumbbell,
  cardio: Bike,
  mobility: StretchHorizontal,
  sport: Trophy,
  walk: Footprints,
  other: Zap,
};

const TYPE_METS: Record<WorkoutLog["type"], number> = {
  strength: 5,
  cardio: 7,
  mobility: 2.5,
  sport: 6,
  walk: 3.5,
  other: 4,
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

function estimateCalories(workout: WorkoutLog, weightKg: number | null): number | null {
  if (weightKg == null || weightKg <= 0) return null;
  const mets = TYPE_METS[workout.type] ?? 4;
  return Math.round(mets * weightKg * (workout.durationMin / 60));
}

interface WorkoutTimelineProps {
  workouts: WorkoutLog[];
}

export default function WorkoutTimeline({ workouts }: WorkoutTimelineProps) {
  const [weight, setWeight] = useState<number | null>(null);

  useEffect(() => {
    const profile = getStoredProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeight(profile?.weight ?? null);
  }, []);

  if (workouts.length === 0) {
    return (
      <section className="mx-5 mt-4 pb-32">
        <div className="glass-card card-animate flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
          <p className="text-[13px] font-semibold text-zinc-700">
            Niciun antrenament azi
          </p>
          <p className="flex items-center gap-1 text-[12px] italic text-zinc-400">
            Adaugă un antrenament mai sus
            <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400" />
          </p>
        </div>
      </section>
    );
  }

  const totalCalories = weight != null
    ? workouts.reduce((sum, w) => sum + (estimateCalories(w, weight) ?? 0), 0)
    : null;
  const totalIntensityScore = workouts.reduce((sum, w) => sum + w.durationMin * w.intensity, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMin, 0);

  return (
    <section className="mx-5 mt-4 pb-32">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-500">
          {workouts.length} antrenament{workouts.length > 1 ? "e" : ""}
        </span>
        <div className="flex items-center gap-3">
          {totalCalories != null ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Flame className="h-3.5 w-3.5" />
              {Math.round(totalCalories)} kcal
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
              <Zap className="h-3.5 w-3.5" />
              Scor {totalIntensityScore}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
            <Clock className="h-3.5 w-3.5" />
            {totalMinutes} min
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[14px] top-4 bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500 from-[0%] via-emerald-500 via-[87%] to-transparent" />

        <div className="space-y-6">
          {workouts.map((workout) => {
            const TypeIcon = TYPE_ICONS[workout.type] ?? Zap;
            const calories = estimateCalories(workout, weight);
            return (
            <div key={workout.id} className="relative grid grid-cols-[28px_1fr] gap-4">
              <div className="relative z-10 flex justify-center pt-1.5">
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white/60">
                  <Dumbbell className="h-2 w-2 text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex h-6 items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200/50">
                    {TYPE_LABELS[workout.type] ?? workout.type}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(workout.createdAt)}
                  </span>
                </div>

                <div className="glass-card card-animate rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold tracking-tight text-zinc-800">
                        {TYPE_LABELS[workout.type] ?? workout.type}
                      </p>
                      <p className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>{workout.durationMin} min</span>
                        <span>RPE {workout.intensity}/10</span>
                        {calories != null ? (
                          <span>~{calories} kcal</span>
                        ) : (
                          <span>scor {workout.durationMin * workout.intensity}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-200/50">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                  </div>

                  {workout.notes && (
                    <p className="mt-2 text-[11px] text-zinc-400">{workout.notes}</p>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}