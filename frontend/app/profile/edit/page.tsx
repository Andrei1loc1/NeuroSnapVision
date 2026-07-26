"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredProfile, setStoredProfile, ProfileData } from "@/lib/auth/profile";
import { getStoredUser, setStoredUser } from "@/lib/auth/user";
import { apiFetch } from "@/lib/api/client";

const fieldDelay = (index: number) => `${100 + index * 100}ms`;

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredProfile();
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(stored);
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    const updated: ProfileData = {
      displayName: profile.displayName,
      age: Number(profile.age),
      sex: profile.sex ?? "other",
      bodyType: profile.bodyType ?? "medium",
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      sleepHours: profile.sleepHours ?? 7,
      weight: Number(profile.weight) || undefined,
      height: Number(profile.height) || undefined,
      sleepTime: profile.sleepTime,
    };

    setStoredProfile(updated);

    const user = getStoredUser();
    if (user && user.displayName !== updated.displayName) {
      setStoredUser({ ...user, displayName: updated.displayName });
    }

    setSaving(true);
    try {
      await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("[profile/edit] failed to save profile", err);
      alert("Nu am putut salva profilul. Verifică conexiunea și încearcă din nou.");
    }
    setSaving(false);

    router.push("/profile");
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-14 px-5 relative">
      <div className="relative z-10 w-full max-w-[400px] mx-auto">
        <div
          className="flex items-center gap-3 mb-8 animate-field-enter"
          style={{ animationDelay: "0ms" }}
        >
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all"
            aria-label="Înapoi"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">Editează Profilul</h1>
        </div>

        <div
          className="glass-card card-animate p-5"
          style={{ animationDelay: "100ms" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(0) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Numele tău
              </label>
              <input
                type="text"
                name="displayName"
                required
                value={profile.displayName}
                onChange={handleChange}
                placeholder="ex. Alex"
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="animate-field-enter" style={{ animationDelay: fieldDelay(1) }}>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                  Vârsta
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  min="10"
                  max="120"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="28"
                  className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
                />
              </div>

              <div className="animate-field-enter" style={{ animationDelay: fieldDelay(2) }}>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                  Greutate (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  required
                  min="30"
                  max="300"
                  value={profile.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
                />
              </div>
            </div>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(3) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Înălțime (cm)
              </label>
              <input
                type="number"
                name="height"
                required
                min="100"
                max="250"
                value={profile.height}
                onChange={handleChange}
                placeholder="175"
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(4) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Obiectivul tău
              </label>
              <div className="relative">
                <select
                  name="goal"
                  required
                  value={profile.goal}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 appearance-none backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all cursor-pointer"
                >
                  <option value="lose_weight">Slăbire</option>
                  <option value="maintain">Menținere</option>
                  <option value="gain_muscle">Creștere musculară</option>
                  <option value="gain_weight">Creștere în greutate</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(5) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Nivel de activitate
              </label>
              <div className="relative">
                <select
                  name="activityLevel"
                  required
                  value={profile.activityLevel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 appearance-none backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all cursor-pointer"
                >
                  <option value="sedentary">Sedentar</option>
                  <option value="light">Ușor activ</option>
                  <option value="moderate">Moderat activ</option>
                  <option value="active">Foarte activ</option>
                  <option value="very_active">Extra activ</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(6) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Ora de culcare
              </label>
              <input
                type="time"
                name="sleepTime"
                required
                value={profile.sleepTime}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="pt-3 animate-field-enter" style={{ animationDelay: "800ms" }}>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează Modificările"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}