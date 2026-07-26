export const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Slăbire",
  maintain: "Menținere",
  maintain_weight: "Menținere",
  gain_weight: "Creștere în greutate",
  gain_muscle: "Creștere musculară",
  improve_energy: "Mai multă energie",
  better_sleep: "Somn mai bun",
  longevity: "Longevitate",
  energy: "Energie",
  performance: "Performanță",
};

export function getGoalLabel(goal: string): string {
  return GOAL_LABELS[goal] ?? goal.replace(/_/g, " ");
}