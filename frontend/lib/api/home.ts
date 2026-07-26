/**
 * Home page data layer.
 * Fetches meals from internal /api/journal and performs aggregations.
 */
import { apiFetch } from "./client";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import type {
  MealData,
  DailyTotals,
  RecentMealResult,
  HealthyScoreInput,
} from "@/lib/types";

export type { MealData, DailyTotals, RecentMealResult };

function getDateNDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

async function fetchMealsInRange(start: Date, end: Date): Promise<MealData[]> {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });
  const data = await apiFetch<{ data: MealData[] }>(`/api/journal?${params.toString()}`);
  return data.data ?? [];
}

function computeBackendInputs(
  meals: MealData[],
  days: number
): HealthyScoreInput {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  let todayCalories = 0;
  let todayProtein = 0;
  let todayFats = 0;
  let late_meals_count = 0;

  const dailyMap: Record<string, { calories: number }> = {};

  for (const meal of meals) {
    const dayKey = meal.loggedAt.slice(0, 10);
    const mealCalories = sumItems(meal, "calories");
    const mealProtein = sumItems(meal, "proteinGrams");
    const mealFats = sumItems(meal, "fatGrams");

    if (dayKey === todayStr) {
      todayCalories += mealCalories;
      todayProtein += mealProtein;
      todayFats += mealFats;
    }

    const hour = new Date(meal.loggedAt).getHours();
    if (hour >= NUTRITION_GOALS.LATE_MEAL_HOUR) late_meals_count++;

    if (!dailyMap[dayKey]) dailyMap[dayKey] = { calories: 0 };
    dailyMap[dayKey].calories += mealCalories;
  }

  let days_on_target = 0;
  const startDate = getDateNDaysAgo(days);
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dayCal = dailyMap[key]?.calories ?? 0;
    const ratio = dayCal / NUTRITION_GOALS.CALORIES;
    if (ratio >= NUTRITION_GOALS.ON_TARGET_MIN_RATIO && ratio <= NUTRITION_GOALS.ON_TARGET_MAX_RATIO) days_on_target++;
  }

  return {
    calories: todayCalories,
    protein: todayProtein,
    fats: todayFats,
    target_calories: NUTRITION_GOALS.CALORIES,
    target_protein: NUTRITION_GOALS.PROTEIN,
    target_fats: NUTRITION_GOALS.FATS,
    late_meals_count,
    days_on_target,
  };
}

function sumItems(
  meal: MealData,
  key: "calories" | "proteinGrams" | "carbsGrams" | "fatGrams"
): number {
  return (meal.items ?? []).reduce((sum, item) => sum + Number(item[key] ?? 0), 0);
}

export async function fetchTodayTotals(): Promise<DailyTotals> {
  const start = getDateNDaysAgo(1);
  const end = todayEnd();
  const meals = await fetchMealsInRange(start, end);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.loggedAt.slice(0, 10) === todayStr);

  const totals: DailyTotals = {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    mealCount: todayMeals.length,
  };

  for (const meal of todayMeals) {
    for (const item of meal.items ?? []) {
      totals.calories += Number(item.calories ?? 0);
      totals.proteinGrams += Number(item.proteinGrams ?? 0);
      totals.carbsGrams += Number(item.carbsGrams ?? 0);
      totals.fatGrams += Number(item.fatGrams ?? 0);
    }
  }

  return totals;
}

export async function fetchRecentMeal(): Promise<RecentMealResult | null> {
  const start = new Date("2000-01-01");
  const end = new Date("2100-01-01");
  const meals = await fetchMealsInRange(start, end);

  if (meals.length === 0) return null;

  const last = meals[meals.length - 1];
  const totalCalories = sumItems(last, "calories");

  return {
    title: last.title,
    mealType: last.mealType,
    loggedAt: last.loggedAt,
    calories: totalCalories,
    imageUrl: last.sourceScan?.image?.url ?? null,
  };
}

export async function fetchDailyCaloriesHistory(days: number = 8): Promise<number[]> {
  const end = todayEnd();
  const start = getDateNDaysAgo(days);
  const meals = await fetchMealsInRange(start, end);

  const dailyMap: Record<string, number> = {};
  for (const meal of meals) {
    const dayKey = meal.loggedAt.slice(0, 10);
    const mealCalories = sumItems(meal, "calories");
    dailyMap[dayKey] = (dailyMap[dayKey] ?? 0) + mealCalories;
  }

  const result: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push(dailyMap[key] ?? 0);
  }

  return result;
}

export async function fetchBackendInputs(days: number = NUTRITION_GOALS.DEFAULT_TREND_DAYS): Promise<HealthyScoreInput> {
  const end = todayEnd();
  const start = getDateNDaysAgo(days);
  const meals = await fetchMealsInRange(start, end);
  return computeBackendInputs(meals, days);
}

export async function fetchMealFoodClasses(days: number = NUTRITION_GOALS.DEFAULT_TREND_DAYS): Promise<{ food_class: string }[]> {
  const end = todayEnd();
  const start = getDateNDaysAgo(days);
  const meals = await fetchMealsInRange(start, end);

  const foodClasses: string[] = [];
  for (const meal of meals) {
    for (const item of meal.items ?? []) {
      const slug = item.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z_]/g, "");
      if (slug) foodClasses.push(slug);
    }
  }

  return foodClasses.map((food_class) => ({ food_class }));
}

export function formatMealTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatMealType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}
