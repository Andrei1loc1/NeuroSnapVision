"use client";

import { useCache } from "@/lib/cache";
import { getCurrentBioAge } from "@/lib/api/bio-age";
import { getStoredProfile } from "@/lib/auth/profile";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import type { BioAgeSnapshot, LeveragePoint } from "@/lib/types";

export interface UseBioAgeResult {
  loading: boolean;
  error: string | null;
  bioAge: BioAgeSnapshot | null;
  leveragePoint: LeveragePoint | null;
}

export function useBioAge(userId: string | null, age: number): UseBioAgeResult {
  const cacheKey = userId ? `bio-age-snapshot-${userId}-${age}` : "__no_user__";

  const { data, error, loading } = useCache(
    cacheKey,
    userId
      ? () => {
          const profile = getStoredProfile();
          const options = {
            sex: profile?.sex,
            sleepTime: profile?.sleepTime,
            targets: {
              calories: NUTRITION_GOALS.CALORIES,
              protein: NUTRITION_GOALS.PROTEIN,
              fats: NUTRITION_GOALS.FATS,
            },
            lateMealThreshold: NUTRITION_GOALS.LATE_MEAL_HOUR,
          };
          return getCurrentBioAge(userId, age, options);
        }
      : () => Promise.resolve(null),
  );

  if (!userId) {
    return { loading: false, error: null, bioAge: null, leveragePoint: null };
  }

  const result = data as {
    bio_age_snapshot: BioAgeSnapshot;
    leverage_point: LeveragePoint;
  } | null;

  return {
    loading,
    error,
    bioAge: result?.bio_age_snapshot ?? null,
    leveragePoint: result?.leverage_point ?? null,
  };
}