/**
 * Nutrition targets storage helpers.
 */
import { STORAGE_KEYS } from "@/lib/constants/app";
import { userKey } from "@/lib/auth/userStorage";

export interface Targets {
  target_calories: number;
  target_protein: number;
  target_fats: number;
  late_meal_threshold: number;
  focus_area: string;
}

export function getStoredTargets(): Targets | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey(STORAGE_KEYS.TARGETS));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Targets;
  } catch {
    return null;
  }
}

export function setStoredTargets(targets: Targets): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(userKey(STORAGE_KEYS.TARGETS), JSON.stringify(targets));
}