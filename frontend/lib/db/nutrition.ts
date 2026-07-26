import type { Prisma } from "@prisma/client";

export type NutritionInput = {
  calories?: unknown;
  protein?: unknown;
  proteinGrams?: unknown;
  carbs?: unknown;
  carbsGrams?: unknown;
  fats?: unknown;
  fatGrams?: unknown;
};

export type NutritionTotals = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

type Decimalish = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: Decimalish): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return value.toNumber();
}

export function normalizeNutrition(input: NutritionInput = {}): NutritionTotals {
  return {
    calories: toFiniteNumber(input.calories),
    proteinGrams: toFiniteNumber(input.proteinGrams ?? input.protein),
    carbsGrams: toFiniteNumber(input.carbsGrams ?? input.carbs),
    fatGrams: toFiniteNumber(input.fatGrams ?? input.fats),
  };
}

export function addNutrition(
  totals: NutritionTotals,
  item: NutritionTotals,
): NutritionTotals {
  return {
    calories: totals.calories + item.calories,
    proteinGrams: totals.proteinGrams + item.proteinGrams,
    carbsGrams: totals.carbsGrams + item.carbsGrams,
    fatGrams: totals.fatGrams + item.fatGrams,
  };
}

export function emptyNutrition(): NutritionTotals {
  return {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
  };
}

export function formatFoodName(label: string): string {
  return label
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "_");
}

function toFiniteNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
