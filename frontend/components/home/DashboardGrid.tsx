"use client";

import { useState, useEffect } from "react";
import { Heart, Moon, Utensils, Compass, Activity, ArrowRight } from "lucide-react";
import MiniCard from "./MiniCard";
import { useBioAge } from "@/hooks/useBioAge";
import { useUser } from "@/hooks/useUser";
import { useHomeData } from "@/hooks/useHomeData";
import { apiFetch } from "@/lib/api/client";

function SleepMiniCard() {
  const { user } = useUser();
  const userAge = (user as { age?: number } | null)?.age ?? 30;
  const { bioAge } = useBioAge(user?.id ?? null, userAge);
  const score = bioAge?.sleepScore ?? 0;

  return (
    <MiniCard
      icon={<Moon className="h-3.5 w-3.5 text-indigo-500" />}
      label="Odihnă"
      value={score > 0 ? `${score}` : "Loghează somnul"}
      subtitle={score > 0 ? "/100" : undefined}
      href="/protocol"
      color="bg-indigo-50 ring-1 ring-indigo-200/50"
    />
  );
}

function HrvScanCard({ onScan, stressLevel }: { onScan: () => void; stressLevel?: number | null }) {
  const hasData = stressLevel != null;
  const label = hasData ? (stressLevel! <= 3 ? "Echilibrat" : stressLevel! <= 6 ? "Tensiune" : "Stresat") : "Măsoară HRV";

  return (
    <button
      onClick={onScan}
      className="flex w-full items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3.5 text-left ring-1 ring-rose-200/50 transition-all hover:bg-rose-100/60 active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/60">
        <Activity className="h-5 w-5 text-rose-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">HRV</p>
        {hasData ? (
          <p className="text-[14px] font-semibold text-zinc-800 leading-tight">{label}</p>
        ) : (
          <p className="flex items-center gap-1 text-[13px] italic leading-tight text-zinc-400">
            {label}
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </p>
        )}
      </div>
    </button>
  );
}

function NutritionMiniCard() {
  const { totals } = useHomeData();

  return (
    <MiniCard
      icon={<Utensils className="h-3.5 w-3.5 text-emerald-500" />}
      label="Alimentație"
      value={totals.calories > 0 ? `${Math.round(totals.calories)}` : "Loghează o masă"}
      subtitle={totals.calories > 0 ? "kcal" : undefined}
      href="/journal"
      color="bg-emerald-50 ring-1 ring-emerald-200/50"
    />
  );
}

function AlignmentMiniCard() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ data: { alignmentScore: number } | null }>("/api/purpose/alignment")
      .then((res: { data?: { alignmentScore?: number } | { alignmentScore?: number } | null }) => {
        const s = res?.data?.alignmentScore ?? (res as { alignmentScore?: number })?.alignmentScore;
        if (s != null) setScore(Math.round(s));
      })
      .catch(() => {});
  }, []);

  return (
    <MiniCard
      icon={<Compass className="h-3.5 w-3.5 text-amber-500" />}
      label="Aliniere"
      value={score !== null ? `${score}` : "Setează-ți North Star"}
      subtitle={score !== null ? "/100" : undefined}
      href="/vision-ai"
      color="bg-amber-50 ring-1 ring-amber-200/50"
    />
  );
}

interface DashboardGridProps {
  onHrvScan?: () => void;
  hrvStressLevel?: number | null;
}

export default function DashboardGrid({ onHrvScan, hrvStressLevel }: DashboardGridProps) {
  const { user } = useUser();
  const userAge = (user as { age?: number } | null)?.age ?? 30;
  const { bioAge } = useBioAge(user?.id ?? null, userAge);

  const bioAgeValue = bioAge?.biologicalAge ?? 0;
  const delta = bioAge ? bioAge.biologicalAge - bioAge.chronologicalAge : 0;

  return (
    <div className="mx-5 mt-2 grid grid-cols-2 gap-2">
      <MiniCard
        icon={<Heart className="h-3.5 w-3.5 text-emerald-500" />}
        label="Vârstă Bio"
        value={bioAge ? bioAgeValue.toFixed(1) : "Fă primul check-in"}
        subtitle={bioAge ? (delta <= 0 ? `${delta.toFixed(1)}` : `+${delta.toFixed(1)}`) : undefined}
        href="/bio-age"
        color="bg-emerald-50 ring-1 ring-emerald-200/50"
      />
      <SleepMiniCard />
      <NutritionMiniCard />
      <AlignmentMiniCard />
      {onHrvScan && (
        <div className="col-span-2 mt-1">
          <HrvScanCard onScan={onHrvScan} stressLevel={hrvStressLevel} />
        </div>
      )}
    </div>
  );
}