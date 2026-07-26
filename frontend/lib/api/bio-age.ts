/**
 * Bio-Age Control System — API client for daily protocol,
 * bio-age scoring, workout logging, and circadian nutrition.
 */
import { apiFetch } from "./client";
import type {
  DailyProtocol,
  BioAgeSnapshot,
  LeveragePoint,
  WorkoutLog,
  MovementQuality,
  CircadianNutritionScore,
} from "@/lib/types";

export type {
  DailyProtocol,
  BioAgeSnapshot,
  LeveragePoint,
  WorkoutLog,
  MovementQuality,
  CircadianNutritionScore,
};

// ─── Protocol ────────────────────────────────────────────────

export async function submitMorningCheckin(data: {
  user_id: string;
  date: string;
  recovery: number;
  energy: number;
  mood?: number;
  focus?: number;
  morningLight?: boolean;
}): Promise<{ protocol: DailyProtocol; streak: number }> {
  const res = await apiFetch<{ data: { protocol: DailyProtocol; streak: number } }>(
    "/api/bio-age/protocol/morning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

export async function submitEveningCheckin(data: {
  user_id: string;
  date: string;
  stress: number;
  digestion: number;
  mood?: number;
  energy?: number;
  libido?: number;
  supplements?: string[];
  last_meal_time?: string;
  socialConnection?: number;
  coldExposure?: boolean;
  heatExposure?: boolean;
  oralHealth?: boolean;
  caffeineCutoff?: boolean;
  screenCutoff?: boolean;
}): Promise<{ protocol: DailyProtocol; streak: number; is_complete: boolean }> {
  const res = await apiFetch<{
    data: { protocol: DailyProtocol; streak: number; is_complete: boolean };
  }>("/api/bio-age/protocol/evening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getTodayProtocol(
  userId: string
): Promise<{ protocol: DailyProtocol | null; streak: number }> {
  const res = await apiFetch<{
    data: { protocol: DailyProtocol | null; streak: number };
  }>(`/api/bio-age/protocol/today?user_id=${encodeURIComponent(userId)}`);
  return res.data;
}

// ─── Bio-Age ────────────────────────────────────────────────

export interface BioAgeSnapshotRequest {
  chronologicalAge: number;
  sex?: string;
  sleepTime?: string;
  targets?: { calories?: number; protein?: number; fats?: number };
  lateMealThreshold?: number;
  firstMealTime?: string;
  lastMealTime?: string;
  interventionHistory?: unknown[];
  history?: unknown[];
}

export async function getCurrentBioAge(
  userId: string,
  age: number,
  options?: {
    sex?: string;
    sleepTime?: string;
    targets?: { calories?: number; protein?: number; fats?: number };
    lateMealThreshold?: number;
    firstMealTime?: string;
    lastMealTime?: string;
    interventionHistory?: unknown[];
    history?: unknown[];
  }
): Promise<{ bio_age_snapshot: BioAgeSnapshot; leverage_point: LeveragePoint }> {
  const body: BioAgeSnapshotRequest = {
    chronologicalAge: age,
    ...(options?.sex ? { sex: options.sex } : {}),
    ...(options?.sleepTime ? { sleepTime: options.sleepTime } : {}),
    ...(options?.targets ? { targets: options.targets } : {}),
    ...(options?.lateMealThreshold
      ? { lateMealThreshold: options.lateMealThreshold }
      : {}),
    ...(options?.firstMealTime ? { firstMealTime: options.firstMealTime } : {}),
    ...(options?.lastMealTime ? { lastMealTime: options.lastMealTime } : {}),
    ...(options?.interventionHistory
      ? { interventionHistory: options.interventionHistory }
      : {}),
    ...(options?.history ? { history: options.history } : {}),
  };
  const res = await apiFetch<{
    data: { bio_age_snapshot: BioAgeSnapshot; leverage_point: LeveragePoint };
  }>(`/api/bio-age/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function getBioAgeHistory(
  userId: string,
  days?: number
): Promise<{ snapshots: BioAgeSnapshot[] }> {
  const params = new URLSearchParams({ user_id: userId });
  if (days !== undefined) params.set("days", String(days));
  const res = await apiFetch<{ data: { snapshots: BioAgeSnapshot[] } }>(
    `/api/bio-age/history?${params.toString()}`
  );
  return res.data;
}

// ─── Workout ────────────────────────────────────────────────

export async function logWorkout(data: {
  user_id: string;
  date: string;
  type: string;
  intensity: number;
  duration_min: number;
  notes?: string;
}): Promise<{ workout: WorkoutLog }> {
  const res = await apiFetch<{ data: { workout: WorkoutLog } }>(
    "/api/bio-age/workout",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

export async function getWeeklyMovementQuality(
  userId: string,
  weekStart?: string
): Promise<MovementQuality> {
  const params = new URLSearchParams({ user_id: userId });
  if (weekStart) params.set("week_start", weekStart);
  const res = await apiFetch<{ data: MovementQuality }>(
    `/api/bio-age/movement-quality?${params.toString()}`
  );
  return res.data;
}

// ─── Intervention ───────────────────────────────────────────

/**
 * Fetch today's personalized intervention / daily leverage point.
 *
 * The Next.js proxy (`/api/bio-age/intervention`) collects the user's
 * BioAgeSnapshot history from Prisma (last ~7 days) and forwards it to
 * the backend so the intervention engine can prioritize dimensions in
 * recent decline. The browser client therefore does not need to send
 * history itself; only the user's age and optional north star matter.
 */
export async function getTodayIntervention(
  userId: string,
  age: number,
  northStar?: string
): Promise<LeveragePoint> {
  const params = new URLSearchParams({ user_id: userId, age: String(age) });
  if (northStar) params.set("north_star", northStar);
  const res = await apiFetch<{ data: LeveragePoint }>(
    `/api/bio-age/intervention?${params.toString()}`
  );
  return res.data;
}

// ─── Circadian ──────────────────────────────────────────────

export async function getCircadianScore(
  userId: string,
  date: string
): Promise<CircadianNutritionScore> {
  const res = await apiFetch<{ data: CircadianNutritionScore }>(
    `/api/bio-age/circadian?user_id=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`
  );
  return res.data;
}