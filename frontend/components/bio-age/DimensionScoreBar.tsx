"use client";

import React from "react";

interface DimensionScoreBarProps {
  dimension: string;
  score: number;
  color?: string;
}

function DimensionScoreBar({
  dimension,
  score,
}: DimensionScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="rounded-[22px] border border-white/70 bg-white/20 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-600 truncate">
          {dimension}
        </span>
        <span className="text-[11px] font-bold text-emerald-600 shrink-0">
          {typeof score === "number" ? score.toFixed(1) : score}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}

export default React.memo(DimensionScoreBar);