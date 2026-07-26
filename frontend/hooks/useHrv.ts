"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchHrvStatus,
  fetchAllostaticSnapshot,
  fetchAllostaticTrajectory,
  createHrvReading,
  type HrvStatus as ApiHrvStatus,
  type AllostaticSnapshot as ApiAllostaticSnapshot,
  type AllostaticTrajectoryPoint,
} from "@/lib/api/four-levels";

const STATUS_REFRESH_MS = 5 * 60 * 1000;

export interface UseHrvResult {
  hrvStatus: ApiHrvStatus | null;
  allostaticSnapshot: ApiAllostaticSnapshot | null;
  allostaticTrajectory: AllostaticTrajectoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  submitReading: (data: { sdnn: number; rmssd: number; stressLevel: number }) => Promise<void>;
}

export function useHrv(): UseHrvResult {
  const [hrvStatus, setHrvStatus] = useState<ApiHrvStatus | null>(null);
  const [allostaticSnapshot, setAllostaticSnapshot] = useState<ApiAllostaticSnapshot | null>(null);
  const [allostaticTrajectory, setAllostaticTrajectory] = useState<AllostaticTrajectoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [status, snapshot, trajectory] = await Promise.allSettled([
        fetchHrvStatus(),
        fetchAllostaticSnapshot(),
        fetchAllostaticTrajectory(30),
      ]);
      if (status.status === "fulfilled") setHrvStatus(status.value);
      if (snapshot.status === "fulfilled") setAllostaticSnapshot(snapshot.value);
      if (trajectory.status === "fulfilled") setAllostaticTrajectory(Array.isArray(trajectory.value) ? trajectory.value : []);
    } catch {
      setError("Nu s-au putut încărca datele HRV");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      fetchHrvStatus()
        .then((res) => {
          if (mounted) setHrvStatus(res);
        })
        .catch(() => {});
    }, STATUS_REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const submitReading = useCallback(
    async (data: { sdnn: number; rmssd: number; stressLevel: number }) => {
      await createHrvReading({
        sdnn: data.sdnn,
        rmssd: data.rmssd,
        stressLevel: data.stressLevel,
        source: "ppg_optical",
        sessionDurationSec: 30,
      });
      await fetchAll();
    },
    [fetchAll]
  );

  return {
    hrvStatus,
    allostaticSnapshot,
    allostaticTrajectory,
    loading,
    error,
    refetch: fetchAll,
    submitReading,
  };
}