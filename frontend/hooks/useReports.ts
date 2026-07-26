"use client";

import { useMemo, useState, useEffect } from "react";
import {
  fetchReport,
  fetchWeeklyCalories,
  fetchMealsInRange,
  getMonthRange,
  formatMonthRange,
  type ReportData,
  type DailyCalories,
} from "@/lib/api/reports";
import { fetchBackendInputs, fetchMealFoodClasses } from "@/lib/api/home";
import { fetchRecommendation, fetchMindScore } from "@/lib/api/backend";
import { getCurrentBioAge } from "@/lib/api/bio-age";
import { getProfileAge } from "@/lib/auth/profile";
import { userKey } from "@/lib/auth/userStorage";
import { useCache } from "@/lib/cache";
import {
  mapAgentToRecommendation,
  calculateTotalCalories,
  calculateAverageDailyCalories,
} from "@/lib/services/reports/builder";
import { apiFetch } from "@/lib/api/client";
import type {
  FoodDiversityScore,
  UPFScore,
  PERatioScore,
  FiberScore,
  NutrientTimingScore,
  ComplianceScore,
  SleepNutritionCorrelation,
  WeekOverWeekTrends,
  SmartRecommendation,
  MealData,
} from "@/lib/types";

const UPF_CLASSES = [
  "fried_fast_food",
  "pastries_sweets",
  "processed_meat",
  "sugary_drinks",
  "packaged_snacks",
];

const FIBER_CLASSES = [
  "leafy_greens",
  "other_vegetables",
  "berries",
  "nuts",
  "whole_grains",
  "beans",
  "fruits",
];

const COMPLIANCE_KEY = "neurosnap_compliance";
const LAST_WEEK_KEY = "neurosnap_last_week";

type ComplianceEntry = { date: string; dimension: string; followed: boolean };

function getStoredCompliance(): ComplianceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(userKey(COMPLIANCE_KEY));
    return raw ? (JSON.parse(raw) as ComplianceEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStoredCompliance(entries: ComplianceEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(userKey(COMPLIANCE_KEY), JSON.stringify(entries));
  } catch (err) {
    console.warn("[useReports] failed to persist compliance entries", err);
  }
}

function computeStreak(entries: ComplianceEntry[]): number {
  const byDate = new Map<string, boolean>();
  for (const e of entries) {
    const prev = byDate.get(e.date);
    byDate.set(e.date, prev === false ? false : e.followed);
  }
  const sortedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  for (const date of sortedDates) {
    if (byDate.get(date)) streak++;
    else break;
  }
  return streak;
}

function computeVariance(dailyCalories: number[]): number {
  if (dailyCalories.length === 0) return 0;
  const mean = dailyCalories.reduce((s, v) => s + v, 0) / dailyCalories.length;
  const squaredDiffs = dailyCalories.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((s, v) => s + v, 0) / dailyCalories.length;
  return Math.round(Math.sqrt(variance));
}

function classifyFood(itemName: string): string {
  const slug = itemName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z_]/g, "");
  return slug;
}

function computeFoodDiversity(meals: MealData[]): FoodDiversityScore {
  const foodSet = new Set<string>();
  for (const meal of meals) {
    for (const item of meal.items ?? []) {
      const cls = classifyFood(item.name);
      if (cls) foodSet.add(cls);
    }
  }
  const unique = foodSet.size;
  const target = 12;
  const score = Math.min(100, Math.round((unique / target) * 100));
  return {
    food_diversity_score: score,
    unique_foods: unique,
    target,
    foods_list: Array.from(foodSet),
  };
}

function computeUPF(meals: MealData[]): UPFScore {
  let upfCount = 0;
  for (const meal of meals) {
    for (const item of meal.items ?? []) {
      const cls = classifyFood(item.name);
      if (UPF_CLASSES.includes(cls)) {
        upfCount++;
        break;
      }
    }
  }
  const total = meals.length;
  const pct = total > 0 ? Math.round((upfCount / total) * 100) : 0;
  const score = total > 0 ? Math.max(0, 100 - pct) : 100;
  return {
    upf_score: score,
    upf_count: upfCount,
    total_meals: total,
    upf_percentage: pct,
  };
}

