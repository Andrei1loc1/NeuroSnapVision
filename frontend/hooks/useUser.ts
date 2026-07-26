"use client";

import { useAuth } from "@/lib/auth/context";
import type { StoredUser } from "@/lib/auth/user";

export type { StoredUser };

export function useUser() {
  const { user, login, logout } = useAuth();
  return { user, hydrated: true as const, login, logout };
}