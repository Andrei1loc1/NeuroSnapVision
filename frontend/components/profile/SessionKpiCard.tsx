"use client";

import { useEffect, useState } from "react";
import { Clock, Activity } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

interface SessionData {
  kpiScore: number;
  sessionCount: number;
  totalDurationSec: number;
  avgDurationSec: number;
}

interface SessionResponse {
  data?: SessionData | null;
}

function kpiLabel(score: number): string {
  if (score >= 80) return "Excelent";
  if (score >= 60) return "Bine";
  if (score >= 40) return "Mediu";
  return "Slab";
}

function kpiColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-rose-500";
}

function kpiBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-amber-400";
  return "bg-rose-400";
}

export default function SessionKpiCard() {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<SessionResponse>("/api/session/metric")
      .then((res) => {
        if (!active) return;
        const d = res?.data ?? null;
        if (d) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <section className="glass-card card-animate mx-5 mt-2 p-4">
        <div className="h-16 animate-pulse rounded-xl bg-zinc-200/30" />
      </section>
    );
  }

  if (!data) return null;

  const minutes = Math.round(data.avgDurationSec / 60);
  const score = Math.round(data.kpiScore);

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/50">
          <Clock className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <p className="text-[13px] font-semibold text-zinc-700">Sesiuni azi</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/40 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400">Scor</p>
          <p className={`text-base font-bold ${kpiColor(score)}`}>{score}</p>
          <p className="text-[9px] text-zinc-400">{kpiLabel(score)}</p>
        </div>
        <div className="rounded-xl bg-white/40 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400">Sesiuni</p>
          <p className="text-base font-bold text-zinc-800">{data.sessionCount}</p>
          <p className="text-[9px] text-zinc-400">azi</p>
        </div>
        <div className="rounded-xl bg-white/40 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400">Mediu</p>
          <p className="text-base font-bold text-zinc-800">{minutes}</p>
          <p className="text-[9px] text-zinc-400">min</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-zinc-400">Eficiență</span>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span className={`text-[10px] font-semibold ${kpiColor(score)}`}>{score}%</span>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900/[0.04]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${kpiBarColor(score)}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>
    </section>
  );
}