"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import type { DailyProtocol } from "@/lib/types";

const RECOVERY_EMOJIS = ["😴", "😐", "🙂", "😊", "😃"];
const ENERGY_LEVELS = ["⚡", "⚡⚡", "⚡⚡⚡", "⚡⚡⚡⚡", "⚡⚡⚡⚡⚡"];

interface ProtocolQuickCheckProps {
  protocol: DailyProtocol | null;
  streak: number;
  onMorningSubmit: (data: { recovery: number; energy: number }) => void;
  onEveningSubmit: (data: { stress: number; digestion: number }) => void;
}

function ScaleButton({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: string[];
  value: number | null;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`flex items-center justify-center rounded-xl transition-all ${
            size === "sm" ? "h-9 min-w-[36px] px-2 text-sm" : "h-10 min-w-[40px] px-2.5 text-sm"
          } ${
            value === i + 1
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50"
              : "bg-white/40 text-zinc-600 hover:bg-white/60"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ProtocolQuickCheck({
  protocol,
  streak,
  onMorningSubmit,
  onEveningSubmit,
}: ProtocolQuickCheckProps) {
  const [morningRecovery, setMorningRecovery] = useState<number | null>(
    protocol?.morningRecovery ?? null
  );
  const [morningEnergy, setMorningEnergy] = useState<number | null>(
    protocol?.morningEnergy ?? null
  );
  const [eveningStress, setEveningStress] = useState<number | null>(
    protocol?.eveningStress ?? null
  );
  const [eveningDigestion, setEveningDigestion] = useState<number | null>(
    protocol?.eveningDigestion ?? null
  );

  const morningComplete =
    protocol?.morningRecovery !== null && protocol?.morningRecovery !== undefined;
  const eveningComplete =
    protocol?.eveningStress !== null && protocol?.eveningStress !== undefined;

  const canSubmitMorning = morningRecovery !== null && morningEnergy !== null;
  const canSubmitEvening = eveningStress !== null && eveningDigestion !== null;

  return (
    <section className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-600">
          Ritual Zilnic
        </p>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">
              {streak} zile consecutive
            </span>
          </div>
        )}
      </div>

      {!morningComplete && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Dimineața
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Recuperare</span>
              <ScaleButton
                options={RECOVERY_EMOJIS}
                value={morningRecovery}
                onChange={setMorningRecovery}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Energie</span>
              <ScaleButton
                options={ENERGY_LEVELS}
                value={morningEnergy}
                onChange={setMorningEnergy}
              />
            </div>
            {canSubmitMorning && (
              <button
                onClick={() => {
                  if (morningRecovery !== null && morningEnergy !== null) {
                    onMorningSubmit({
                      recovery: morningRecovery,
                      energy: morningEnergy,
                    });
                  }
                }}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                Salvează Dimineața
              </button>
            )}
          </div>
        </div>
      )}

      {morningComplete && !eveningComplete && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Seara
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Stres</span>
              <ScaleButton
                options={RECOVERY_EMOJIS}
                value={eveningStress}
                onChange={setEveningStress}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Digestie</span>
              <ScaleButton
                options={RECOVERY_EMOJIS}
                value={eveningDigestion}
                onChange={setEveningDigestion}
              />
            </div>
            {canSubmitEvening && (
              <button
                onClick={() => {
                  if (eveningStress !== null && eveningDigestion !== null) {
                    onEveningSubmit({
                      stress: eveningStress,
                      digestion: eveningDigestion,
                    });
                  }
                }}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
              >
                Salvează Seara
              </button>
            )}
          </div>
        </div>
      )}

      {morningComplete && eveningComplete && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-emerald-600">
          <Flame className="h-4 w-4" />
          Toate check-in-urile complete azi!
        </div>
      )}
    </section>
  );
}
