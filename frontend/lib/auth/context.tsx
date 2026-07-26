"use client";

import { createContext, useContext, useCallback } from "react";
import type { StoredUser } from "./user";
import { clearUserStorage } from "./userStorage";
import { STORAGE_KEYS } from "@/lib/constants/app";

interface AuthContextType {
  user: StoredUser | null;
  login: (displayName: string) => Promise<StoredUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ user, children }: { user: StoredUser | null; children: React.ReactNode }) {
  const login = useCallback(async (displayName: string) => {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.USER);
    let existingId: string | null = null;
    if (existingRaw) {
      try { existingId = JSON.parse(existingRaw)?.id ?? null; } catch (err) { console.warn("[auth] failed to parse existing user", err); }
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    const newUser: StoredUser = { id: data.id, displayName: data.displayName };
    if (existingId && existingId !== newUser.id) {
      clearUserStorage(existingId);
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    let userId: string | null = null;
    if (raw) {
      try { userId = JSON.parse(raw)?.id ?? null; } catch (err) { console.warn("[auth] failed to parse user on logout", err); }
    }
    if (userId) {
      clearUserStorage(userId);
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/onboarding";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}