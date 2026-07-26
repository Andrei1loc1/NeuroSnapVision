import { STORAGE_KEYS } from "@/lib/constants/app";
import { clearUserStorage } from "@/lib/auth/userStorage";

export interface StoredUser {
  id: string;
  displayName: string;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export async function login(displayName: string): Promise<StoredUser> {
  const existingUser = getStoredUser();
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  const user: StoredUser = { id: data.id, displayName: data.displayName };

  if (existingUser?.id !== user.id) {
    if (existingUser?.id) {
      clearUserStorage(existingUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TARGETS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }
  }

  setStoredUser(user);
  return user;
}

export function logout(): void {
  clearStoredUser();
}
