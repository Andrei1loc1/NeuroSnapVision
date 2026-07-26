export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export const MEAL_TYPE_OPTIONS: MealType[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Mic dejun",
  LUNCH: "Prânz",
  DINNER: "Cină",
  SNACK: "Gustare",
};

export function detectMealType(date: Date = new Date()): MealType {
  const hour = date.getHours() + date.getMinutes() / 60;

  if (hour >= 5 && hour < 10.5) return "BREAKFAST";
  if (hour >= 10.5 && hour < 14.5) return "LUNCH";
  if (hour >= 14.5 && hour < 17.5) return "SNACK";
  if (hour >= 17.5 && hour < 22) return "DINNER";
  return "SNACK";
}