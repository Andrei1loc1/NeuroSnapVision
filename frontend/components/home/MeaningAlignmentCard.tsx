"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { fetchNorthStar } from "@/lib/api/four-levels";

interface AlignmentData {
  alignmentScore: number;
  reflection: string | null;
  date: string;
}

interface AlignmentGetResponse {
  data: AlignmentData | null;
}

interface AlignmentPostResponse {
  data: AlignmentData;
}

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE = 5;

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getRingColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getMessage(score: number): string {
  if (score >= 80) return "Aliniat cu North Star-ul.";
  if (score >= 60) return "Pe drumul cel bun.";
  if (score >= 40) return "Direcția necesită atenție.";
  return "Deconectat de la sens.";
}

function MeaningAlignmentCard() {
  const [alignment, setAlignment] = useState<AlignmentData | null>(null);
  const [northStar, setNorthStar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    Promise.allSettled([
      apiFetch<AlignmentGetResponse>("/api/purpose/alignment"),
      fetchNorthStar(),
    ]).then(([alignmentResult, northStarResult]) => {
      if (alignmentResult.status === "fulfilled" && alignmentResult.value.data) {
        setAlignment(alignmentResult.value.data);
      }
      if (northStarResult.status === "fulfilled") {
        setNorthStar(northStarResult.value.northStar);
      }
      setLoading(false);
    });
  }, []);

  const handleCompute = useCallback(async () => {
    setComputing(true);
    try {
      const result = await apiFetch<AlignmentPostResponse>("/api/purpose/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setAlignment(result.data);
    } catch {
    } finally {
      setComputing(false);
    }
  }, []);

  if (!mounted) {
    return (
      <section className="glass-card card-animate mx-5 mt-2 p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-200/50" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-zinc-200/50" />
        </div>
      </section>
    );
  }

  const score = alignment?.alignmentScore ?? 0;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const hasData = alignment !== null;

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
          <Compass className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <h3 className="text-[13px] font-semibold text-zinc-700">Aliniere de Sens</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-3">
          <div className="h-[68px] w-[68px] shrink-0 animate-pulse rounded-full bg-zinc-200/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-36 animate-pulse rounded bg-zinc-200/50" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-200/50" />
          </div>
        </div>
      ) : hasData ? (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <svg className="h-[68px] w-[68px] -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={STROKE}
              />
              <circle
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                stroke={getRingColor(score)}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {computing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
              ) : (
                <>
                  <span className={`text-xl font-bold leading-none ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-400">/100</span>
                </>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[12px] leading-snug text-zinc-600">
              {getMessage(score)}
            </p>
            {alignment.reflection && (
              <p className="mt-1 text-[11px] italic leading-snug text-zinc-500">
                &ldquo;{alignment.reflection}&rdquo;
              </p>
            )}
            {northStar && (
              <div className="mt-1 flex items-start gap-1">
                <span className="mt-px text-[10px] leading-none text-amber-500">★</span>
                <p className="text-[10px] font-medium leading-snug text-amber-600/80">
                  {northStar}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-zinc-100/60">
            <Compass className="h-5 w-5 text-zinc-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-zinc-500">
              Calculează alinierea dintre acțiunile tale și North Star-ul tău.
            </p>
            {northStar && (
              <div className="mt-1 flex items-start gap-1">
                <span className="mt-px text-[10px] leading-none text-amber-500">★</span>
                <p className="text-[10px] font-medium leading-snug text-amber-600/80">
                  {northStar}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData && !loading && (
        <button
          onClick={handleCompute}
          disabled={computing}
          className="mt-3 w-full rounded-xl bg-amber-500 px-3 py-2 text-[12px] font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] disabled:animate-pulse disabled:opacity-60"
        >
          {computing ? "Se calculează..." : "Calculează alinierea"}
        </button>
      )}
    </section>
  );
}

export default React.memo(MeaningAlignmentCard);