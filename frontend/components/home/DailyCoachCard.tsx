"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { fetchNorthStar } from "@/lib/api/four-levels";
import { getUserItem, setUserItem, removeUserItem } from "@/lib/auth/userStorage";

const COACH_KEY = "neurosnap_daily_coach";

interface CoachData {
  coach: string;
  dimension: string;
  leverageBridge?: string | null;
  date: string;
}

interface NorthStarResponse {
  data?: { northStar?: string } | null;
  northStar?: string;
}

function getDimensionLabel(dim: string): string {
  const labels: Record<string, string> = {
    sleep: "Somn",
    nutrition: "Alimentație",
    movement: "Mișcare",
    ans: "Stres",
    light: "Lumină",
    subjective: "Bunăstare",
  };
  return labels[dim] ?? dim;
}

function getDimensionColor(dim: string): string {
  const colors: Record<string, string> = {
    sleep: "from-indigo-50 to-indigo-100/40 border-indigo-200/50",
    nutrition: "from-emerald-50 to-emerald-100/40 border-emerald-200/50",
    movement: "from-amber-50 to-amber-100/40 border-amber-200/50",
    ans: "from-rose-50 to-rose-100/40 border-rose-200/50",
    light: "from-sky-50 to-sky-100/40 border-sky-200/50",
    subjective: "from-violet-50 to-violet-100/40 border-violet-200/50",
  };
  return colors[dim] ?? "from-zinc-50 to-zinc-100/40 border-zinc-200/50";
}

export default function DailyCoachCard() {
  const [coach, setCoach] = useState<string | null>(null);
  const [dimension, setDimension] = useState<string>("default");
  const [northStar, setNorthStar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getUserItem(COACH_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today && parsed.leverageBridge) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCoach(parsed.coach);
          setDimension(parsed.dimension);
          fetchNorthStar().then((res: NorthStarResponse) => {
            setNorthStar(res?.data?.northStar ?? res?.northStar ?? null);
          }).catch(() => {});
          setLoading(false);
          return;
        }
        if (parsed.date !== today || !parsed.leverageBridge) {
          removeUserItem(COACH_KEY);
        }
      } catch {
        removeUserItem(COACH_KEY);
      }
    }

    fetch("/api/purpose/daily-coach", { method: "POST" })
      .then((res) => res.json())
      .then((coachResult: { data?: CoachData } | null) => {
        if (coachResult?.data) {
          setCoach(coachResult.data.coach);
          setDimension(coachResult.data.dimension);
          setUserItem(
            COACH_KEY,
            JSON.stringify({
              coach: coachResult.data.coach,
              dimension: coachResult.data.dimension,
              leverageBridge: coachResult.data.leverageBridge ?? null,
              date: new Date().toISOString().split("T")[0],
            })
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    fetchNorthStar()
      .then((res: NorthStarResponse) => {
        setNorthStar(res?.data?.northStar ?? res?.northStar ?? null);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="mx-5 mt-2">
        <div className="h-[72px] animate-pulse rounded-2xl bg-zinc-200/30" />
      </div>
    );
  }

  if (!coach) return null;

  return (
    <div className={`mx-5 mt-2 rounded-2xl border bg-gradient-to-r ${getDimensionColor(dimension)} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm">
          <Star className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-zinc-800">
            {coach}
          </p>
          {northStar && (
            <p className="mt-1 text-[10px] text-zinc-500">
              ★ {northStar}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-zinc-400">
          {getDimensionLabel(dimension)}
        </span>
        <span className="text-[10px] text-zinc-300">·</span>
        <span className="text-[10px] text-zinc-400">Focusul zilei</span>
      </div>
    </div>
  );
}