"use client";

import { useState, useEffect, useCallback } from "react";
import { getWeeklyMovementQuality, logWorkout as apiLogWorkout } from "@/lib/api/bio-age";
import { apiFetch } from "@/lib/api/client";
import type { MovementQuality, WorkoutLog } from "@/lib/types";

export interface UseWorkoutResult {
  loading: boolean;
  error: string | null;
  movementQuality: MovementQuality | null;
  workouts: WorkoutLog[];
  logWorkout: (data: {
    date: string;
    type: string;
    intensity: number;
    duration_min: number;
    notes?: string;
  }) => Promise<WorkoutLog | null>;
}

async function fetchWorkouts(userId: string): Promise<WorkoutLog[]> {
  try {
    const res = await apiFetch<{ data: { workouts: WorkoutLog[] } }>(
      `/api/bio-age/workout/list?user_id=${encodeURIComponent(userId)}`
    );
    return res.data.workouts;
  } catch {
    return [];
  }
}

export function useWorkout(userId: string | null): UseWorkoutResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movementQuality, setMovementQuality] = useState<MovementQuality | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setMovementQuality(null);
          setWorkouts([]);
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [mqResult, workoutList] = await Promise.all([
          getWeeklyMovementQuality(userId),
          fetchWorkouts(userId),
        ]);
        if (!cancelled) {
          setMovementQuality(mqResult);
          setWorkouts(workoutList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load workout data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const logWorkout = useCallback(
    async (data: {
      date: string;
      type: string;
      intensity: number;
      duration_min: number;
      notes?: string;
    }): Promise<WorkoutLog | null> => {
      if (!userId) return null;
      try {
        const result = await apiLogWorkout({ user_id: userId, ...data });
        const refreshed = await getWeeklyMovementQuality(userId);
        setMovementQuality(refreshed);
        return result.workout;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log workout");
        return null;
      }
    },
    [userId]
  );

  return { loading, error, movementQuality, workouts, logWorkout };
}