import { getTodayProtocol } from "@/lib/api/bio-age";
import { getCurrentBioAge, getBioAgeHistory } from "@/lib/api/bio-age";
import {
  fetchTodayTotals,
  fetchRecentMeal,
  fetchDailyCaloriesHistory,
  fetchBackendInputs,
  fetchMealFoodClasses,
} from "@/lib/api/home";
import { fetchReport, fetchWeeklyCalories, fetchMealsInRange } from "@/lib/api/reports";
import type { DataCacheContextType } from "./DataCacheContext";

export function prefetchHomePage(cache: DataCacheContextType, userId: string, age: number) {
  cache.prefetch(`bio-age-snapshot-${userId}-${age}`, () => getCurrentBioAge(userId, age));
  cache.prefetch(`protocol-today-${userId}`, () => getTodayProtocol(userId));
  cache.prefetch("home-totals", () => fetchTodayTotals());
  cache.prefetch("home-recent-meal", () => fetchRecentMeal());
  cache.prefetch("home-daily-history", () => fetchDailyCaloriesHistory(8));
  cache.prefetch("home-backend-inputs", () => fetchBackendInputs(7));
  cache.prefetch("home-meal-food-classes", () => fetchMealFoodClasses(7));
}

export function prefetchBioAgePage(cache: DataCacheContextType, userId: string, age: number) {
  cache.prefetch(`bio-age-snapshot-${userId}-${age}`, () => getCurrentBioAge(userId, age));
  cache.prefetch(`bio-age-history-${userId}-365`, () => getBioAgeHistory(userId, 365));
}

export function prefetchJournalPage(cache: DataCacheContextType) {
  cache.prefetch("home-totals", () => fetchTodayTotals());
  cache.prefetch("home-recent-meal", () => fetchRecentMeal());
}

export function prefetchProtocolPage(cache: DataCacheContextType, userId: string) {
  cache.prefetch(`protocol-today-${userId}`, () => getTodayProtocol(userId));
}

export function prefetchReportsPage(cache: DataCacheContextType) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  cache.prefetch("reports-week", () => fetchReport(startStr, endStr));
  cache.prefetch("reports-weekly-calories", () => fetchWeeklyCalories(startStr, endStr));
  cache.prefetch("reports-meals-in-range", () => fetchMealsInRange(startStr, endStr));
  cache.prefetch("home-backend-inputs", () => fetchBackendInputs(7));
  cache.prefetch("home-meal-food-classes", () => fetchMealFoodClasses(7));
}