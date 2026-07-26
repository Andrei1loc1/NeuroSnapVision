"use client";

import { useCallback } from "react";
import { useCache, useDataCache } from "@/lib/cache";
import {
  getTodayProtocol,
  submitMorningCheckin,
  submitEveningCheckin,
} from "@/lib/api/bio-age";
import type { DailyProtocol } from "@/lib/types";

export interface UseProtocolResult {
  loading: boolean;
  error: string | null;
  protocol: DailyProtocol | null;
  streak: number;
  submitMorning: (data: {
    date: string;
    recovery: number;
    energy: number;
    mood?: number;
    focus?: number;
  }) => Promise<void>;
  submitEvening: (data: {
    date: string;
    stress: number;
    digestion: number;
    mood?: number;
    energy?: number;
    libido?: number;
    supplements?: string[];
    last_meal_time?: string;
  }) => Promise<void>;
}

const EMPTY_RESULT = { protocol: null, streak: 0 };

export function useProtocol(userId: string | null): UseProtocolResult {
  const cacheKey = userId ? `protocol-today-${userId}` : "__no_user__";
  const cache = useDataCache();

  const { data, error, loading } = useCache(
    cacheKey,
    userId
      ? () => getTodayProtocol(userId)
      : () => Promise.resolve(EMPTY_RESULT),
  );

  const submitMorning = useCallback(
    async (data: {
      date: string;
      recovery: number;
      energy: number;
      mood?: number;
      focus?: number;
    }) => {
      if (!userId) return;
      try {
        const res = await submitMorningCheckin({
          user_id: userId,
          ...data,
        });
        cache.set(cacheKey, res);
      } catch (err) {
        cache.invalidate(cacheKey);
        throw err;
      }
    },
    [userId, cache, cacheKey],
  );

  const submitEvening = useCallback(
    async (data: {
      date: string;
      stress: number;
      digestion: number;
      mood?: number;
      energy?: number;
      libido?: number;
      supplements?: string[];
      last_meal_time?: string;
    }) => {
      if (!userId) return;
      try {
        const res = await submitEveningCheckin({
          user_id: userId,
          ...data,
        });
        cache.set(cacheKey, res);
      } catch (err) {
        cache.invalidate(cacheKey);
        throw err;
      }
    },
    [userId, cache, cacheKey],
  );

  const result = data as { protocol: DailyProtocol | null; streak: number } | null;

  if (!userId) {
    return {
      loading: false,
      error: null,
      protocol: null,
      streak: 0,
      submitMorning,
      submitEvening,
    };
  }

  return {
    loading,
    error,
    protocol: result?.protocol ?? null,
    streak: result?.streak ?? 0,
    submitMorning,
    submitEvening,
  };
}