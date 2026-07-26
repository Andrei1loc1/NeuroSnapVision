import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";
import { prisma } from "@/lib/db/prisma";

interface InterventionProxyBody {
  chronologicalAge?: number;
  northStar?: string;
  metrics?: Record<string, unknown>;
}

async function collectHistory(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const snapshots = await prisma.bioAgeSnapshot.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
    select: {
      date: true,
      nutritionScore: true,
      sleepScore: true,
      ansScore: true,
      movementScore: true,
      lightScore: true,
      subjectiveScore: true,
    },
  });

  return snapshots.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    nutritionScore: s.nutritionScore,
    sleepScore: s.sleepScore,
    ansScore: s.ansScore,
    movementScore: s.movementScore,
    lightScore: s.lightScore,
    subjectiveScore: s.subjectiveScore,
  }));
}

type HistorySnapshot = {
  date: string;
  nutritionScore: number;
  sleepScore: number;
  ansScore: number;
  movementScore: number;
  lightScore: number;
  subjectiveScore: number;
};

async function forwardToBackend(
  userId: string,
  chronologicalAge: number,
  northStar: string | undefined,
  userHistory: HistorySnapshot[],
  metrics?: Record<string, unknown>
) {
  return fetch(`${BACKEND_URL}/intervention/today`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...backendHeaders(),
    },
    body: JSON.stringify({
      user_id: userId,
      chronological_age: chronologicalAge,
      ...(northStar ? { north_star: northStar } : {}),
      ...(metrics ? { metrics } : {}),
      user_history: userHistory,
    }),
  });
}

async function handle(
  userId: string,
  chronologicalAge: number,
  northStar: string | undefined,
  metrics?: Record<string, unknown>,
  days = 7
) {
  if (!chronologicalAge || chronologicalAge <= 0) {
    return NextResponse.json(
      { error: "Missing or invalid chronological age" },
      { status: 400 }
    );
  }
  const safeDays = Math.min(Math.max(days, 1), 90);
  const userHistory = await collectHistory(userId, safeDays);

  const res = await forwardToBackend(
    userId,
    chronologicalAge,
    northStar,
    userHistory,
    metrics
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[bio-age/intervention] Backend error:", text);
    return NextResponse.json(
      { error: "Failed to fetch intervention" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ data });
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const url = new URL(request.url);
    const chronologicalAge = Number(url.searchParams.get("age")) || 0;
    const northStar = url.searchParams.get("north_star") || undefined;
    const days = parseInt(url.searchParams.get("days") || "7", 10) || 7;
    return await handle(userId, chronologicalAge, northStar, undefined, days);
  } catch (err) {
    console.error("[bio-age/intervention] Proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = (await request.json().catch(() => ({}))) as InterventionProxyBody;
    const chronologicalAge = Number(body.chronologicalAge) || 0;
    return await handle(
      userId,
      chronologicalAge,
      body.northStar,
      body.metrics,
      7
    );
  } catch (err) {
    console.error("[bio-age/intervention] Proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}