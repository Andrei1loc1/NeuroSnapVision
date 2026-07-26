import type { Meal, MealItem, ReportSnapshot, Scan, ScanImage } from "@prisma/client";
import { toNumber } from "./nutrition";

type ScanWithRelations = Scan & {
  image?: ScanImage | null;
};

type MealWithItems = Meal & {
  items: MealItem[];
  sourceScan?: ScanWithRelations | null;
};

export function serializeScan(scan: ScanWithRelations) {
  return {
    ...scan,
    confidence: toNumber(scan.confidence),
    calories: toNumber(scan.calories),
    proteinGrams: toNumber(scan.proteinGrams),
    carbsGrams: toNumber(scan.carbsGrams),
    fatGrams: toNumber(scan.fatGrams),
  };
}

export function serializeMeal(meal: MealWithItems) {
  return {
    ...meal,
    items: meal.items.map((item) => ({
      ...item,
      quantity: toNumber(item.quantity),
      calories: toNumber(item.calories),
      proteinGrams: toNumber(item.proteinGrams),
      carbsGrams: toNumber(item.carbsGrams),
      fatGrams: toNumber(item.fatGrams),
    })),
    sourceScan: meal.sourceScan
      ? {
          ...meal.sourceScan,
          image: meal.sourceScan.image ?? null,
        }
      : null,
  };
}

export function serializeReport(report: ReportSnapshot) {
  return {
    ...report,
    totalCalories: toNumber(report.totalCalories),
    totalProteinGrams: toNumber(report.totalProteinGrams),
    totalCarbsGrams: toNumber(report.totalCarbsGrams),
    totalFatGrams: toNumber(report.totalFatGrams),
  };
}
