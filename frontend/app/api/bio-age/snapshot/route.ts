import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";
import { prisma } from "@/lib/db/prisma";

interface BioAgeRequestBody {
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

function toDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mealTimeFromLoggedAt(loggedAt: string): string {
  const d = new Date(loggedAt);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function slugifyFoodClass(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z_]/g, "");
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = (await request.json()) as BioAgeRequestBody;
    const chronologicalAge = Number(body.chronologicalAge) || 30;

    const now = new Date();
    const mealsSince = new Date();
    mealsSince.setDate(mealsSince.getDate() - 7);
    mealsSince.setHours(0, 0, 0, 0);

    const protocolsSince = new Date();
    protocolsSince.setDate(protocolsSince.getDate() - 30);
    protocolsSince.setHours(0, 0, 0, 0);

    const workoutsSince = new Date();
    workoutsSince.setDate(workoutsSince.getDate() - 7);
    workoutsSince.setHours(0, 0, 0, 0);

    const hrvSince = new Date();
    hrvSince.setDate(hrvSince.getDate() - 7);
    hrvSince.setHours(0, 0, 0, 0);

    const [user, meals, protocols, workouts, hrvReadings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          age: true,
          sex: true,
          sleepTime: true,
          targetCalories: true,
          targetProtein: true,
          targetFats: true,
          lateMealThreshold: true,
        },
      }),
      prisma.meal.findMany({
        where: { userId, loggedAt: { gte: mealsSince } },
        include: { items: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.dailyProtocol.findMany({
        where: { userId, date: { gte: protocolsSince } },
        orderBy: { date: "asc" },
      }),
      prisma.workoutLog.findMany({
        where: { userId, date: { gte: workoutsSince } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hrvReading.findMany({
        where: { userId, timestamp: { gte: hrvSince } },
        orderBy: { timestamp: "asc" },
      }),
    ]);

    const sex = body.sex ?? user?.sex ?? "male";
    const sleepTime = body.sleepTime ?? user?.sleepTime ?? undefined;
    const lateMealThreshold =
      body.lateMealThreshold ?? user?.lateMealThreshold ?? 21;

    const targets = {
      calories: body.targets?.calories ?? user?.targetCalories ?? 0,
      protein: body.targets?.protein ?? user?.targetProtein ?? 0,
      fats: body.targets?.fats ?? user?.targetFats ?? 0,
    };

    const mealsPayload = meals.map((m) => {
      const items = m.items.map((it) => ({
        name: it.name,
        calories: Number(it.calories),
        proteinGrams: Number(it.proteinGrams),
        carbsGrams: Number(it.carbsGrams),
        fatGrams: Number(it.fatGrams),
      }));
      return {
        loggedAt: m.loggedAt.toISOString(),
        food_class: slugifyFoodClass(m.title || items[0]?.name || ""),
        items,
      };
    });

    const protocolsPayload = protocols.map((p) => ({
      morningRecovery: p.morningRecovery,
      morningEnergy: p.morningEnergy,
      morningMood: p.morningMood,
      morningFocus: p.morningFocus,
      eveningStress: p.eveningStress,
      eveningDigestion: p.eveningDigestion,
      eveningMood: p.eveningMood,
      eveningEnergy: p.eveningEnergy,
      eveningLibido: p.eveningLibido,
      socialConnection: p.socialConnection,
      oralHealth: p.oralHealth,
      coldExposure: p.coldExposure,
      heatExposure: p.heatExposure,
      caffeineCutoff: p.caffeineCutoff,
      screenCutoff: p.screenCutoff,
      morningLight: p.morningLight,
      lastMealTime: p.lastMealTime,
    }));

    const workoutsPayload = workouts.map((w) => ({
      type: w.type,
      intensity: w.intensity,
      duration_min: w.durationMin,
      date: w.date.toISOString().slice(0, 10),
    }));

    const hrvPayload = hrvReadings.map((r) => ({
      sdnn: r.sdnn,
      rmssd: r.rmssd,
      stressLevel: r.stressLevel,
      timestamp: r.timestamp.toISOString(),
    }));

    let firstMealTime = body.firstMealTime;
    let lastMealTime = body.lastMealTime;
    if (mealsPayload.length > 0) {
      const times = mealsPayload.map((m) => mealTimeFromLoggedAt(m.loggedAt));
      if (!firstMealTime) firstMealTime = times[0];
      if (!lastMealTime) lastMealTime = times[times.length - 1];
    }

    const payload = {
      user_id: userId,
      chronological_age: chronologicalAge,
      sex,
      meals: mealsPayload,
      protocols: protocolsPayload,
      workouts: workoutsPayload,
      hrv_readings: hrvPayload,
      targets,
      late_meal_threshold: lateMealThreshold,
      first_meal_time: firstMealTime,
      last_meal_time: lastMealTime,
      today: toDateISO(now),
      sleep_time: sleepTime,
      intervention_history: body.interventionHistory ?? [],
      history: body.history ?? [],
    };

    // 24h cache: if a snapshot was captured for this user in the last 24h,
    // return it instead of re-calling the backend.
    const cacheCutoff = new Date();
    cacheCutoff.setHours(cacheCutoff.getHours() - 24);

    const cached = await prisma.bioAgeSnapshot.findFirst({
      where: { userId, createdAt: { gte: cacheCutoff } },
      orderBy: { createdAt: "desc" },
    });

    if (cached) {
      const restored = restoreSnapshot(cached);
      return NextResponse.json({ data: restored });
    }

    const res = await fetch(`${BACKEND_URL}/bio-age/snapshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...backendHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[bio-age/snapshot] Backend error:", text);
      return NextResponse.json(
        { error: "Failed to fetch bio-age snapshot" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as {
      bio_age_snapshot: Record<string, unknown>;
      leverage_point: Record<string, unknown>;
    };

    // Persist the snapshot in Prisma (one row per user/day).
    const snapshot = data.bio_age_snapshot ?? {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const row = {
      userId,
      date: today,
      biologicalAge: num(snapshot.biologicalAge, 0),
      chronologicalAge: chronologicalAge,
      paceOfAging: num(snapshot.paceOfAging, 1),
      nutritionScore: num(snapshot.nutritionScore, 0),
      sleepScore: num(snapshot.sleepScore, 0),
      ansScore: num(snapshot.ansScore, 0),
      movementScore: num(snapshot.movementScore, 0),
      lightScore: num(snapshot.lightScore, 0),
      subjectiveScore: num(snapshot.subjectiveScore, 0),
      brainAge: nullableNum(snapshot.brainAge),
      cardiovascularAge: nullableNum(snapshot.cardiovascularAge),
      metabolicAge: nullableNum(snapshot.metabolicAge),
      immuneAge: nullableNum(snapshot.immuneAge),
      topLeverageDimension: (snapshot.topLeverageDimension as string | null) ?? null,
      leverageAction: (snapshot.leverageAction as string | null) ?? null,
      projectedImpact: nullableNum(snapshot.projectedImpact),
      inputData: snapshot as unknown as Record<string, unknown>,
    };

    const saved = await prisma.bioAgeSnapshot.upsert({
      where: { userId_date: { userId, date: today } },
      create: row as never,
      update: row as never,
    });

    const restored = restoreSnapshot(saved);
    return NextResponse.json({ data: restored });
  } catch (err) {
    console.error("[bio-age/snapshot] Proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function nullableNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

type SnapshotRow = {
  id: string;
  userId: string;
  date: Date;
  biologicalAge: number;
  chronologicalAge: number;
  paceOfAging: number;
  nutritionScore: number;
  sleepScore: number;
  ansScore: number;
  movementScore: number;
  lightScore: number;
  subjectiveScore: number;
  brainAge: number | null;
  cardiovascularAge: number | null;
  metabolicAge: number | null;
  immuneAge: number | null;
  topLeverageDimension: string | null;
  leverageAction: string | null;
  projectedImpact: number | null;
  inputData: unknown;
  createdAt: Date;
};

function restoreSnapshot(row: SnapshotRow): {
  bio_age_snapshot: Record<string, unknown>;
  leverage_point: Record<string, unknown>;
} {
  const stored = (row.inputData ?? {}) as Record<string, unknown>;
  const base: Record<string, unknown> = {
    ...stored,
    id: row.id,
    userId: row.userId,
    date: row.date.toISOString(),
    biologicalAge: row.biologicalAge,
    chronologicalAge: row.chronologicalAge,
    paceOfAging: row.paceOfAging,
    paceLabel:
      row.paceOfAging < 0.95
        ? "decelerating"
        : row.paceOfAging < 1.05
        ? "normal"
        : "accelerating",
    nutritionScore: row.nutritionScore,
    sleepScore: row.sleepScore,
    ansScore: row.ansScore,
    movementScore: row.movementScore,
    lightScore: row.lightScore,
    subjectiveScore: row.subjectiveScore,
    brainAge: row.brainAge,
    cardiovascularAge: row.cardiovascularAge,
    metabolicAge: row.metabolicAge,
    immuneAge: row.immuneAge,
    topLeverageDimension: row.topLeverageDimension,
    leverageAction: row.leverageAction,
    projectedImpact: row.projectedImpact,
    createdAt: row.createdAt.toISOString(),
  };

  const leveragePoint: Record<string, unknown> = {
    dimension: row.topLeverageDimension ?? stored.dimension ?? "",
    action: row.leverageAction ?? stored.action ?? "",
    projectedImpact: row.projectedImpact ?? stored.projectedImpact ?? 0,
    currentScore: stored.currentScore ?? 0,
    targetScore: stored.targetScore ?? 0,
  };

  return { bio_age_snapshot: base, leverage_point: leveragePoint };
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with chronologicalAge in body" },
    { status: 405 }
  );
}