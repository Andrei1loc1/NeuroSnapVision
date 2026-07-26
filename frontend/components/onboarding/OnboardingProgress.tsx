"use client";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
            i < currentStep
              ? "bg-emerald-500 scale-100"
              : "bg-white/40 border border-white/60 scale-90"
          }`}
        />
      ))}
    </div>
  );
}