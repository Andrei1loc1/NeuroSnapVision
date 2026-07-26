"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSolarWindow } from "@/lib/api/four-levels";
import type { SolarWindow } from "@/lib/types";

const REFRESH_INTERVAL = 15 * 60 * 1000;

export interface UseSolarWindowResult {
  data: SolarWindow | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSolarWindow(): UseSolarWindowResult {
  const [data, setData] = useState<SolarWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSolarWindow();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcarea ferestrei solare");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSolarWindow();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Eroare la încărcarea ferestrei solare");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(() => {
      if (!cancelled) load();
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error, refetch: fetchData };
}