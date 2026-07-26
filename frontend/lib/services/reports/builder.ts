/**
 * Pure report builder functions.
 * Maps backend recommendation responses to human-readable UI text.
 */

import type { RecommendationResult } from "@/lib/types";

export interface RecommendationView {
  title: string;
  description: string;
}

/**
 * Maps a backend recommendation agent + action to a user-friendly title.
 */
export function mapAgentToRecommendation(rec: RecommendationResult): RecommendationView {
  const { selected_agent, action } = rec;

  let title: string;

  switch (selected_agent) {
    case "protein_agent":
      title = "Increase protein";
      break;
    case "calorie_agent":
      title = action.includes("reduce") ? "Reduce calories" : "Increase calories";
      break;
    case "timing_agent":
      title = "Watch meal timing";
      break;
    case "fat_agent":
      title = action.includes("increase") ? "Add healthy fats" : "Reduce fats";
      break;
    default:
      title = "Improve consistency";
  }

  return {
    title,
    description: rec.recommendation,
  };
}

/**
 * Aggregates weekly calories. Falls back to report totals if no weekly data.
 */
export function calculateTotalCalories(
  weeklyCalories: { calories: number }[] | null,
  reportTotals?: number | null
): number {
  const weeklySum = weeklyCalories?.reduce((sum, d) => sum + d.calories, 0);
  if (weeklySum != null && weeklySum > 0) return weeklySum;
  return reportTotals ?? 0;
}

/**
 * Calculates average daily calories across 7 days.
 * If activeDays is provided, uses that count; otherwise defaults to 7.
 */
export function calculateAverageDailyCalories(
  totalCalories: number,
  activeDays: number | null
): number {
  if (totalCalories === 0) return 0;
  const days = activeDays ?? 7;
  return days > 0 ? Math.round(totalCalories / days) : 0;
}
