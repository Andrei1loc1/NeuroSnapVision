"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HomeHeader from "@/components/home/HomeHeader";
import DailyLeverageCard from "@/components/home/DailyLeverageCard";
import DashboardGrid from "@/components/home/DashboardGrid";
import WisdomCardComponent from "@/components/home/WisdomCard";
import EveningReflection from "@/components/purpose/EveningReflection";
import NorthStarBanner from "@/components/purpose/NorthStarBanner";
import SolarWindowIndicator from "@/components/circadian/SolarWindowIndicator";
import HrvScanner from "@/components/hrv/HrvScanner";
import BreathingPause from "@/components/friction/BreathingPause";
import ChatAssistant from "@/components/ai/ChatAssistant";
import Toast from "@/components/ui/Toast";
import { useBioAge } from "@/hooks/useBioAge";
import { useIntervention } from "@/hooks/useIntervention";
import { useUser } from "@/hooks/useUser";
import { useWisdomCard } from "@/hooks/useWisdomCard";
import { usePurpose } from "@/hooks/usePurpose";
import { useHrv } from "@/hooks/useHrv";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { getUserItem, setUserItem } from "@/lib/auth/userStorage";
import { getCurrentBioAge, getTodayProtocol } from "@/lib/api/bio-age";
import { fetchTodayTotals } from "@/lib/api/home";
import { getStoredProfile } from "@/lib/auth/profile";
import { apiFetch } from "@/lib/api/client";
import type { ChatContext, BioAgeSnapshot, LeveragePoint } from "@/lib/types";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userAge, setUserAge] = useState(30);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [hrvScannerOpen, setHrvScannerOpen] = useState(false);
  const [breathingOpen, setBreathingOpen] = useState(false);

  const { submitReading, hrvStatus } = useHrv();
  const { purpose } = usePurpose();
  const { enabled: notifEnabled, sendNotification } = useNotificationSettings();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem("neurosnap-notifications-enabled") === "true";
    if (stored) setShowToast(true);
    const profile = getStoredProfile();
    setUserAge(profile?.age ?? 30);
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    if (!notifEnabled) return;
    const hour = new Date().getHours();
    if (hour >= 12 && hour <= 14) {
      const key = "neurosnap_lunch_notif_" + new Date().toISOString().split("T")[0];
      if (!getUserItem(key)) {
        setUserItem(key, "1");
        sendNotification("NeuroSnap", "Nu uita să logezi prânzul în jurnal");
      }
    }
  }, [notifEnabled, sendNotification]);

  useEffect(() => {
    if (!user) router.replace("/onboarding");
  }, [user, router]);
  const { bioAge } = useBioAge(user?.id ?? null, userAge);
  const { leveragePoint } = useIntervention(user?.id ?? null, userAge, purpose?.northStar ?? undefined);
  const wisdomCard = useWisdomCard(leveragePoint?.dimension ?? "nutrition", leveragePoint?.currentScore ?? 0);

  useEffect(() => {
    if (!user || chatContext) return;
    const profile = getStoredProfile();
    const age = profile?.age ?? 30;

    Promise.allSettled([
      getCurrentBioAge(user.id, age),
      getTodayProtocol(user.id),
      fetchTodayTotals(),
      apiFetch<{ workoutCount: number; avgStress: number; sleepHours: number }>("/api/ai-chat/context"),
    ]).then(([bioAgeResult, protocolResult, totalsResult, ctxResult]) => {
      let snapshot: Partial<BioAgeSnapshot> = {};
      let leverage: Partial<LeveragePoint> = {};
      let complianceScore = 0;
      let streak = 0;
      let uniqueFoods = 0;
      let workoutCount = 0;
      let avgStress = 3;
      let sleepHours = 0;

      if (bioAgeResult.status === "fulfilled") {
        snapshot = bioAgeResult.value.bio_age_snapshot;
        leverage = bioAgeResult.value.leverage_point;
      }
      if (protocolResult.status === "fulfilled") {
        complianceScore = protocolResult.value.streak > 0 ? Math.min(100, protocolResult.value.streak * 10) : 0;
        streak = protocolResult.value.streak;
      }
      if (totalsResult.status === "fulfilled") {
        uniqueFoods = totalsResult.value.mealCount > 0 ? Math.min(30, totalsResult.value.mealCount * 3) : 0;
      }
      if (ctxResult.status === "fulfilled") {
        workoutCount = ctxResult.value.workoutCount;
        avgStress = ctxResult.value.avgStress;
        sleepHours = ctxResult.value.sleepHours;
      }

      setChatContext({
        userId: user.id,
        displayName: user.displayName,
        chronologicalAge: age,
        biologicalAge: Math.round((snapshot.biologicalAge ?? 0) * 10) / 10,
        paceOfAging: Math.round((snapshot.paceOfAging ?? 1) * 100) / 100,
        paceLabel: snapshot.paceLabel ?? "normal",
        movementScore: snapshot.movementScore ?? 0,
        nutritionScore: snapshot.nutritionScore ?? 0,
        sleepScore: snapshot.sleepScore ?? 0,
        ansScore: snapshot.ansScore ?? 0,
        lightScore: snapshot.lightScore ?? 0,
        subjectiveScore: snapshot.subjectiveScore ?? 0,
        hormesisScore: snapshot.hormesis?.hormesis_score ?? 0,
        vo2max: Math.round(snapshot.vo2max?.vo2max_estimated ?? 35),
        vo2maxPercentile: snapshot.vo2max?.percentile ?? "average",
        inflammagingScore: snapshot.inflammaging?.inflammaging_score ?? 0,
        complianceScore,
        streak,
        leverageDimension: leverage.dimension ?? "nutrition",
        leverageAction: leverage.action ?? "Completează check-in-ul",
        projectedImpact: Math.round((leverage.projectedImpact ?? 0) * 100) / 100,
        upfCount: 0,
        uniqueFoods,
        workoutCount,
        avgStress,
        sleepHours: Math.round(sleepHours * 10) / 10,
        proteinTimingScore: snapshot.proteinTiming?.protein_timing_score ?? 0,
      });
    });
  }, [user, chatContext]);

  const handleOpenAI = useCallback(() => {
    setChatOpen(true);
  }, []);

  const handleHrvComplete = useCallback(
    async (result: { sdnn: number; rmssd: number; stressLevel: number }) => {
      setHrvScannerOpen(false);
      await submitReading(result);
      if (result.stressLevel > 7) {
        setBreathingOpen(true);
      }
    },
    [submitReading]
  );

  const handleBreathingComplete = useCallback(() => {
    setBreathingOpen(false);
  }, []);

  if (!user) return null;
  if (!mounted) {
    return <div className="space-y-2 pb-14" />;
  }

  return (
    <div className="space-y-2 pb-14">
      {showToast && (
        <Toast
          message="Urmărește masa de azi"
          onClose={() => setShowToast(false)}
        />
      )}

      <HomeHeader onAIClick={handleOpenAI} />

      {/* North Star */}
      <NorthStarBanner />

      {/* Nivel 1: Acțiunea Zilei */}
      <DailyLeverageCard leveragePoint={leveragePoint} efficacy={bioAge?.interventionEfficacy ?? null} />

      {/* Nivel 3: Dashboard 2×2 */}
      <DashboardGrid onHrvScan={() => setHrvScannerOpen(true)} hrvStressLevel={hrvStatus?.latestStressLevel ?? null} />

      {/* Solar Window */}
      <SolarWindowIndicator />

      {/* Nivel 4: Intervenție */}
      {wisdomCard && <WisdomCardComponent card={wisdomCard} northStar={purpose?.northStar ?? null} />}

      {/* Nivel 5: Reflecție (doar seara) */}
      <EveningReflection />

      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} context={chatContext} />

      {hrvScannerOpen && (
        <HrvScanner
          onComplete={handleHrvComplete}
          onCancel={() => setHrvScannerOpen(false)}
        />
      )}
      {breathingOpen && (
        <BreathingPause
          onComplete={handleBreathingComplete}
          onCancel={() => setBreathingOpen(false)}
        />
      )}
    </div>
  );
}