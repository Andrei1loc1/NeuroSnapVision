import { STORAGE_KEYS } from "@/lib/constants/app";

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
}

export function userKey(key: string): string {
  const userId = getUserId();
  return userId ? `${key}_${userId}` : key;
}

export function getUserItem(key: string): string | null {
  return localStorage.getItem(userKey(key));
}

export function setUserItem(key: string, value: string): void {
  localStorage.setItem(userKey(key), value);
}

export function removeUserItem(key: string): void {
  localStorage.removeItem(userKey(key));
}

/**
 * Per-user keys stored as `${key}_${userId}` (canonical, via userKey / getUserItem).
 */
const PER_USER_KEYS: readonly string[] = [
  STORAGE_KEYS.TARGETS,
  STORAGE_KEYS.PROFILE,
  "neurosnap_daily_coach",
  "neurosnap_leverage_done",
  "neurosnap_journal_key",
  "neurosnap_chat",
];

/**
 * Data keys currently written WITHOUT userId (global) but semantically per-user.
 * Cleared in both global and `${key}_${userId}` forms to avoid residual data.
 */
const LEGACY_GLOBAL_DATA_KEYS: readonly string[] = [
  "neurosnap_compliance",
  "neurosnap_last_week",
  "neurosnap_streak",
];

/**
 * Remove all localStorage data associated with `userId`.
 * Clears per-user keys (suffixed with `_${userId}`) plus legacy global data keys
 * that are semantically per-user. Global UI/settings keys (notifications, chat
 * button position, onboarding flow) are left untouched.
 */
export function clearUserStorage(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  for (const key of PER_USER_KEYS) {
    localStorage.removeItem(`${key}_${userId}`);
  }
  for (const key of LEGACY_GLOBAL_DATA_KEYS) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_${userId}`);
  }
}