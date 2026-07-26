"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredTargets, setStoredTargets, type Targets } from "@/lib/auth/targets";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import { apiFetch } from "@/lib/api/client";
import { ArrowLeft } from "lucide-react";

export default function EditGoalsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<Targets | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredTargets();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets(stored);
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!targets) return;

    const form = e.currentTarget;
    const updated: Targets = {
      target_calories: Number((form.elements.namedItem("target_calories") as HTMLInputElement).value),
      target_protein: Number((form.elements.namedItem("target_protein") as HTMLInputElement).value),
      target_fats: Number((form.elements.namedItem("target_fats") as HTMLInputElement).value),
      late_meal_threshold: targets.late_meal_threshold,
      focus_area: targets.focus_area ?? "general",
    };

    setStoredTargets(updated);

    setSaving(true);
    try {
      await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCalories: updated.target_calories,
          targetProtein: updated.target_protein,
          targetFats: updated.target_fats,
          lateMealThreshold: updated.late_meal_threshold,
          focusArea: updated.focus_area,
        }),
      });
    } catch (err) {
      console.error("[profile/goals] failed to save targets", err);
      alert("Nu am putut salva obiectivele. Verifică conexiunea și încearcă din nou.");
    }
    setSaving(false);

    router.push("/profile");
  }

  if (!targets) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-14 px-5 relative">
      <div className="relative z-10 w-full max-w-[400px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/profile")}
            aria-label="Înapoi"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">Editează Obiectivele</h1>
        </div>

        <div className="glass-card card-animate p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Calorii Zilnice (kcal)
              </label>
              <input
                type="number"
                name="target_calories"
                required
                min="500"
                max="15000"
                defaultValue={targets.target_calories ?? NUTRITION_GOALS.CALORIES}
                placeholder={`${NUTRITION_GOALS.CALORIES}`}
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Obiectiv Proteine (g)
              </label>
              <input
                type="number"
                name="target_protein"
                required
                min="10"
                max="1000"
                defaultValue={targets.target_protein ?? NUTRITION_GOALS.PROTEIN}
                placeholder={`${NUTRITION_GOALS.PROTEIN}`}
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Obiectiv Grăsimi (g)
              </label>
              <input
                type="number"
                name="target_fats"
                required
                min="5"
                max="500"
                defaultValue={targets.target_fats ?? NUTRITION_GOALS.FATS}
                placeholder={`${NUTRITION_GOALS.FATS}`}
                className="w-full rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează Obiectivele"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}