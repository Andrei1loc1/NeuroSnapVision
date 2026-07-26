"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Heart, Flame, Shield } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useBioAge } from "@/hooks/useBioAge";
import { useHrv } from "@/hooks/useHrv";
import BioAgeCard from "@/components/home/BioAgeCard";
import DailyLeverageCard from "@/components/home/DailyLeverageCard";
import DimensionScoreBar from "@/components/bio-age/DimensionScoreBar";
import OrganAgeCard from "@/components/bio-age/OrganAgeCard";
import BioAgeTrendCard from "@/components/bio-age/BioAgeTrendCard";
import AllostaticTrajectory from "@/components/allostatic/AllostaticTrajectory";
import { SkeletonText, Skeleton, SkeletonChart } from "@/components/ui/Skeleton";
import { getBioAgeHistory } from "@/lib/api/bio-age";
import type { BioAgeSnapshot } from "@/lib/types";
import { getStoredProfile } from "@/lib/auth/profile";

const DIMENSIONS = [
  { key: "nutrition", name: "Alimentație", color: "#22c55e" },
  { key: "sleep", name: "Odihnă", color: "#10b981" },
  { key: "ans", name: "Echilibru", color: "#16a34a" },
  { key: "movement", name: "Mișcare", color: "#4ade80" },
  { key: "light", name: "Ritm Circadian", color: "#34d399" },
  { key: "subjective", name: "Stare de Bine", color: "#6ee7b7" },
];

const ORGANS = [
  { key: "brainAge", name: "Cerebral", icon: Brain },
  { key: "cardiovascularAge", name: "Cardiovascular", icon: Heart },
  { key: "metabolicAge", name: "Metabolic", icon: Flame },
  { key: "immuneAge", name: "Imunitar", icon: Shield },
];

const SCORE_KEYS: Record<string, keyof import("@/lib/types").BioAgeSnapshot> = {
  nutrition: "nutritionScore",
  sleep: "sleepScore",
  ans: "ansScore",
  movement: "movementScore",
  light: "lightScore",
  subjective: "subjectiveScore",
};

const ORGAN_KEYS: Record<string, keyof import("@/lib/types").BioAgeSnapshot> = {
  brainAge: "brainAge",
  cardiovascularAge: "cardiovascularAge",
  metabolicAge: "metabolicAge",
  immuneAge: "immuneAge",
};

export default function BioAgePage() {
  const { user } = useUser();
  const router = useRouter();
  const [age, setAge] = useState(30);

  useEffect(() => {
    const profile = getStoredProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAge(profile?.age ?? 30);
  }, []);

  useEffect(() => {
    if (!user) router.replace("/onboarding");
  }, [user, router]);

  const { loading: bioAgeLoading, bioAge, leveragePoint } = useBioAge(user?.id ?? null, age);
  const { allostaticTrajectory, loading: hrvLoading } = useHrv();
  const [historySnapshots, setHistorySnapshots] = useState<BioAgeSnapshot[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getBioAgeHistory(user.id, 365).then((res) => {
      if (!cancelled) setHistorySnapshots(res.snapshots);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  const trendData = useMemo(
    () => historySnapshots.length >= 2
      ? historySnapshots.slice(-5).map((s) => s.biologicalAge)
      : [],
    [historySnapshots],
  );

  const dimensionBars = DIMENSIONS.map((dim) => ({
    ...dim,
    score: bioAge ? (bioAge[SCORE_KEYS[dim.key]] as number) ?? 0 : 0,
  }));

  if (!user) return null;
  if (bioAgeLoading) {
    return (
      <div className="pt-10 space-y-2 pb-14">
        <div className="px-5 pb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 text-zinc-700" />
          </div>
          <Skeleton className="h-5 w-56" />
        </div>

        {/* BioAgeCard skeleton */}
        <div className="glass-card card-animate mx-5 mt-2 h-44 p-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-2/3" />
        </div>

        {/* Dimension scores skeleton */}
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          <Skeleton className="mb-3 h-3 w-32" />
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonText key={i} lines={2} />
            ))}
          </div>
        </section>

        {/* Trend skeleton */}
        <div className="glass-card card-animate mx-5 mt-2 h-40 p-4">
          <SkeletonChart />
        </div>

        {/* Organ ages skeleton */}
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          <Skeleton className="mb-3 h-3 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-10 space-y-2 pb-14">
      <div className="px-5 pb-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Înapoi"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm transition-colors hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Vârsta Stilului de Viață</h1>
      </div>

      {bioAge ? (
        <BioAgeCard bioAge={bioAge} trendData={trendData} />
      ) : (
        <div className="glass-card card-animate mx-5 mt-2 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
            <Brain className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-[13px] font-semibold text-zinc-600">Nu avem încă date despre vârsta ta biologică</p>
          <p className="mx-auto mt-1.5 max-w-[240px] text-[11px] leading-relaxed text-zinc-400">
            Loghează mese, check-in-uri de dimineață și antrenamente pentru a genera prima evaluare.
          </p>
          <button
            onClick={() => router.push("/journal")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60 transition-all hover:bg-emerald-100 active:scale-95"
          >
            Scanează pentru a începe
          </button>
        </div>
      )}

      {bioAge && (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          <p className="mb-3 text-[13px] font-semibold text-zinc-600">Scoruri Dimensiuni</p>
          <div className="grid grid-cols-2 gap-2.5">
            {dimensionBars.map((dim) => (
              <DimensionScoreBar
                key={dim.key}
                dimension={dim.name}
                score={dim.score}
              />
            ))}
          </div>
        </section>
      )}

      <BioAgeTrendCard
        snapshots={historySnapshots}
        chronologicalAge={bioAge?.chronologicalAge ?? age}
      />

      <AllostaticTrajectory data={allostaticTrajectory} loading={hrvLoading} />

      {bioAge && (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          <p className="mb-3 text-[13px] font-semibold text-zinc-600">Evaluarea Vârstei</p>
          <div className="space-y-3">
            {ORGANS.map((organ) => {
              const Icon = organ.icon;
              const organAge = (bioAge[ORGAN_KEYS[organ.key]] as number | null) ?? null;
              return (
                <OrganAgeCard
                  key={organ.key}
                  organName={organ.name}
                  age={organAge}
                  chronologicalAge={bioAge.chronologicalAge}
                  icon={<Icon className="h-5 w-5" />}
                />
              );
            })}
          </div>
        </section>
      )}

      <DailyLeverageCard leveragePoint={leveragePoint} />
    </div>
  );
}