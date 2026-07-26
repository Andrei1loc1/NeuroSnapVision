"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import type { WisdomCard } from "@/lib/types";

interface WisdomCardProps {
  card: WisdomCard;
  northStar?: string | null;
}

function WisdomCard({ card, northStar }: WisdomCardProps) {
  const actionLabel = card.action.startsWith("Evită") || card.action.startsWith("Nu ")
    ? card.action
    : card.action;

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 ring-1 ring-violet-200/50">
            <Lightbulb className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-[13px] font-semibold text-zinc-700">Direcții</p>
        </div>
        <span className="text-[10px] font-medium text-zinc-400">{card.source}</span>
      </div>

      <div className="rounded-xl bg-zinc-900/[0.02] p-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-zinc-800">{card.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{card.insight}</p>
            <p className="mt-2 text-[11px] font-semibold text-emerald-600">{actionLabel}</p>
            {northStar && (
              <p className="mt-1.5 text-[10px] italic text-emerald-500/70">
                Te apropie de: {northStar}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(WisdomCard);