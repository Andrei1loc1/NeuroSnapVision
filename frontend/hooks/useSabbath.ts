"use client";

import { useState, useEffect, useRef } from "react";
import { fetchSabbathStatus } from "@/lib/api/four-levels";
import type { SabbathStatus } from "@/lib/types";

interface UseSabbathResult {
  isSabbath: boolean;
  message: string;
  loading: boolean;
}

export function useSabbath(): UseSabbathResult {
  const [status, setStatus] = useState<SabbathStatus>({
    isSabbath: false,
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const result = await fetchSabbathStatus();
        if (mounted) {
          setStatus(result);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setStatus({ isSabbath: false, message: "" });
          setLoading(false);
        }
      }
    }

    check();

    const msUntilMidnight = (() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    })();

    timeoutRef.current = setTimeout(() => {
      check();
      intervalRef.current = setInterval(check, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isSabbath: status.isSabbath,
    message: status.message,
    loading,
  };
}