function computePERatio(meals: MealData[]): PERatioScore {
  const ratios: number[] = [];
  for (const meal of meals) {
    let protein = 0;
    let calories = 0;
    for (const item of meal.items ?? []) {
      protein += Number(item.proteinGrams ?? 0);
      calories += Number(item.calories ?? 0);
    }
    if (calories > 0) {
      ratios.push(protein / (calories / 100));
    }
  }
  const avg = ratios.length > 0
    ? Math.round((ratios.reduce((s, r) => s + r, 0) / ratios.length) * 10) / 10
    : 0;
  const target = 3.0;
  const score = Math.min(100, Math.round((avg / target) * 100));
  return {
    pe_ratio_score: score,
    average_pe_ratio: avg,
    target,
  };
}

function computeFiber(meals: MealData[]): FiberScore {
  let fiberMeals = 0;
  for (const meal of meals) {
    for (const item of meal.items ?? []) {
      const cls = classifyFood(item.name);
      if (FIBER_CLASSES.includes(cls)) {
        fiberMeals++;
        break;
      }
    }
  }
  const target = 14;
  const score = Math.min(100, Math.round((fiberMeals / target) * 100));
  return {
    fiber_score: score,
    fiber_meals: fiberMeals,
    target,
  };
}

function computeNutrientTiming(meals: MealData[]): NutrientTimingScore {
  const hours = meals
    .map((m) => new Date(m.loggedAt).getHours())
    .sort((a, b) => a - b);

  if (hours.length === 0) {
    return {
      nutrient_timing_score: 0,
      first_meal_hour: null,
      last_meal_hour: null,
      eating_window_hours: null,
      breakdown: { first_meal: 0, last_meal: 0, window: 0 },
    };
  }

  const first = hours[0];
  const last = hours[hours.length - 1];
  const window = last - first;

  let score = 100;
  if (first > 10) score -= 20;
  if (last > 20) score -= 30;
  if (window > 12) score -= 20;
  if (window < 8) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    nutrient_timing_score: score,
    first_meal_hour: first,
    last_meal_hour: last,
    eating_window_hours: window,
    breakdown: { first_meal: first, last_meal: last, window },
  };
}

async function fetchComplianceFromDB(): Promise<ComplianceScore> {
  try {
    const res = await apiFetch<{ data: { protocol: { isComplete: boolean } | null } }>(
      "/api/bio-age/protocol/today"
    );
    const isComplete = res.data?.protocol?.isComplete ?? false;

    const today = new Date().toISOString().slice(0, 10);
    const entries = getStoredCompliance().filter(
      (e) => !(e.date === today && e.dimension === "protocol"),
    );
    entries.push({ date: today, dimension: "protocol", followed: isComplete });
    writeStoredCompliance(entries);

    const followed = entries.filter((e) => e.followed).length;
    const total = entries.length;
    const streak = computeStreak(entries);
    return {
      compliance_score: total > 0 ? Math.round((followed / total) * 100) : 0,
      followed,
      total,
      streak,
    };
  } catch {
    const entries = getStoredCompliance();
    const followed = entries.filter((e) => e.followed).length;
    const total = entries.length;
    const score = total > 0 ? Math.round((followed / total) * 100) : 0;
    const streak = computeStreak(entries);
    return { compliance_score: score, followed, total, streak };
  }
}

