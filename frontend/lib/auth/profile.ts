import { STORAGE_KEYS } from "@/lib/constants/app";
import { userKey } from "@/lib/auth/userStorage";

export interface ProfileData {
  displayName: string;
  age: number;
  sex: string;
  bodyType: string;
  activityLevel: string;
  goal: string;
  sleepHours: number;
  weight?: number;
  height?: number;
  sleepTime?: string;
}

export function getProfileAge(): number {
  return getStoredProfile()?.age ?? 30;
}

export function getStoredProfile(): ProfileData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey(STORAGE_KEYS.PROFILE));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProfileData;
  } catch {
    return null;
  }
}

export function setStoredProfile(data: ProfileData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(userKey(STORAGE_KEYS.PROFILE), JSON.stringify(data));
}