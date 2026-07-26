/**
 * Journal meal mappers.
 * Pure data transformation from API MealData to UI JournalMeal.
 */

import { formatMealTime, formatMealType } from "@/lib/api/home";
import type { MealData, NutritionTotals } from "@/lib/types";
import type { JournalMeal } from "@/components/journal/MealTimeline";

export type { JournalMeal };

/**
 * Sums all nutrition values across a meal's items.
 */
export function sumMealNutrition(meal: MealData): NutritionTotals {
  return (meal.items ?? []).reduce(
    (acc, item) => ({
      calories: acc.calories + Number(item.calories ?? 0),
      proteinGrams: acc.proteinGrams + Number(item.proteinGrams ?? 0),
      carbsGrams: acc.carbsGrams + Number(item.carbsGrams ?? 0),
      fatGrams: acc.fatGrams + Number(item.fatGrams ?? 0),
    }),
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
  );
}

/**
 * Formats a portion size string: "MEDIUM" → "Medium".
 */
export function formatPortionSize(portion: string | null | undefined): string | null {
  if (!portion) return null;
  return portion.charAt(0) + portion.slice(1).toLowerCase();
}

/**
 * Maps an API MealData object to a UI-ready JournalMeal.
 */
export function mapToJournalMeal(meal: MealData): JournalMeal {
  const totals = sumMealNutrition(meal);
  const portionSize = formatPortionSize(meal.items?.[0]?.portionSize);

  return {
    id: meal.id,
    time: formatMealTime(meal.loggedAt),
    label: formatMealType(meal.mealType),
    title: meal.title,
    calories: totals.calories,
    image: meal.sourceScan?.image?.url,
    macros: `${Math.round(totals.proteinGrams)}g protein · ${Math.round(totals.carbsGrams)}g carbs · ${Math.round(totals.fatGrams)}g fats`,
    portionSize,
    metabolicMultiplier: meal.metabolicMultiplier ?? null,
    stressMultiplier: meal.stressMultiplier ?? null,
  };
}

/**
 * Aggregates daily nutrition totals across multiple meals.
 */
export function calculateDailySummary(meals: MealData[]): NutritionTotals {
  return meals.reduce(
    (totals, meal) => {
      for (const item of meal.items ?? []) {
        totals.calories += Number(item.calories ?? 0);
        totals.proteinGrams += Number(item.proteinGrams ?? 0);
        totals.carbsGrams += Number(item.carbsGrams ?? 0);
        totals.fatGrams += Number(item.fatGrams ?? 0);
      }
      return totals;
    },
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
  );
}
