"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Check, Sparkles, Moon, Zap, Smile, Brain, AlertTriangle, Apple, Sun, Users, Snowflake, ThermometerSun, Coffee, MonitorOff, Heart } from "lucide-react";
import StreakCalendar from "@/components/protocol/StreakCalendar";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { useUser } from "@/hooks/useUser";
import { useProtocol } from "@/hooks/useProtocol";
import { getStreakData, markCheckIn, type StreakData } from "@/hooks/useStreak";
import type { DailyProtocol } from "@/lib/types";

const SUPPLEMENT_TAGS = [
  "Vit D3",
  "Omega-3",
  "Magneziu",
  "Creatină",
];

const MEAL_TIMES = [
  { label: "< 18:00", value: "18:00" },
  { label: "18-19", value: "19:00" },
  { label: "19-20", value: "20:00" },
  { label: "20-21", value: "21:00" },
  { label: "> 21:00", value: "22:00" },
];

function ScaleSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="relative h-8 flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: value !== null && n <= value
              ? n <= 2 ? "#22c55e" : n <= 3 ? "#16a34a" : n <= 4 ? "#15803d" : "#14532d"
              : "rgba(0,0,0,0.08)",
            boxShadow: value !== null && n <= value
              ? "0 0 8px rgba(34,197,94,0.4)"
              : "none",
            transform: value === n ? "scaleY(1.3)" : "scaleY(1)",
          }}
          aria-label={`${n}`}
        />
      ))}
    </div>
  );
}

