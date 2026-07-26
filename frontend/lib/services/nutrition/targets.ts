/**
 * Onboarding target calculations.
 * Smart defaults based on sex, age, body type, activity level, goal, and sleep.
 */

export interface SmartOnboardingData {
  sex: string;
  age: number;
  bodyType: string;
  activityLevel: string;
  goal: string;
  sleepHours: number;
}

export interface NutritionTargets {
  target_calories: number;
  target_protein: number;
  target_fats: number;
  late_meal_threshold: number;
  focus_area: string;
}

const ACTIVITY_CALORIE_ADJ: Record<string, number> = {
  sedentary: -300,
  moderate: 0,
  active: 200,
};

const BODY_TYPE_ADJ: Record<string, number> = {
  slim: -100,
  medium: 0,
  robust: 100,
};

const GOAL_ADJ: Record<string, number> = {
  longevity: -200,
  energy: 100,
  performance: 200,
};

const GOAL_FOCUS: Record<string, string> = {
  longevity: "mind_diet",
  energy: "sleep",
  performance: "protein",
};

const GOAL_PROTEIN_ADJ: Record<string, number> = {
  longevity: 0,
  energy: 0,
  performance: 20,
};

const ACTIVITY_PROTEIN_ADJ: Record<string, number> = {
  sedentary: 0,
  moderate: 0,
  active: 10,
};

export function calculateSmartTargets(data: SmartOnboardingData): NutritionTargets {
  let baseCalories = data.sex === "male" ? 2400 : data.sex === "female" ? 2000 : 2200;

  if (data.age > 30) {
    baseCalories -= (data.age - 30) * 5;
  }

  baseCalories += ACTIVITY_CALORIE_ADJ[data.activityLevel] ?? 0;
  baseCalories += BODY_TYPE_ADJ[data.bodyType] ?? 0;
  baseCalories += GOAL_ADJ[data.goal] ?? 0;

  if (data.sleepHours < 6) {
    baseCalories -= 150;
  } else if (data.sleepHours < 7) {
    baseCalories -= 50;
  } else if (data.sleepHours > 9) {
    baseCalories += 50;
  }

  let protein = data.sex === "male" ? 150 : data.sex === "female" ? 120 : 135;
  protein += GOAL_PROTEIN_ADJ[data.goal] ?? 0;
  protein += ACTIVITY_PROTEIN_ADJ[data.activityLevel] ?? 0;

  const fats = Math.round((baseCalories * 0.25) / 9);

  return {
    target_calories: baseCalories,
    target_protein: protein,
    target_fats: fats,
    late_meal_threshold: 22,
    focus_area: GOAL_FOCUS[data.goal] ?? "general",
  };
}

export interface OnboardingFormData {
  displayName: string;
  age: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
  sleepTime: string;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_MULTIPLIERS: Record<string, number> = {
  lose_weight: 0.8,
  maintain: 1.0,
  gain_muscle: 1.1,
  gain_weight: 1.15,
};

/**
 * Legacy calculation — kept for backward compatibility.
 */
export function calculateTargets(data: OnboardingFormData): NutritionTargets {
  const weight = Number(data.weight);
  const height = Number(data.height);
  const age = Number(data.age);
  const activity = data.activityLevel;
  const goal = data.goal;

  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.55);
  const target_calories = Math.round(tdee * (GOAL_MULTIPLIERS[goal] ?? 1.0));
  const target_protein = Math.round(weight * 2.0);
  const target_fats = Math.round((target_calories * 0.25) / 9);

  return {
    target_calories,
    target_protein,
    target_fats,
    late_meal_threshold: 22,
    focus_area: "general",
  };
}