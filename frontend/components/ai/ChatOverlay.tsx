"use client";

import { useState, useCallback, useRef } from "react";
import FloatingChatButton from "./FloatingChatButton";
import ChatAssistant from "./ChatAssistant";
import type { ChatContext } from "@/lib/types";
import { getStoredUser } from "@/lib/auth/user";
import { getStoredProfile } from "@/lib/auth/profile";
import { getCurrentBioAge, getTodayProtocol } from "@/lib/api/bio-age";
import { fetchTodayTotals, fetchBackendInputs } from "@/lib/api/home";
import { apiFetch } from "@/lib/api/client";

const CONTEXT_TTL = 5 * 60 * 1000;

export default function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ChatContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const cacheRef = useRef<{ timestamp: number; context: ChatContext } | null>(null);

  const buildContext = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cacheRef.current && now - cacheRef.current.timestamp < CONTEXT_TTL) {
      setContext(cacheRef.current.context);
      return;
    }

    setContextLoading(true);
    try {
      const user = getStoredUser();
      const profile = getStoredProfile();

      if (!user) {
        setContext(null);
        setContextLoading(false);
        return;
      }

      const age = profile?.age ?? 30;
      const displayName = user.displayName || "User";

      let bioAge = 0;
      let paceOfAging = 1.0;
      let paceLabel = "normal";
      let movementScore = 0;
      let nutritionScore = 0;
      let sleepScore = 0;
      let ansScore = 0;
      let lightScore = 0;
      let subjectiveScore = 0;
      let hormesisScore = 0;
      let vo2max = 35;
      let vo2maxPercentile = "average";
      let inflammagingScore = 0;
      let complianceScore = 0;
      let streak = 0;
      let leverageDimension = "nutrition";
      let leverageAction = "Completează check-in-ul";
      let projectedImpact = 0;
      let proteinTimingScore = 0;
      let upfCount = 0;
      let uniqueFoods = 0;
      let workoutCount = 0;
      let avgStress = 3;
      let sleepHours = 0;

      const [bioAgeResult, protocolResult, inputsResult, totalsResult, ctxResult] = await Promise.allSettled([
        getCurrentBioAge(user.id, age),
        getTodayProtocol(user.id),
        fetchBackendInputs(7),
        fetchTodayTotals(),
        apiFetch<{ workoutCount: number; avgStress: number; sleepHours: number }>("/api/ai-chat/context"),
      ]);

      if (bioAgeResult.status === "fulfilled") {
        const snapshot = bioAgeResult.value.bio_age_snapshot;
        const leverage = bioAgeResult.value.leverage_point;

        bioAge = snapshot.biologicalAge;
        paceOfAging = snapshot.paceOfAging;
        paceLabel = snapshot.paceLabel;
        movementScore = snapshot.movementScore;
        nutritionScore = snapshot.nutritionScore;
        sleepScore = snapshot.sleepScore;
        ansScore = snapshot.ansScore;
        lightScore = snapshot.lightScore;
        subjectiveScore = snapshot.subjectiveScore;
        hormesisScore = snapshot.hormesis?.hormesis_score ?? 0;
        vo2max = snapshot.vo2max?.vo2max_estimated ?? 35;
        vo2maxPercentile = snapshot.vo2max?.percentile ?? "average";
        inflammagingScore = snapshot.inflammaging?.inflammaging_score ?? 0;
        proteinTimingScore = snapshot.proteinTiming?.protein_timing_score ?? 0;
        leverageDimension = leverage.dimension;
        leverageAction = leverage.action;
        projectedImpact = leverage.projectedImpact;
      }

      if (protocolResult.status === "fulfilled") {
        complianceScore = protocolResult.value.streak > 0 ? Math.min(100, protocolResult.value.streak * 10) : 0;
        streak = protocolResult.value.streak;
      }

      if (inputsResult.status === "fulfilled") {
        upfCount = inputsResult.value.late_meals_count || 0;
      }

      if (totalsResult.status === "fulfilled") {
        uniqueFoods = totalsResult.value.mealCount > 0 ? Math.min(30, totalsResult.value.mealCount * 3) : 0;
      }

      if (ctxResult.status === "fulfilled") {
        workoutCount = ctxResult.value.workoutCount;
        avgStress = ctxResult.value.avgStress;
        sleepHours = ctxResult.value.sleepHours;
      }

      const built: ChatContext = {
        userId: user.id,
        displayName,
        chronologicalAge: age,
        biologicalAge: Math.round(bioAge * 10) / 10,
        paceOfAging: Math.round(paceOfAging * 100) / 100,
        paceLabel,
        movementScore,
        nutritionScore,
        sleepScore,
        ansScore,
        lightScore,
        subjectiveScore,
        hormesisScore,
        vo2max: Math.round(vo2max),
        vo2maxPercentile,
        inflammagingScore,
        complianceScore,
        streak,
        leverageDimension,
        leverageAction,
        projectedImpact: Math.round(projectedImpact * 100) / 100,
        upfCount,
        uniqueFoods,
        workoutCount,
        avgStress,
        sleepHours: Math.round(sleepHours * 10) / 10,
        proteinTimingScore,
      };

      cacheRef.current = { timestamp: Date.now(), context: built };
      setContext(built);
    } catch {
      setContext(null);
    } finally {
      setContextLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!context && !contextLoading) {
      buildContext();
    }
  }, [context, contextLoading, buildContext]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <FloatingChatButton onClick={handleOpen} />
      <ChatAssistant isOpen={isOpen} onClose={handleClose} context={context} />
    </>
  );
}
