"use client";

import { useState, useEffect } from "react";
import { usePurpose } from "@/hooks/usePurpose";
import { apiFetch } from "@/lib/api/client";
import type { MeaningAlignment } from "@/lib/api/four-levels";
import { Moon, Loader2 } from "lucide-react";

function isEvening(): boolean {
  const hour = new Date().getHours();
  return hour >= 20;
}

function generateGenericReflection(northStar: string | null): string {
  if (northStar) {
    return `Astăzi ai făcut pași care contează. Fiecare alegere te-a apropiat de „${northStar}". Nu perfecțiunea contează, ci direcția. Odihnește-te bine.`;
  }
  return "Astăzi ai făcut alegeri care contează. Fiecare pas mic e un act de grijă față de tine. Nu perfecțiunea contează, ci direcția. Odihnește-te bine.";
}

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  } catch {
    return false;
  }
}

export default function EveningReflection() {
  const [mounted, setMounted] = useState(false);
  const { purpose } = usePurpose();
  const northStar = purpose?.northStar;
  const [alignment, setAlignment] = useState<MeaningAlignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!isEvening()) return;
    setLoading(true);
    apiFetch<MeaningAlignment>("/api/purpose/alignment")
      .then((res) => {
        const data = (res as { data?: MeaningAlignment } | MeaningAlignment) as Record<string, unknown>;
        const alignmentData = (data?.data ?? res) as MeaningAlignment | null;
        setAlignment(alignmentData);
        if (alignmentData?.gratitudeNote) {
          setGratitude(alignmentData.gratitudeNote);
          setSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [northStar]);

  if (!mounted || !isEvening()) return null;

  const todayReflection = isToday(alignment?.date) ? alignment?.reflection : null;
  const reflection = todayReflection ?? generateGenericReflection(purpose?.northStar ?? null);
  const score = isToday(alignment?.date) ? alignment?.alignmentScore : null;

  async function handleSaveGratitude() {
    if (!gratitude.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/purpose/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gratitudeNote: gratitude.trim(), gratitudeOnly: true }),
      });
      setSaved(true);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-amber-500" />
            )}
          </div>
          <p className="text-[13px] font-semibold text-zinc-700">Reflecția de seară</p>
        </div>
        <span className="text-[10px] font-medium text-zinc-700">Sinteză logoterapeutică</span>
      </div>

      <div className="rounded-xl bg-white/40 p-3">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <div className="h-2 w-24 animate-pulse rounded bg-amber-200/60" />
          </div>
        ) : (
          <p className="text-[12px] leading-relaxed text-zinc-600">{reflection}</p>
        )}
      </div>

      {score !== null && !loading && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium text-zinc-700">Aliniere cu sensul</span>
            <span className="text-[10px] font-semibold text-amber-600">{score}/100</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, score ?? 0))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-600">Notă de recunoștință</span>
        </div>
        {saved ? (
          <p className="text-[11px] italic text-emerald-600">Mulțumim. Nota a fost salvată.</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Ce îți aduce recunoștință azi?"
              className="flex-1 rounded-xl border border-amber-200/40 bg-white/40 px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all"
            />
            <button
              onClick={handleSaveGratitude}
              disabled={!gratitude.trim() || saving}
              className="rounded-xl bg-amber-500/15 px-3 py-2 text-[11px] font-semibold text-amber-700 transition-all hover:bg-amber-500/25 active:scale-95 disabled:opacity-30"
            >
              {saving ? "..." : "Salvează"}
            </button>
          </div>
        )}
      </div>

      {purpose?.northStar && (
        <p className="mt-3 text-center text-[10px] text-zinc-400">
          ★ {purpose.northStar}
        </p>
      )}
    </section>
  );
}