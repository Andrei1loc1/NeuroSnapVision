"use client";

import { useState, useMemo } from "react";
import { Sparkles, Check, Loader2, Camera } from "lucide-react";
import type { PredictionResult } from "@/lib/types";

interface PredictionPanelProps {
  predictionInfo: PredictionResult | null;
  isPredicting: boolean;
  isAddingToJournal: boolean;
  journalStatus: string | null;
  capturedImage: string | null;
  onSaveMeal: (items: PredictionResult[], portion: string) => void;
}

const PORTIONS = [
  { key: "small", label: "S", multiplier: 0.7 },
  { key: "medium", label: "M", multiplier: 1.0 },
  { key: "large", label: "L", multiplier: 1.3 },
] as const;

function formatName(pred: PredictionResult): string {
  if (pred.display_name) return pred.display_name;
  return (
    pred.food_class
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Aliment"
  );
}

export default function PredictionPanel({
  predictionInfo,
  isPredicting,
  isAddingToJournal,
  journalStatus,
  capturedImage,
  onSaveMeal,
}: PredictionPanelProps) {
  const regions = predictionInfo?.all_regions ?? [];
  const hasRegions = regions.length > 0;

  if (isPredicting && !hasRegions) {
    return (
      <div className="absolute inset-x-5 bottom-[7.2rem] z-30 mx-auto max-w-md">
        <div className="rounded-[1.6rem] border border-white/40 bg-white/10 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-100">
            <Loader2 size={14} className="animate-spin" />
            Analizare mâncare...
          </div>
        </div>
      </div>
    );
  }

  if (!hasRegions && !capturedImage) {
    return (
      <div className="absolute inset-x-5 bottom-[7.2rem] z-30 mx-auto max-w-md">
        <div className="rounded-[1.6rem] border border-white/40 bg-white/10 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <Camera size={21} className="text-emerald-200" />
            <div>
              <h3 className="text-sm font-semibold">Pregătit pentru scanare</h3>
              <p className="text-[11px] font-medium text-white/65">
                Îndreaptă camera spre mâncare
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-5 bottom-[7.2rem] z-30 mx-auto max-w-md">
      <div className="rounded-[1.6rem] border border-white/40 bg-white/10 p-3.5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-2xl pointer-events-auto">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-100">
            <Sparkles size={14} />
            {regions.length > 1
              ? `${regions.length} alimente detectate`
              : "1 aliment detectat"}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-400/20 px-3">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
            <span className="text-[11px] font-semibold text-emerald-50">Gata</span>
          </div>
        </div>

        <MultiFoodView
          regions={regions}
          isAdding={isAddingToJournal}
          journalStatus={journalStatus}
          onSaveMeal={onSaveMeal}
        />
      </div>
    </div>
  );
}

function MultiFoodView({
  regions,
  isAdding,
  journalStatus,
  onSaveMeal,
}: {
  regions: PredictionResult[];
  isAdding: boolean;
  journalStatus: string | null;
  onSaveMeal: (items: PredictionResult[], portion: string) => void;
}) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(regions.map((_, i) => i)),
  );
  const [portion, setPortion] = useState<string>("medium");

  const portionMultiplier = useMemo(() => {
    return PORTIONS.find((p) => p.key === portion)?.multiplier ?? 1.0;
  }, [portion]);

  const toggleFood = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    regions.forEach((region, i) => {
      if (!selectedIndices.has(i)) return;
      const n = region.nutrition;
      if (!n) return;
      calories += Math.round((n.calories ?? 0) * portionMultiplier);
      protein += Math.round((n.protein ?? 0) * portionMultiplier);
      carbs += Math.round((n.carbs ?? 0) * portionMultiplier);
      fats += Math.round((n.fats ?? 0) * portionMultiplier);
    });
    return { calories, protein, carbs, fats };
  }, [regions, selectedIndices, portionMultiplier]);

  const selectedItems = useMemo(
    () => regions.filter((_, i) => selectedIndices.has(i)),
    [regions, selectedIndices],
  );

  const handleSave = () => {
    if (selectedItems.length === 0) return;
    onSaveMeal(selectedItems, portion);
  };

  return (
    <>
      <div className="space-y-2">
        {regions.map((region, index) => {
          const isSelected = selectedIndices.has(index);
          const name = formatName(region);
          const yoloConf = region.yolo_confidence
            ? (region.yolo_confidence * 100).toFixed(0)
            : null;
          const classConf =
            region.confidence !== undefined ? region.confidence.toFixed(0) : null;
          const calories = region.nutrition?.calories ?? 0;
          const scaledCalories = Math.round(calories * portionMultiplier);

          return (
            <button
              key={index}
              onClick={() => toggleFood(index)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 transition ${
                isSelected
                  ? "border-emerald-400 bg-emerald-400/20"
                  : "border-white/20 bg-white/5 opacity-40 hover:opacity-70"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-400 text-emerald-950"
                    : "border-white/40 bg-transparent"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>

              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-emerald-500/20">
                {region.crop_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={region.crop_image}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-emerald-200">
                    <Camera size={15} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-semibold text-white">
                  {name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {classConf && (
                    <span className="text-[10px] font-medium text-emerald-200/80">
                      {classConf}%
                    </span>
                  )}
                  {yoloConf && yoloConf !== "0" && (
                    <>
                      <span className="text-[10px] text-white/30">·</span>
                      <span className="text-[10px] text-white/50">
                        detectat {yoloConf}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs font-bold text-emerald-100">
                  {scaledCalories}
                </div>
                <div className="text-[9px] text-white/50">kcal</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="my-2.5 h-px bg-white/15" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-white/70">Porție:</span>
        <div className="flex gap-1.5">
          {PORTIONS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPortion(p.key)}
              className={`flex h-7 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                portion === p.key
                  ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="my-2.5 h-px bg-white/15" />

      <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 px-3 py-2">
        <span className="text-[11px] font-bold text-emerald-100">Total</span>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-50">
          <span className="text-white">{totals.calories} kcal</span>
          <span className="text-white/30">·</span>
          <span>P:{totals.protein}</span>
          <span className="text-white/30">·</span>
          <span>C:{totals.carbs}</span>
          <span className="text-white/30">·</span>
          <span>F:{totals.fats}</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isAdding || selectedItems.length === 0}
        className="mt-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2.5 text-xs font-bold text-emerald-950 transition hover:from-emerald-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding
          ? "Se salvează..."
          : `Salvează masa completă (${selectedItems.length})`}
      </button>

      {journalStatus && (
        <p className="mt-1.5 text-center text-[11px] font-semibold text-emerald-100/80">
          {journalStatus}
        </p>
      )}
    </>
  );
}