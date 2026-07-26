"use client";

import { useState, useEffect } from "react";
import { getTodayIntervention } from "@/lib/api/bio-age";
import type { LeveragePoint } from "@/lib/types";

export interface UseInterventionResult {
  loading: boolean;
  error: string | null;
  leveragePoint: LeveragePoint | null;
}

export function useIntervention(userId: string | null, age: number, northStar?: string): UseInterventionResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leveragePoint, setLeveragePoint] = useState<LeveragePoint | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setLoading(false);
          setLeveragePoint(null);
          setError(null);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getTodayIntervention(userId, age, northStar);
        if (!cancelled) setLeveragePoint(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load intervention");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, age, northStar]);

  return { loading, error, leveragePoint };
}