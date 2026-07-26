"use client";

import { useMemo } from "react";
import { wisdomCards } from "@/lib/data/wisdom-cards";
import type { WisdomCard } from "@/lib/types";

function hashDateDimension(dateSeed: number, dimension: string): number {
  let h = dateSeed;
  for (let i = 0; i < dimension.length; i++) {
    h = ((h << 5) - h + dimension.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function useWisdomCard(
  dimension: string,
  score: number
): WisdomCard | null {
  return useMemo(() => {
    const eligible = wisdomCards.filter(
      (c) => c.dimension === dimension && score >= c.scoreRange[0] && score <= c.scoreRange[1]
    );

    if (eligible.length === 0) return null;

    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx = hashDateDimension(dateSeed, dimension) % eligible.length;

    return eligible[idx];
  }, [dimension, score]);
}