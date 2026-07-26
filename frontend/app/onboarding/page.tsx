"use client";

import { useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { setStoredProfile } from "@/lib/auth/profile";
import { setStoredTargets } from "@/lib/auth/targets";
import { calculateSmartTargets } from "@/lib/services/nutrition/targets";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import NameStep from "@/components/onboarding/NameStep";
import AgeStep from "@/components/onboarding/AgeStep";
import SexStep from "@/components/onboarding/SexStep";
import WeightHeightStep from "@/components/onboarding/WeightHeightStep";
import BodyTypeStep from "@/components/onboarding/BodyTypeStep";
import ActivityStep from "@/components/onboarding/ActivityStep";
import GoalStep from "@/components/onboarding/GoalStep";
import SleepStep from "@/components/onboarding/SleepStep";

interface OnboardingData {
  name: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
  bodyType: string;
  activityLevel: string;
  goal: string;
  sleepHours: number;
}

export default function OnboardingPage() {
  const { login } = useUser();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: 25,
    sex: "",
    weight: 70,
    height: 175,
    bodyType: "",
    activityLevel: "",
    goal: "",
    sleepHours: 7,
  });

  const update = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const displayName = data.name.trim() || "Utilizator";
      await login(displayName);

      const targets = calculateSmartTargets(data);
      setStoredTargets(targets);
      setStoredProfile({
        displayName,
        age: data.age,
        sex: data.sex,
        bodyType: data.bodyType,
        activityLevel: data.activityLevel,
        goal: data.goal,
        sleepHours: data.sleepHours,
        weight: data.weight,
        height: data.height,
      });

      try {
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            age: data.age,
            sex: data.sex,
            bodyType: data.bodyType,
            activityLevel: data.activityLevel,
            goal: data.goal,
            sleepHours: data.sleepHours,
            weight: data.weight,
            height: data.height,
            targetCalories: targets.target_calories,
            targetProtein: targets.target_protein,
            targetFats: targets.target_fats,
            lateMealThreshold: targets.late_meal_threshold,
            focusArea: targets.focus_area,
          }),
        });
      } catch (err) {
        console.error("[onboarding] failed to sync profile", err);
      }

      window.location.href = "/";
    } catch {
      setSubmitting(false);
    }
  }, [data, login, submitting]);

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  const steps = [
    <NameStep key="name" value={data.name} onChange={(v) => update("name", v)} onNext={() => setStep(1)} />,
    <AgeStep key="age" value={data.age} onChange={(v) => update("age", v)} onNext={() => setStep(2)} />,
    <SexStep key="sex" value={data.sex} onChange={(v) => update("sex", v)} onNext={() => setStep(3)} />,
    <WeightHeightStep key="wh" weight={data.weight} height={data.height} onWeightChange={(v) => update("weight", v)} onHeightChange={(v) => update("height", v)} onNext={() => setStep(4)} />,
    <BodyTypeStep key="bodyType" value={data.bodyType} onChange={(v) => update("bodyType", v)} onNext={() => setStep(5)} />,
    <ActivityStep key="activity" value={data.activityLevel} onChange={(v) => update("activityLevel", v)} onNext={() => setStep(6)} />,
    <GoalStep key="goal" value={data.goal} onChange={(v) => update("goal", v)} onNext={() => setStep(7)} />,
    <SleepStep key="sleep" value={data.sleepHours} onChange={(v) => update("sleepHours", v)} onComplete={handleComplete} submitting={submitting} />,
  ];

  if (submitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F7FBF9] via-[#EAF7F1] to-[#DFF3EA]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
          <p className="text-emerald-700 font-medium">Se pregătește profilul tău...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F7FBF9] via-[#EAF7F1] to-[#DFF3EA]">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1 relative">
        <div className="px-6 pt-4 pb-2 flex items-center">
          {step > 0 && (
            <button
              onClick={goBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/20 backdrop-blur-xl active:scale-95 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <OnboardingProgress currentStep={step + 1} totalSteps={8} />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {steps[step]}
        </div>
      </div>
    </div>
  );
}