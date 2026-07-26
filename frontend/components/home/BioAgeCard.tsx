"use client";

import React from "react";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BioAgeSnapshot } from "@/lib/types";

interface BioAgeCardProps {
  bioAge: BioAgeSnapshot | null;
  trendData: number[];
}

function getPaceColor(label: BioAgeSnapshot["paceLabel"]): string {
  if (label === "decelerating") return "text-emerald-500";
  if (label === "normal") return "text-zinc-600";
  return "text-amber-500";
}

function getPaceBadge(label: BioAgeSnapshot["paceLabel"]): string {
  if (label === "decelerating") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60";
  if (label === "normal") return "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/60";
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60";
}

function getPaceText(label: BioAgeSnapshot["paceLabel"]): string {
  if (label === "decelerating") return "Îmbunătățire";
  if (label === "normal") return "Stabil";
  return "Declin";
}

function BioAgeCard({ bioAge, trendData }: BioAgeCardProps) {
  const [showInfo, setShowInfo] = React.useState(false);
  const biologicalAge = bioAge?.biologicalAge ?? 0;
  const chronologicalAge = bioAge?.chronologicalAge ?? 0;
  const paceOfAging = bioAge?.paceOfAging ?? 1;
  const delta = biologicalAge - chronologicalAge;

  const data = trendData.length > 0
    ? trendData.map((v) => ({ value: v }))
    : [];

  const hasTrend = trendData.length >= 2;

  return (
    <section className="glass-card card-animate relative mx-5 mt-2 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
              Vârstă Stil de Viață
            </p>
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                aria-label="Mai multe informații despre vârsta biologică"
                className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-700 hover:bg-zinc-100"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          {showInfo && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setShowInfo(false)}
              />
              <div className="absolute left-4 right-4 top-16 z-[100] rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl">
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Vârsta biologică măsoară cât de îmbătrânit e corpul tău, comparativ cu vârsta reală. Un număr mai mic = corp mai tânăr. Ritmul arată viteza de îmbătrânire: sub 1.0× = încetinești, peste 1.0× = accelerezi.
                </p>
                <button onClick={() => setShowInfo(false)} className="mt-2 text-[10px] font-medium text-emerald-600">Am înțeles</button>
              </div>
            </>
          )}

          <div className="mt-1 flex items-baseline gap-2">
            {bioAge ? (
              <span className="bg-gradient-to-br from-zinc-800 to-zinc-600 bg-clip-text text-[36px] font-bold leading-none tracking-tight text-transparent">
                {biologicalAge.toFixed(1)}
              </span>
            ) : (
              <span className="inline-block h-[36px] w-20 animate-pulse rounded-md bg-zinc-200/60" />
            )}
            <span className="text-sm font-medium text-zinc-600">ani</span>
          </div>

          {bioAge && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-600">{chronologicalAge} ani reali</span>
              <span className="text-[11px] text-zinc-400">·</span>
              <span className={`text-[11px] font-semibold ${delta <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {delta <= 0 ? "" : "+"}{delta.toFixed(1)}
              </span>
              <span className="text-[11px] text-zinc-400">·</span>
              <span className={`text-[11px] font-semibold ${getPaceColor(bioAge.paceLabel)}`}>
                {paceOfAging.toFixed(2)}×
              </span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getPaceBadge(bioAge.paceLabel)}`}>
                {getPaceText(bioAge.paceLabel)}
              </span>
            </div>
          )}
        </div>

        <div className="h-16 w-24 shrink-0">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#bioGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Skeleton className="h-10 w-20" />
            </div>
          )}
        </div>
      </div>

      <Link
        href="/bio-age"
        className="group mt-3 flex w-fit items-center gap-1.5 rounded-full bg-zinc-900/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-all duration-200 hover:bg-zinc-900/10 active:scale-[0.97]"
      >
        Vezi Detalii
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}

export default React.memo(BioAgeCard);