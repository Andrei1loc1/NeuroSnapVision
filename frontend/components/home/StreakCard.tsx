"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

function StreakCard() {
  const { currentStreak, message } = useStreak();

  return (
    <section className="mx-6 rounded-[32px] border border-white bg-white/20 p-4 shadow-[0_24px_70px_rgba(20,83,45,0.10)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Flame className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-zinc-900">{currentStreak}</span>
            <span className="text-xs font-medium text-zinc-400">{currentStreak === 1 ? "zi" : "zile"}</span>
          </div>
          <p className="text-xs text-zinc-500">{message}</p>
        </div>
      </div>
    </section>
  );
}

export default React.memo(StreakCard);