/**
 * Pure nutrition calculation functions.
 * No React dependency — testable business logic.
 */

import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import type { DailyTotals } from "@/lib/types";

/**
 * Calculates a daily score trend (0–100) from calorie history.
 * Each day is scored as (calories / CALORIES_GOAL) * 100, capped at 100.
 */
export function calculateScoreTrend(dailyHistory: number[]): number[] {
  return dailyHistory.map((c) =>
    Math.min(100, Math.round((c / NUTRITION_GOALS.CALORIES) * 100))
  );
}

export interface MacroPercentages {
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Calculates macro percentages (0–100) relative to daily goals.
 */
export function calculateMacroPercentages(totals: DailyTotals): MacroPercentages {
  return {
    protein: Math.min(
      100,
      Math.round((totals.proteinGrams / NUTRITION_GOALS.PROTEIN) * 100),
    ),
    carbs: Math.min(
      100,
      Math.round((totals.carbsGrams / NUTRITION_GOALS.CARBS) * 100),
    ),
    fats: Math.min(100, Math.round((totals.fatGrams / NUTRITION_GOALS.FATS) * 100)),
  };
}
