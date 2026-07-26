"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchNorthStar, updateNorthStar } from "@/lib/api/four-levels";
import type { NorthStar } from "@/lib/api/four-levels";

export function usePurpose() {
  const [purpose, setPurpose] = useState<NorthStar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchNorthStar()
      .then((res: NorthStar) => {
        if (!cancelled) setPurpose(res ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load purpose");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const savePurpose = useCallback(async (data: Partial<NorthStar>) => {
    setError(null);
    try {
      const updated = await updateNorthStar(data);
      setPurpose(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save purpose";
      setError(msg);
      throw err;
    }
  }, []);

  return { purpose, loading, error, savePurpose };
}