"use client";

import { Apple, Dumbbell, Lock } from "lucide-react";

export type JournalTab = "meals" | "workouts" | "reflections";

interface JournalHeaderProps {
  activeTab: JournalTab;
  onTabChange: (tab: JournalTab) => void;
}

export default function JournalHeader({ activeTab, onTabChange }: JournalHeaderProps) {
  return (
    <header className="px-5 pt-10 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Jurnalul de Azi
          </h1>
          <p className="text-[11px] text-zinc-600">
            Mese, antrenamente și reflecții.
          </p>
        </div>
      </div>

      <div className="mt-3 flex rounded-2xl bg-white/30 p-1 backdrop-blur-sm">
        <button
          onClick={() => onTabChange("meals")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all ${
            activeTab === "meals"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          <Apple className="h-3.5 w-3.5" />
          Alimentație
        </button>
        <button
          onClick={() => onTabChange("workouts")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all ${
            activeTab === "workouts"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Antrenamente
        </button>
        <button
          onClick={() => onTabChange("reflections")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all ${
            activeTab === "reflections"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          Reflecții
        </button>
      </div>
    </header>
  );
}