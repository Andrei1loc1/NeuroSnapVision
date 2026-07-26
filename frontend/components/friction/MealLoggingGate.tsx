"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchHrvStatus } from "@/lib/api/four-levels";
import BreathingPause from "@/components/friction/BreathingPause";

export function MealLoggingGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHrvStatus()
      .then((status) => {
        if (!cancelled) {
          if (status.needsPause) {
            setShowBreathing(true);
          } else {
            setGatePassed(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setGatePassed(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setMounted(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setShowBreathing(false);
    setGatePassed(true);
  }, []);

  const handleBreathingCancel = useCallback(() => {
    setShowBreathing(false);
    setGatePassed(true);
  }, []);

  if (!mounted || loading) {
    return null;
  }

  if (showBreathing) {
    return (
      <BreathingPause
        onComplete={handleBreathingComplete}
        onCancel={handleBreathingCancel}
      />
    );
  }

  if (!gatePassed) {
    return null;
  }

  return <>{children}</>;
}