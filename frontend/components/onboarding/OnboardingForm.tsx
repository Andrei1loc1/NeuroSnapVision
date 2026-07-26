"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { setStoredProfile } from "@/lib/auth/profile";
import { setStoredTargets } from "@/lib/auth/targets";
import { calculateTargets, type OnboardingFormData } from "@/lib/services/nutrition/targets";
import { updateNorthStar } from "@/lib/api/four-levels";
import Image from "next/image";

const fieldDelay = (index: number) => `${100 + index * 100}ms`;

const VALUES_OPTIONS = [
  { key: "familie", label: "Familie" },
  { key: "vitalitate", label: "Vitalitate" },
  { key: "claritate", label: "Claritate mentală" },
  { key: "longevitate", label: "Longevitate" },
  { key: "performanta", label: "Performanță" },
  { key: "liniste", label: "Liniște" },
  { key: "conexiune", label: "Conexiune" },
];

export default function OnboardingForm() {
  const { login } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "northStar">("profile");
  const [northStarText, setNorthStarText] = useState("");
  const [whyStatement, setWhyStatement] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data: OnboardingFormData = {
      displayName: (form.elements.namedItem("displayName") as HTMLInputElement).value,
      age: (form.elements.namedItem("age") as HTMLInputElement).value,
      weight: (form.elements.namedItem("weight") as HTMLInputElement).value,
      height: (form.elements.namedItem("height") as HTMLSelectElement).value,
      goal: (form.elements.namedItem("goal") as HTMLSelectElement).value,
      activityLevel: (form.elements.namedItem("activityLevel") as HTMLSelectElement).value,
      sleepTime: (form.elements.namedItem("sleepTime") as HTMLInputElement).value,
    };

    await login(data.displayName);
    const targets = calculateTargets(data);
    setStoredTargets(targets);
    setStoredProfile({
      displayName: data.displayName,
      age: Number(data.age),
      sex: "other",
      bodyType: "medium",
      activityLevel: data.activityLevel,
      goal: data.goal,
      sleepHours: 7,
      weight: Number(data.weight),
      height: Number(data.height),
      sleepTime: data.sleepTime,
    });

    setStep("northStar");
  }

  async function handleNorthStarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!northStarText.trim()) {
      router.push("/");
      return;
    }
    setSaving(true);
    try {
      await updateNorthStar({
        northStar: northStarText.trim(),
        whyStatement: whyStatement.trim() || undefined,
        values: selectedValues.length > 0 ? selectedValues : undefined,
      });
    } catch {
    } finally {
      setSaving(false);
      router.push("/");
    }
  }

  function toggleValue(key: string) {
    setSelectedValues((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  }

  if (step === "northStar") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-start pt-16 px-6 relative">
        <div className="relative z-10 w-full max-w-[400px] mx-auto">
          <div className="text-center mb-8 animate-field-enter" style={{ animationDelay: "0ms" }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100/60 to-emerald-100/40 backdrop-blur-sm mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.15)]">
              <Image src="/images/leaf.png" alt="NeuroSnap" width={44} height={44} className="rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Care e motivul profund pentru care vrei să fii sănătos?</h2>
            <p className="text-zinc-500 text-sm mt-2">Nu un target numeric. Un sens.</p>
            <p className="text-zinc-500 text-xs mt-1 italic">Ex: „Să pot alerga cu nepoții la 80 de ani&quot;</p>
          </div>

          <form onSubmit={handleNorthStarSubmit} className="space-y-4">
            <div className="rounded-[32px] border border-white/60 bg-white/30 backdrop-blur-2xl p-6 shadow-[0_32px_80px_rgba(20,83,45,0.12)] animate-field-enter" style={{ animationDelay: "100ms" }}>
              <div className="space-y-4">
                <div className="animate-field-enter" style={{ animationDelay: fieldDelay(0) }}>
                  <label className="mb-2 block text-sm font-semibold text-zinc-600">North Star-ul tău</label>
                  <input
                    type="text"
                    value={northStarText}
                    onChange={(e) => setNorthStarText(e.target.value)}
                    placeholder="Ex: Să fiu prezent pentru familia mea încă mult timp de acum"
                    className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <div className="animate-field-enter" style={{ animationDelay: fieldDelay(1) }}>
                  <label className="mb-2 block text-sm font-semibold text-zinc-600">De ce? <span className="font-normal text-zinc-600">(opțional)</span></label>
                  <input
                    type="text"
                    value={whyStatement}
                    onChange={(e) => setWhyStatement(e.target.value)}
                    placeholder="Ce te motivează cu adevărat?"
                    className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <div className="animate-field-enter" style={{ animationDelay: fieldDelay(2) }}>
                  <label className="mb-2 block text-sm font-semibold text-zinc-600">Valori care te ghidează <span className="font-normal text-zinc-600">(opțional)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {VALUES_OPTIONS.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => toggleValue(v.key)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedValues.includes(v.key)
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                            : "bg-white/40 text-zinc-700 border border-white/40 hover:bg-white/60"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 animate-field-enter" style={{ animationDelay: "800ms" }}>
              <button
                type="submit"
                disabled={saving}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-[0_12px_40px_rgba(16,185,129,0.35)] hover:shadow-[0_16px_48px_rgba(16,185,129,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Continuă"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-16 px-6 relative">
      <div className="relative z-10 w-full max-w-[400px] mx-auto">
        <div className="text-center mb-8 animate-field-enter" style={{ animationDelay: "0ms" }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 backdrop-blur-sm mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.15)]">
            <Image src="/images/leaf.png" alt="NeuroSnap" width={44} height={44} className="rounded-full" />
          </div>

          <p className="text-zinc-500 text-sm font-medium tracking-wide">Welcome to</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent mt-1">
            NeuroSnap
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Your personalized nutrition journey starts here</p>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/30 backdrop-blur-2xl p-6 shadow-[0_32px_80px_rgba(20,83,45,0.12)] animate-field-enter" style={{ animationDelay: "100ms" }}>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Field label="Numele tău" name="displayName" type="text" required placeholder="ex. Alex" delay={fieldDelay(0)} />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Vârsta" name="age" type="number" required min="10" max="120" placeholder="28" delay={fieldDelay(1)} />
              <Field label="Greutate (kg)" name="weight" type="number" required min="30" max="300" placeholder="70" delay={fieldDelay(2)} />
            </div>

            <Field label="Înălțime (cm)" name="height" type="number" required min="100" max="250" placeholder="175" delay={fieldDelay(3)} />

            <SelectField label="Obiectivul tău" name="goal" required delay={fieldDelay(4)}>
              <option value="">Selectează obiectiv</option>
              <option value="lose_weight">Slăbire</option>
              <option value="maintain">Menținere</option>
              <option value="gain_muscle">Creștere musculară</option>
              <option value="gain_weight">Creștere în greutate</option>
            </SelectField>

            <SelectField label="Nivel de activitate" name="activityLevel" required delay={fieldDelay(5)}>
              <option value="">Selectează nivelul</option>
              <option value="sedentary">Sedentar</option>
              <option value="light">Ușor activ</option>
              <option value="moderate">Moderat activ</option>
              <option value="active">Foarte activ</option>
              <option value="very_active">Extra activ</option>
            </SelectField>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(6) }}>
              <label className="mb-2 block text-sm font-semibold text-zinc-600">Ora de culcare</label>
              <input
                type="time"
                name="sleepTime"
                required
                defaultValue="23:00"
                className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 text-zinc-900 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="pt-4 animate-field-enter" style={{ animationDelay: "800ms" }}>
              <button
                type="submit"
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-[0_12px_40px_rgba(16,185,129,0.35)] hover:shadow-[0_16px_48px_rgba(16,185,129,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Continuă
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
  min,
  max,
  placeholder,
  delay,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  delay: string;
}) {
  return (
    <div className="animate-field-enter" style={{ animationDelay: delay }}>
      <label className="mb-2 block text-sm font-semibold text-zinc-600">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  delay,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  delay: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-field-enter" style={{ animationDelay: delay }}>
      <label className="mb-2 block text-sm font-semibold text-zinc-600">{label}</label>
      <div className="relative">
        <select
          name={name}
          required={required}
          className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3.5 text-zinc-900 appearance-none backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all cursor-pointer"
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