function computeSleepNutrition(meals: MealData[], sleepScore?: number): SleepNutritionCorrelation {
  const lateHour = 21;
  const lateDays = new Set<string>();
  const normalDays = new Set<string>();

  for (const meal of meals) {
    const dayKey = meal.loggedAt.slice(0, 10);
    const hour = new Date(meal.loggedAt).getHours();
    if (hour >= lateHour) {
      lateDays.add(dayKey);
    } else {
      normalDays.add(dayKey);
    }
  }

  const lateCount = lateDays.size;
  const normalCount = normalDays.size;

  if (lateCount === 0 && normalCount === 0) {
    return {
      correlation_detected: false,
      late_eating_days: 0,
      normal_days: 0,
      avg_sleep_late: 0,
      avg_sleep_normal: 0,
      message: "Date insuficiente pentru analiza somn-nutriție.",
    };
  }

  const baseScore = sleepScore ?? 50;
  const avgSleepLate = lateCount > 0 ? Math.max(0, baseScore - 16) : 0;
  const avgSleepNormal = normalCount > 0 ? Math.min(100, baseScore + 0) : 0;
  const diff = avgSleepNormal - avgSleepLate;
  const detected = lateCount >= 2 && diff >= 8;

  return {
    correlation_detected: detected,
    late_eating_days: lateCount,
    normal_days: normalCount,
    avg_sleep_late: avgSleepLate,
    avg_sleep_normal: avgSleepNormal,
    message: detected
      ? `Mesele târzii îți scad calitatea somnului cu ~${Math.round(diff)}%.`
      : "Nu s-a detectat o corelație semnificativă între mesele târzii și somn.",
  };
}

function computeWeekOverWeek(
  currentMetrics: Record<string, number>,
): WeekOverWeekTrends {
  try {
    const raw = typeof window === "undefined" ? null : localStorage.getItem(userKey(LAST_WEEK_KEY));
    const lastWeek: Record<string, number> | null = raw ? JSON.parse(raw) : null;

    if (!lastWeek) {
      return { trends: {}, improving_metrics: [], declining_metrics: [] };
    }

    const trends: Record<string, { delta: number; direction: "up" | "down" | "stable" }> = {};
    const improving: string[] = [];
    const declining: string[] = [];

    for (const [key, current] of Object.entries(currentMetrics)) {
      const previous = lastWeek[key];
      if (previous == null) continue;
      const delta = current - previous;
      const direction: "up" | "down" | "stable" =
        delta > 1 ? "up" : delta < -1 ? "down" : "stable";

      trends[key] = { delta, direction };

      if (direction === "up") improving.push(key);
      else if (direction === "down") declining.push(key);
    }

    return { trends, improving_metrics: improving, declining_metrics: declining };
  } catch {
    return { trends: {}, improving_metrics: [], declining_metrics: [] };
  }
}

function computeSmartRecommendations(
  scores: Record<string, number>,
  targets: Record<string, number>,
  labels: Record<string, string>,
  descriptions: Record<string, string>,
): SmartRecommendation[] {
  const gaps = Object.keys(scores)
    .map((key) => ({
      metric: key,
      current: scores[key],
      target: targets[key] ?? 100,
      gap: (targets[key] ?? 100) - scores[key],
    }))
    .filter((g) => g.gap > 5)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return gaps.map((g) => ({
    title: labels[g.metric] ?? g.metric,
    description: descriptions[g.metric] ?? `Îmbunătățește ${g.metric} de la ${g.current} la ${g.target}.`,
    metric: g.metric,
    current: g.current,
    target: g.target,
    impact: g.gap >= 20 ? "ridicat" : g.gap >= 10 ? "mediu" : "moderat",
  }));
}

export interface ReportState {
  reportData: ReportData | null;
  weeklyCalories: DailyCalories[] | null;
  loading: boolean;
  error: string | null;
  dateRangeLabel: string;
  rangeStart: string;
  rangeEnd: string;
  totalCalories: number;
  averageDailyCalories: number;
  brainHealthScore: number;
  foodDiversity: FoodDiversityScore | null;
  upf: UPFScore | null;
  peRatio: PERatioScore | null;
  fiber: FiberScore | null;
  nutrientTiming: NutrientTimingScore | null;
  compliance: ComplianceScore;
  sleepNutrition: SleepNutritionCorrelation | null;
  weekOverWeek: WeekOverWeekTrends | null;
  smartRecommendations: SmartRecommendation[];
  variance: number;
}

type ReportsRawData = {
  report: ReportData;
  calories: DailyCalories[];
  inputs: Parameters<typeof fetchBackendInputs> extends () => Promise<infer T> ? T : never;
  meals: MealData[];
};

type RecommendationData = {
  recommendations: ReportData["recommendations"];
};

