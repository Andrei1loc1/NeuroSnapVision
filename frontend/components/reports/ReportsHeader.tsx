"use client";

import { CalendarDays, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportsHeaderProps {
  dateRangeLabel?: string;
}

export default function ReportsHeader({ dateRangeLabel = "May 14 - May 20" }: ReportsHeaderProps) {
  const router = useRouter();

  return (
    <header className="px-5 pt-10 pb-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          aria-label="Înapoi acasă"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm transition-colors hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Rapoarte</h1>
          <p className="text-[11px] text-zinc-600">{dateRangeLabel}</p>
        </div>
        <button
          aria-label="Selectează intervalul de date"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 backdrop-blur-xl"
        >
          <CalendarDays className="h-4 w-4 text-emerald-500" />
        </button>
      </div>
    </header>
  );
}