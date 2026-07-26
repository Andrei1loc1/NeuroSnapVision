"use client";

import { useState } from "react";

export type PortionValue = "small" | "medium" | "large";

type PortionOption = {
  value: PortionValue;
  label: string;
};

const options: PortionOption[] = [
  { value: "small", label: "Mică" },
  { value: "medium", label: "Medie" },
  { value: "large", label: "Mare" },
];

type PortionSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portion: PortionValue) => void;
  isSaving?: boolean;
};

export default function PortionSelectorModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: PortionSelectorModalProps) {
  const [selected, setSelected] = useState<PortionValue>("medium");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xs rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <h2 className="text-center text-lg font-semibold text-white">
          Selectează Porția
        </h2>

        <div className="mt-6 space-y-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              disabled={isSaving}
              className={`flex w-full items-center justify-center rounded-2xl border px-4 py-3.5 text-sm font-semibold transition active:scale-95 ${
                selected === opt.value
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-100"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              } disabled:opacity-50 disabled:active:scale-100`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSave(selected)}
          disabled={isSaving}
          className="mt-6 w-full rounded-full bg-emerald-400 py-3 text-sm font-bold text-emerald-950 shadow-[0_12px_35px_rgba(34,197,94,0.35)] transition hover:bg-emerald-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Se salvează..." : "Salvează în Jurnal"}
        </button>
      </div>
    </div>
  );
}