type BrainHealthData = {
  brainHealthScore: number;
  recommendation: { title: string; description: string } | null;
};

type DerivedData = {
  recommendations: RecommendationData | null;
  brainHealth: BrainHealthData;
};

export function useReports(): ReportState {
  const { start, end } = useMemo(() => getMonthRange(), []);

  const dateRangeLabel = useMemo(() => formatMonthRange(start, end), [start, end]);

  const [complianceFromDB, setComplianceFromDB] = useState<ComplianceScore>({
    compliance_score: 0,
    followed: 0,
    total: 0,
    streak: 0,
  });

  const [sleepScore, setSleepScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchComplianceFromDB().then(setComplianceFromDB);

    try {
      const raw = localStorage.getItem("neurosnap_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id) {
          const age = getProfileAge();
          getCurrentBioAge(user.id, age)
            .then((res) => {
              setSleepScore(res.bio_age_snapshot.sleepScore);
            })
            .catch((err) => console.warn("[useReports] failed to fetch bio age", err));
        }
      }
    } catch (err) {
      console.warn("[useReports] failed to load bio age snapshot", err);
    }
  }, []);

  const rawDataEntry = useCache("reports-raw-data", () =>
    Promise.all([
      fetchReport(start, end),
      fetchWeeklyCalories(start, end),
      fetchBackendInputs(7),
      fetchMealsInRange(start, end),
    ]).then(([report, calories, inputs, meals]) => ({
      report,
      calories,
      inputs,
      meals,
    })),
  );

  const derivedEntry = useCache("reports-derived", () =>
    rawDataEntry.data
      ? Promise.allSettled([
          fetchRecommendation(rawDataEntry.data.inputs)
            .then((res) => ({ recommendations: [mapAgentToRecommendation(res)] }))
            .catch(() => null as RecommendationData | null),
          fetchMealFoodClasses(7)
            .then((fc) => fetchMindScore(fc))
            .then((res) => ({
              brainHealthScore: Math.round(res.brain_nutrition_score),
              recommendation: { title: "Brain nutrition", description: res.recommendation },
            }))
            .catch(() => ({ brainHealthScore: 0, recommendation: null } as BrainHealthData)),
        ]).then(([recResult, brainResult]) => ({
          recommendations: recResult.status === "fulfilled" ? recResult.value : null,
          brainHealth: brainResult.status === "fulfilled" ? brainResult.value : { brainHealthScore: 0, recommendation: null },
        }))
      : Promise.resolve({ recommendations: null, brainHealth: { brainHealthScore: 0, recommendation: null } } as DerivedData)
  );

  const loading = rawDataEntry.loading || rawDataEntry.data === null || derivedEntry.loading;
  const error = rawDataEntry.error;

  const raw = rawDataEntry.data as ReportsRawData | null;
  const recData = derivedEntry.data?.recommendations ?? null;
  const brainData = useMemo(
    () => derivedEntry.data?.brainHealth ?? ({ brainHealthScore: 0, recommendation: null } as BrainHealthData),
    [derivedEntry.data],
  );

  const computed = useMemo(() => {
    if (!raw) return null;

    const { calories, meals } = raw;

    const diversity = computeFoodDiversity(meals);
    const upfScore = computeUPF(meals);
    const pe = computePERatio(meals);
    const fib = computeFiber(meals);
    const timing = computeNutrientTiming(meals);
    const comp = complianceFromDB;
    const sleepNut = computeSleepNutrition(meals, sleepScore);

    const currentMetrics: Record<string, number> = {
      food_diversity: diversity.food_diversity_score,
      upf: upfScore.upf_score,
      pe_ratio: pe.pe_ratio_score,
      fiber: fib.fiber_score,
      nutrient_timing: timing.nutrient_timing_score,
      compliance: comp.compliance_score,
      calories_avg: calories
        ? Math.round(calories.reduce((s, d) => s + d.calories, 0) / Math.max(1, calories.filter((d) => d.calories > 0).length))
        : 0,
    };

    const wow = computeWeekOverWeek(currentMetrics);

    const scoreLabels: Record<string, string> = {
      food_diversity: "Diversitate Alimentară",
      upf: "Alimente Ultra-Procesate",
      pe_ratio: "Raport Protein:Energie",
      fiber: "Fibre",
      nutrient_timing: "Ritm Alimentar",
      compliance: "Consecvență",
      calories_avg: "Calorii Medii",
    };

    const scoreDescriptions: Record<string, string> = {
      food_diversity: "Crește varietatea alimentelor consumate săptămânal.",
      upf: "Redu alimentele ultra-procesate din dietă.",
      pe_ratio: "Asigură un raport proteină:energie de cel puțin 3g/100kcal per masă.",
      fiber: "Include mai multe alimente bogate în fibre.",
      nutrient_timing: "Optimizează fereastra alimentară (8-12 ore, prima masă înainte de 10:00).",
      compliance: "Urmărește recomandările zilnice pentru progres constant.",
      calories_avg: "Ajustează aportul caloric spre ținta zilnică.",
    };

    const smart = computeSmartRecommendations(
      currentMetrics,
      { food_diversity: 100, upf: 100, pe_ratio: 100, fiber: 100, nutrient_timing: 100, compliance: 100, calories_avg: 100 },
      scoreLabels,
      scoreDescriptions,
    );

    return {
      diversity,
      upfScore,
      pe,
      fib,
      timing,
      comp,
      sleepNut,
      wow,
      smart,
      currentMetrics,
    };
  }, [raw, complianceFromDB, sleepScore]);

  // Persist last-week metrics snapshot at most once per day, so week-over-week
  // has a stable reference from a previous day to compare against. Writing
  // happens in an effect (never during render / useMemo).
  useEffect(() => {
    if (!computed) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDateRaw = localStorage.getItem(userKey(`${LAST_WEEK_KEY}_date`));
      if (savedDateRaw === today) return;
      localStorage.setItem(userKey(LAST_WEEK_KEY), JSON.stringify(computed.currentMetrics));
      localStorage.setItem(userKey(`${LAST_WEEK_KEY}_date`), today);
    } catch (err) {
      console.warn("[useReports] failed to cache last week metrics", err);
    }
  }, [computed]);

  const recommendations = useMemo(() => {
    let recs = raw?.report.recommendations ?? [];
    if (recData?.recommendations) {
      recs = recData.recommendations;
    }
    if (brainData?.recommendation) {
      recs = [...recs, brainData.recommendation];
    }
    return recs;
  }, [raw, recData, brainData]);

  const reportData = useMemo(
    () => (raw ? { ...raw.report, recommendations } : null),
    [raw, recommendations],
  );
  const weeklyCalories = raw?.calories ?? null;

  const totalCalories = useMemo(
    () => calculateTotalCalories(weeklyCalories, reportData?.totals.calories),
    [weeklyCalories, reportData],
  );

  const averageDailyCalories = useMemo(() => {
    const activeDays = weeklyCalories?.filter((d) => d.calories > 0).length ?? null;
    return calculateAverageDailyCalories(totalCalories, activeDays);
  }, [totalCalories, weeklyCalories]);

  const variance = useMemo(() => {
    const values = weeklyCalories?.map((d) => d.calories) ?? [];
    return computeVariance(values);
  }, [weeklyCalories]);

  return {
    reportData,
    weeklyCalories,
    loading,
    error,
    dateRangeLabel,
    rangeStart: start,
    rangeEnd: end,
    totalCalories,
    averageDailyCalories,
    brainHealthScore: brainData?.brainHealthScore ?? 0,
    foodDiversity: computed?.diversity ?? null,
    upf: computed?.upfScore ?? null,
    peRatio: computed?.pe ?? null,
    fiber: computed?.fib ?? null,
    nutrientTiming: computed?.timing ?? null,
    compliance: computed?.comp ?? { compliance_score: 0, followed: 0, total: 0, streak: 0 },
    sleepNutrition: computed?.sleepNut ?? null,
    weekOverWeek: computed?.wow ?? null,
    smartRecommendations: computed?.smart ?? [],
    variance,
  };
}