function MorningForm({
  onSubmit,
  submitting,
}: {
  protocol: DailyProtocol;
  onSubmit: (data: { recovery: number; energy: number; mood?: number; focus?: number; morning_light?: boolean }) => void;
  submitting: boolean;
}) {
  const [recovery, setRecovery] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [morningLight, setMorningLight] = useState<boolean | null>(null);

  const canSubmit = recovery !== null && energy !== null;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit({
      recovery: recovery!,
      energy: energy!,
      mood: mood ?? undefined,
      focus: focus ?? undefined,
      morning_light: morningLight ?? undefined,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold text-zinc-600">Check-in Dimineața</p>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Recuperare</span>
        </div>
        <ScaleSelector value={recovery} onChange={setRecovery} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Energie</span>
        </div>
        <ScaleSelector value={energy} onChange={setEnergy} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Smile className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Dispoziție</span>
        </div>
        <ScaleSelector value={mood} onChange={setMood} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Focus</span>
        </div>
        <ScaleSelector value={focus} onChange={setFocus} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sun className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Lumină matinală</span>
        </div>
        <p className="mb-1.5 text-[11px] text-zinc-700">Te-ai expus la lumină naturală în 30min de la trezire?</p>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMorningLight(true)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              morningLight === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            Da
          </button>
          <button
            onClick={() => setMorningLight(false)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              morningLight === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            Nu
          </button>
        </div>
      </div>

      <button
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={`w-full rounded-2xl py-3 text-sm font-semibold transition-all ${
          canSubmit && !submitting
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            : "bg-zinc-200 text-zinc-500"
        }`}
      >
        {submitting ? "Se salvează..." : "Salvează Dimineața"}
      </button>
    </div>
  );
}

function EveningForm({
  onSubmit,
  submitting,
}: {
  protocol: DailyProtocol;
  onSubmit: (data: { stress: number; digestion: number; mood?: number; energy?: number; supplements?: string[]; last_meal_time?: string; social_connection?: number; oral_health?: boolean; cold_exposure?: boolean; heat_exposure?: boolean; caffeine_cutoff?: boolean; screen_cutoff?: boolean }) => void;
  submitting: boolean;
}) {
  const [stress, setStress] = useState<number | null>(null);
  const [digestion, setDigestion] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [lastMealTime, setLastMealTime] = useState<string | null>(null);
  const [socialConnection, setSocialConnection] = useState<number | null>(null);
  const [oralHealth, setOralHealth] = useState<boolean | null>(null);
  const [coldExposure, setColdExposure] = useState<boolean | null>(null);
  const [heatExposure, setHeatExposure] = useState<boolean | null>(null);
  const [caffeineCutoff, setCaffeineCutoff] = useState<boolean | null>(null);
  const [screenCutoff, setScreenCutoff] = useState<boolean | null>(null);

  const canSubmit = stress !== null && digestion !== null;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit({
      stress: stress!,
      digestion: digestion!,
      mood: mood ?? undefined,
      energy: energy ?? undefined,
      supplements: selectedSupplements.length > 0 ? selectedSupplements : undefined,
      last_meal_time: lastMealTime ?? undefined,
      social_connection: socialConnection ?? undefined,
      oral_health: oralHealth ?? undefined,
      cold_exposure: coldExposure ?? undefined,
      heat_exposure: heatExposure ?? undefined,
      caffeine_cutoff: caffeineCutoff ?? undefined,
      screen_cutoff: screenCutoff ?? undefined,
    });
  };

  const toggleSupplement = (tag: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(tag) ? prev.filter((s) => s !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold text-zinc-600">Check-in Seara</p>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Stres</span>
        </div>
        <ScaleSelector value={stress} onChange={setStress} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Apple className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Digestie</span>
        </div>
        <ScaleSelector value={digestion} onChange={setDigestion} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Smile className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Dispoziție</span>
        </div>
        <ScaleSelector value={mood} onChange={setMood} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Energie</span>
        </div>
        <ScaleSelector value={energy} onChange={setEnergy} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-600">Suplimente</p>
        <div className="flex flex-wrap gap-1.5">
          {SUPPLEMENT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleSupplement(tag)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                selectedSupplements.includes(tag)
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                  : "bg-white/40 text-zinc-600 hover:bg-white/60"
              }`}
            >
              {selectedSupplements.includes(tag) && "✓ "}{tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-600">Ultima masă</p>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TIMES.map((mt) => (
            <button
              key={mt.value}
              onClick={() => setLastMealTime(mt.value)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                lastMealTime === mt.value
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                  : "bg-white/40 text-zinc-600 hover:bg-white/60"
              }`}
            >
              {mt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-600">Conexiune socială</span>
        </div>
        <p className="mb-1.5 text-[11px] text-zinc-700">Cât de conectat social te-ai simțit azi?</p>
        <ScaleSelector value={socialConnection} onChange={setSocialConnection} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-600">Obiceiuri seară</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setOralHealth(oralHealth === true ? null : true)}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              oralHealth === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : oralHealth === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            <Heart className="h-3 w-3" />
            {oralHealth === true ? "✓ Da" : oralHealth === false ? "✗ Nu" : "Igienă orală"}
          </button>
          <button
            onClick={() => setColdExposure(coldExposure === true ? null : true)}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              coldExposure === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : coldExposure === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            <Snowflake className="h-3 w-3" />
            {coldExposure === true ? "✓ Da" : coldExposure === false ? "✗ Nu" : "Expunere frig"}
          </button>
          <button
            onClick={() => setHeatExposure(heatExposure === true ? null : true)}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              heatExposure === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : heatExposure === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            <ThermometerSun className="h-3 w-3" />
            {heatExposure === true ? "✓ Da" : heatExposure === false ? "✗ Nu" : "Saună / căldură"}
          </button>
          <button
            onClick={() => setCaffeineCutoff(caffeineCutoff === true ? null : true)}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              caffeineCutoff === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : caffeineCutoff === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            <Coffee className="h-3 w-3" />
            {caffeineCutoff === true ? "✓ Da" : caffeineCutoff === false ? "✗ Nu" : "Cafeină"}
          </button>
          <button
            onClick={() => setScreenCutoff(screenCutoff === true ? null : true)}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              screenCutoff === true
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : screenCutoff === false
                ? "bg-red-100 text-red-600"
                : "bg-white/40 text-zinc-600 hover:bg-white/60"
            }`}
          >
            <MonitorOff className="h-3 w-3" />
            {screenCutoff === true ? "✓ Da" : screenCutoff === false ? "✗ Nu" : "Ecrane"}
          </button>
        </div>
      </div>

      <button
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={`w-full rounded-2xl py-3 text-sm font-semibold transition-all ${
          canSubmit && !submitting
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            : "bg-zinc-200 text-zinc-500"
        }`}
      >
        {submitting ? "Se salvează..." : "Salvează Seara"}
      </button>
    </div>
  );
}

export default function ProtocolPage() {
  const { user } = useUser();
  const router = useRouter();
  const { loading: protocolLoading, protocol, streak, submitMorning, submitEvening } = useProtocol(user?.id ?? null);

  const [userTab, setUserTab] = useState<"morning" | "evening" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const celebratedRef = useRef(false);
  const [streakData, setStreakData] = useState<StreakData>(() => getStreakData());

  const refreshStreakData = useCallback(() => {
    setStreakData(getStreakData());
  }, []);

  useEffect(() => {
    if (!user) router.replace("/onboarding");
  }, [user, router]);

  const morningComplete = protocol?.morningRecovery != null;
  const eveningComplete = protocol?.eveningStress != null;
  const allComplete = morningComplete && eveningComplete;

  const tab = userTab ?? (morningComplete ? "evening" : "morning");

  useEffect(() => {
    if (allComplete && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3000);
      return () => clearTimeout(t);
    }
  }, [allComplete]);

  const handleMorningSubmit = useCallback(async (data: { recovery: number; energy: number; mood?: number; focus?: number; morning_light?: boolean }) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitMorning({
        date: new Date().toISOString().slice(0, 10),
        ...data,
      });
      markCheckIn(new Date().toISOString().slice(0, 10), "morning");
      refreshStreakData();
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitMorning, refreshStreakData]);

  const handleEveningSubmit = useCallback(async (data: { stress: number; digestion: number; mood?: number; energy?: number; supplements?: string[]; last_meal_time?: string; social_connection?: number; oral_health?: boolean; cold_exposure?: boolean; heat_exposure?: boolean; caffeine_cutoff?: boolean; screen_cutoff?: boolean }) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitEvening({
        date: new Date().toISOString().slice(0, 10),
        ...data,
      });
      markCheckIn(new Date().toISOString().slice(0, 10), "evening");
      refreshStreakData();
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitEvening, refreshStreakData]);

  if (protocolLoading) {
    return (
      <div className="pt-10 space-y-2 pb-14">
        <div className="mx-5 mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>

        {/* Tabs skeleton */}
        <div className="mx-5 flex rounded-2xl bg-white/30 p-1">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>

        {/* Form skeleton */}
        <section className="glass-card card-animate mx-5 mt-2 p-4 space-y-4">
          <Skeleton className="h-3 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          ))}
          <SkeletonText lines={2} />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </section>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-10 space-y-2 pb-14">
      <div className="mx-5 mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Ritual Zilnic</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 shadow-sm">
            <Flame className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600">{streak}z</span>
          </div>
        )}
      </div>

      <div className="mx-5 flex rounded-2xl bg-white/30 p-1 backdrop-blur-sm">
        <button
          onClick={() => setUserTab("morning")}
          disabled={morningComplete}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === "morning"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : morningComplete
              ? "bg-emerald-50 text-emerald-600"
              : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          {morningComplete ? "✓ Dimineața" : "Dimineața"}
        </button>
        <button
          onClick={() => setUserTab("evening")}
          disabled={eveningComplete}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === "evening"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : eveningComplete
              ? "bg-emerald-50 text-emerald-600"
              : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          {eveningComplete ? "✓ Seara" : "Seara"}
        </button>
      </div>

      {tab === "morning" && (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          {morningComplete ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="text-[13px] font-semibold text-emerald-600">Check-in de dimineață complet!</p>
            </div>
          ) : protocol ? (
            <MorningForm protocol={protocol} onSubmit={handleMorningSubmit} submitting={submitting} />
          ) : (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
            </div>
          )}
        </section>
      )}

      {tab === "evening" && (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          {eveningComplete ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="text-[13px] font-semibold text-emerald-600">Check-in de seară complet!</p>
            </div>
          ) : protocol ? (
            <EveningForm protocol={protocol} onSubmit={handleEveningSubmit} submitting={submitting} />
          ) : (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
            </div>
          )}
        </section>
      )}

      {celebrate && (
        <section className="glass-card card-animate mx-5 mt-2 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-200/50 animate-bounce">
              <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-base font-bold text-emerald-700">Ritual complet pentru azi!</p>
            <p className="text-xs text-emerald-600">Vârsta Stilului de Viață îmbunătățită cu fiecare zi consecutivă</p>
          </div>
        </section>
      )}

      <section className="glass-card card-animate mx-5 mt-2 p-4">
        <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-zinc-600">Zile Consecutive</span>
          <div className="flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold text-emerald-600">{streak} zile</span>
          </div>
        </div>
        {streak > 0 && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(streak * 3.3, 100)}%` }}
            />
          </div>
        )}
      </section>

      <StreakCalendar streakData={streakData} />
    </div>
  );
}