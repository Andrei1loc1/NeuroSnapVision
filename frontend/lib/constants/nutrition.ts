/**
 * Nutrition goals — single source of truth for target values.
 * These are the default targets used across the app.
 * Users can override them via profile settings (stored in localStorage).
 */

export const NUTRITION_GOALS = {
  /** Default daily calorie target (kcal) */
  CALORIES: 2300,

  /** Default daily protein target (grams) */
  PROTEIN: 142,

  /** Default daily carbs target (grams) */
  CARBS: 275,

  /** Default daily fat target (grams) */
  FATS: 77,

  /** Threshold for late meals (21:00 = 9 PM) */
  LATE_MEAL_HOUR: 21,

  /** Range for "on target" calories (±15% of goal) */
  ON_TARGET_MIN_RATIO: 0.75,
  ON_TARGET_MAX_RATIO: 1.15,

  /** Number of recent days to look back for trends */
  DEFAULT_TREND_DAYS: 7,
  DEFAULT_HISTORY_DAYS: 8,
} as const;

export const NUTRITION_GOALS_CONFIG = {
  /** UI labels */
  CALORIES_LABEL: "kcal",
  PROTEIN_LABEL: "g",
  CARBS_LABEL: "g",
  FATS_LABEL: "g",
} as const;
