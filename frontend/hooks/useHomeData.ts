"use client";

import { useMemo } from "react";
import { useCache } from "@/lib/cache";
import { fetchJournalMealsBulk } from "@/lib/api/journal";
import { fetchHealthyScore, fetchMindScore } from "@/lib/api/backend";
import { calculateScoreTrend, calculateMacroPercentages } from "@/lib/services/nutrition/calculations";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";
import type { MealData, DailyTotals, RecentMealResult, HealthyScoreInput } from "@/lib/types";

export interface HomeData {
  loading: boolean;
  error: string | null;
  totals: DailyTotals;
  recentMeal: RecentMealResult | null;
  nutritionScore: number;
  scoreTrend: number[];
  brainHealthScore: number;
}

function getDateNDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeBackendInputs(meals: MealData[], days: number): HealthyScoreInput {
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

export function useHomeData(): HomeData {
  const bulkEntry = useCache("home-journal-bulk", () => {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = getDateNDaysAgo(7);

    const histStart = getDateNDaysAgo(8);

    return fetchJournalMealsBulk([
      { id: "today", start: todayStart, end: todayEnd },
      { id: "week", start: weekStart, end: todayEnd },
      { id: "history", start: histStart, end: todayEnd },
    ]);
  });

  const { todayMeals, weekMeals, historyMeals } = useMemo(() => {
    const bulk = bulkEntry.data as Record<string, MealData[]> | null;
    return {
      todayMeals: bulk?.today ?? [],
      weekMeals: bulk?.week ?? [],
      historyMeals: bulk?.history ?? [],
    };
  }, [bulkEntry.data]);

  const totals: DailyTotals = useMemo(() => {
    const result: DailyTotals = {
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      mealCount: todayMeals.length,
    };
    for (const meal of todayMeals) {
      for (const item of meal.items ?? []) {
        result.calories += Number(item.calories ?? 0);
        result.proteinGrams += Number(item.proteinGrams ?? 0);
        result.carbsGrams += Number(item.carbsGrams ?? 0);
        result.fatGrams += Number(item.fatGrams ?? 0);
      }
    }
    return result;
  }, [todayMeals]);

  const recentMeal: RecentMealResult | null = useMemo(() => {
    const allMeals = [...todayMeals, ...weekMeals].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
    if (allMeals.length === 0) return null;
    const last = allMeals[0];
    return {
      title: last.title,
      mealType: last.mealType,
      loggedAt: last.loggedAt,
      calories: (last.items ?? []).reduce((s, i) => s + Number(i.calories ?? 0), 0),
      imageUrl: last.sourceScan?.image?.url ?? null,
    };
  }, [todayMeals, weekMeals]);

  const dailyHistory: number[] = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    for (const meal of historyMeals) {
      const dayKey = meal.loggedAt.slice(0, 10);
      const mealCalories = (meal.items ?? []).reduce((s, i) => s + Number(i.calories ?? 0), 0);
      dailyMap[dayKey] = (dailyMap[dayKey] ?? 0) + mealCalories;
    }
    const result: number[] = [];
    const start = getDateNDaysAgo(8);
    for (let i = 0; i < 8; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push(dailyMap[key] ?? 0);
    }
    return result;
  }, [historyMeals]);

  const inputs = useMemo(() => computeBackendInputs(historyMeals, 7), [historyMeals]);
  const foodClasses = useMemo(() => {
    const classes: string[] = [];
    for (const meal of weekMeals) {
      for (const item of meal.items ?? []) {
        const slug = item.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
        if (slug) classes.push(slug);
      }
    }
    return classes.map((food_class) => ({ food_class }));
  }, [weekMeals]);

  const mealCount = totals.mealCount;

  const healthyScoreEntry = useCache(
    "home-healthy-score",
    mealCount > 0
      ? () => fetchHealthyScore(inputs)
      : () => Promise.resolve({ healthy_score: 0 }),
  );

  const mindScoreEntry = useCache(
    "home-mind-score",
    mealCount > 0 && foodClasses.length > 0
      ? () => fetchMindScore(foodClasses)
      : () => Promise.resolve({ brain_nutrition_score: 0 }),
  );

  const anyLoading =
    bulkEntry.loading ||
    (mealCount > 0 && (healthyScoreEntry.loading || mindScoreEntry.loading));

  const anyError = bulkEntry.error;

  const scoreTrend = useMemo(() => calculateScoreTrend(dailyHistory), [dailyHistory]);

  const nutritionScore = (healthyScoreEntry.data as { healthy_score: number } | null)?.healthy_score ?? 0;
  const brainHealthScore = Math.round(
    (mindScoreEntry.data as { brain_nutrition_score: number } | null)?.brain_nutrition_score ?? 0,
  );

  return {
    loading: anyLoading,
    error: anyError,
    totals,
    recentMeal,
    nutritionScore,
    scoreTrend,
    brainHealthScore,
  };
}

export function useMacroPercentages(totals: DailyTotals) {
  return useMemo(() => calculateMacroPercentages(totals), [totals]);
}