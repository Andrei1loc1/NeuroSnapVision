/**
 * Preia datele rapoartelor prin rutele API interne.
 */
import { apiFetch } from "./client";
import type { ReportData, DailyCalories, MealData } from "@/lib/types";

export type { ReportData, DailyCalories, MealData };

export async function fetchReport(start?: string, end?: string): Promise<ReportData> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const data = await apiFetch<{ data: ReportData }>(`/api/reports?${params.toString()}`);
  return data.data;
}

export async function fetchWeeklyCalories(start: string, end: string): Promise<DailyCalories[]> {
  const params = new URLSearchParams({ start, end });
  const data = await apiFetch<{ data: { loggedAt: string; items: { calories: number }[] }[] }>(`/api/journal?${params.toString()}`);

  const meals = data.data ?? [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyMap: Record<string, number> = {};

  for (const meal of meals) {
    const d = new Date(meal.loggedAt);
    const key = dayNames[d.getUTCDay()];
    const mealCalories = (meal.items ?? []).reduce(
      (sum, item) => sum + Number(item.calories ?? 0),
      0
    );
    dailyMap[key] = (dailyMap[key] ?? 0) + mealCalories;
  }

  return dayNames.map((day) => ({ day, calories: dailyMap[day] ?? 0 }));
}

export async function fetchMealsInRange(start: string, end: string): Promise<MealData[]> {
  const params = new URLSearchParams({ start, end });
  const data = await apiFetch<{ data: MealData[] }>(`/api/journal?${params.toString()}`);
  return data.data ?? [];
}

export function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatMonthRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = s.getMonth() === e.getMonth();
  const monthOpts: Intl.DateTimeFormatOptions = { month: "short" };

  if (sameYear && sameMonth) return `${s.toLocaleDateString("en-US", { month: "long" })} ${s.getFullYear()}`;
  return `${s.toLocaleDateString("en-US", monthOpts)} ${s.getDate()} - ${e.toLocaleDateString("en-US", monthOpts)} ${e.getDate()}, ${e.getFullYear()}`;
}
