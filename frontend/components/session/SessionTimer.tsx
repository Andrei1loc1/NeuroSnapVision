"use client";

import { useEffect, useRef } from "react";
import { createSessionMetric } from "@/lib/api/four-levels";

function calculateKpiScore(durationSec: number): number {
  if (durationSec <= 120) return 100;
  if (durationSec >= 900) return 0;
  return Math.round(100 - ((durationSec - 120) / (900 - 120)) * 100);
}

export default function SessionTimer() {
  const startTimeRef = useRef<number>(0);
  const sentRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = Date.now();

    function handleEnd() {
      if (sentRef.current) return;
      sentRef.current = true;

      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const kpiScore = calculateKpiScore(durationSec);

      if (durationSec >= 5) {
        const payload = JSON.stringify({ sessionDurationSec: durationSec, kpiScore });
        navigator.sendBeacon("/api/session/metric", new Blob([payload], { type: "application/json" }));
      }
    }

    window.addEventListener("beforeunload", handleEnd);

    return () => {
      window.removeEventListener("beforeunload", handleEnd);

      if (!sentRef.current) {
        sentRef.current = true;
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (durationSec >= 5) {
          createSessionMetric({ sessionDurationSec: durationSec }).catch(() => {});
        }
      }
    };
  }, []);

  return null;
}