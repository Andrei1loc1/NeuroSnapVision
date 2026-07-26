"use client";

import { useUser } from "@/hooks/useUser";
import JournalHeader, { type JournalTab } from "@/components/journal/JournalHeader";
import DailySummaryCard from "@/components/journal/DailySummaryCard";
import MealTimeline, { type JournalMeal } from "@/components/journal/MealTimeline";
import { MealLoggingGate } from "@/components/friction/MealLoggingGate";
import WorkoutTimeline from "@/components/journal/WorkoutTimeline";
import WorkoutCard from "@/components/workout/WorkoutCard";
import EncryptedJournalCard from "@/components/journal/EncryptedJournalCard";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, Dumbbell } from "lucide-react";
import { fetchJournalMeals } from "@/lib/api/journal";
import { logWorkout } from "@/lib/api/bio-age";
import { apiFetch } from "@/lib/api/client";
import { mapToJournalMeal, calculateDailySummary } from "@/lib/services/journal/mappers";
import type { MealData, WorkoutLog } from "@/lib/types";

export default function JournalPage() {
  const { user } = useUser();
  const router = useRouter();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JournalTab>("meals");
  const [workoutLoading, setWorkoutLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/onboarding");
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    fetchJournalMeals(start, end)
      .then((data) => setMeals(data))
      .catch(() => setMeals([]))
      .finally(() => setLoading(false));

    apiFetch<{ data: { workouts: WorkoutLog[] } }>(
      `/api/bio-age/workout/list?user_id=${encodeURIComponent(user.id)}&days=1`
    )
      .then((res) => setWorkouts(res.data.workouts))
      .catch(() => {});
  }, [user, router]);

  if (loading) {
    return (
      <div className="space-y-2 pb-14">
        <JournalHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "meals" ? (
          <>
            {/* DailySummaryCard skeleton */}
            <div className="glass-card card-animate mx-5 mt-2 p-4 space-y-2">
              <Skeleton className="h-3 w-28" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Timeline skeleton */}
            <div className="mx-5 mt-2 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card card-animate rounded-2xl p-3 flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <SkeletonText lines={2} />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === "workouts" ? (
          <div className="mx-5 mt-2 space-y-2.5">
            <div className="glass-card card-animate rounded-2xl p-4 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-card card-animate rounded-2xl p-3 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card card-animate mx-5 mt-2 p-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            <SkeletonText lines={4} />
          </div>
        )}
      </div>
    );
  }

  const summary = calculateDailySummary(meals);
  const timelineMeals: JournalMeal[] = meals.map(mapToJournalMeal);

  function handleMealDeleted(mealId: string) {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  }

  async function handleWorkoutSave(data: { type: string; intensity: number; durationMin: number }) {
    if (!user) return;
    setWorkoutLoading(true);
    try {
      const result = await logWorkout({
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        type: data.type,
        intensity: data.intensity,
        duration_min: data.durationMin,
      });
      if (result.workout) {
        setWorkouts((prev) => [...prev, result.workout]);
      }
    } catch {
    } finally {
      setWorkoutLoading(false);
    }
  }

  return (
    <div className="space-y-2 pb-14">
      <JournalHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "meals" && (
        <>
          <DailySummaryCard mealCount={meals.length} {...summary} />
          {meals.length === 0 ? (
            <div className="glass-card card-animate mx-5 mt-2 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
                <Apple className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-[13px] font-semibold text-zinc-600">Nicio masă logată azi</p>
              <p className="mx-auto mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-zinc-400">
                Scanează pentru a începe să îți track-uiesti alimentația.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60 transition-all hover:bg-emerald-100 active:scale-95"
              >
                Scanează pentru a începe
              </button>
            </div>
          ) : (
            <MealLoggingGate>
              <MealTimeline meals={timelineMeals} onMealDeleted={handleMealDeleted} />
            </MealLoggingGate>
          )}
        </>
      )}

      {activeTab === "workouts" && (
        <>
          <WorkoutCard onSave={handleWorkoutSave} loading={workoutLoading} />
          {workouts.length === 0 ? (
            <div className="glass-card card-animate mx-5 mt-2 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
                <Dumbbell className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-[13px] font-semibold text-zinc-600">Niciun antrenament azi</p>
              <p className="mx-auto mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-zinc-400">
                Loghează primul antrenament pentru a vedea impactul asupra vârstei biologice.
              </p>
            </div>
          ) : (
            <WorkoutTimeline workouts={workouts} />
          )}
        </>
      )}

      {activeTab === "reflections" && <EncryptedJournalCard />}
    </div>
  );
}