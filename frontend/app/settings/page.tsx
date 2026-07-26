"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

interface SabbathConfig {
  id: string | null;
  userId: string;
  sabbathDay: number;
  isActive: boolean;
}

const DAYS: { value: number; label: string }[] = [
  { value: 0, label: "Duminică" },
  { value: 1, label: "Luni" },
  { value: 2, label: "Marți" },
  { value: 3, label: "Miercuri" },
  { value: 4, label: "Joi" },
  { value: 5, label: "Vineri" },
  { value: 6, label: "Sâmbătă" },
];

const fieldDelay = (index: number) => `${100 + index * 100}ms`;

export default function SabbathSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SabbathConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<{ data: SabbathConfig }>("/api/sabbath/config");
        if (mounted) setConfig(res.data);
      } catch {
        if (mounted) {
          setConfig({ id: null, userId: "", sabbathDay: 6, isActive: true });
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetch<{ data: SabbathConfig }>("/api/sabbath/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sabbathDay: config.sabbathDay,
          isActive: config.isActive,
        }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError("Nu s-a putut salva. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[13px] text-zinc-500">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-6 px-5 relative">
      <div className="relative z-10 w-full max-w-[400px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all"
            aria-label="Înapoi"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">Zi de Repaus Digital</h1>
        </div>

        <div className="glass-card card-animate p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="flex items-center justify-between rounded-xl border border-white/40 bg-white/40 px-4 py-3.5 backdrop-blur-sm animate-field-enter"
              style={{ animationDelay: fieldDelay(0) }}
            >
              <div>
                <p className="text-[13px] font-semibold text-zinc-900">Activare zi de repaus</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Blochează aplicația în ziua aleasă
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-500" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="animate-field-enter" style={{ animationDelay: fieldDelay(1) }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Ziua de repaus
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map((day) => {
                  const selected = config.sabbathDay === day.value;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setConfig({ ...config, sabbathDay: day.value })}
                      className={`rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-all ${
                        selected
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                          : "border border-white/40 bg-white/40 text-zinc-600 hover:bg-white/60"
                      }`}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 animate-field-enter"
              style={{ animationDelay: fieldDelay(2) }}
            >
              <p className="text-[11px] leading-relaxed text-emerald-700">
                În ziua de repaus, aplicația se blochează automat și afișează un ecran de
                desconectare. Restul aplicațiilor din telefon nu sunt afectate.
              </p>
            </div>

            {error && (
              <p className="text-[12px] font-medium text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-[12px] font-medium text-emerald-600">
                Setările au fost salvate.
              </p>
            )}

            <div className="pt-1 animate-field-enter" style={{ animationDelay: fieldDelay(3) }}>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}