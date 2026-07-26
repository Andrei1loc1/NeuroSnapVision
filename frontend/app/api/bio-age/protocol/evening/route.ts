import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/protocol/evening`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...backendHeaders() },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[evening] Backend error:", text);
      return NextResponse.json(
        { error: "Failed to fetch evening protocol" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const targetDate = body.date ? new Date(body.date + "T00:00:00.000Z") : new Date();
    const dateOnly = new Date(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());

    try {
      await prisma.dailyProtocol.upsert({
        where: { userId_date: { userId, date: dateOnly } },
        update: {
          eveningStress: body.stress ?? body.evening_stress ?? undefined,
          eveningDigestion: body.digestion ?? body.evening_digestion ?? undefined,
          eveningMood: body.mood ?? body.evening_mood ?? undefined,
          eveningEnergy: body.energy ?? body.evening_energy ?? undefined,
          eveningLibido: body.libido ?? body.evening_libido ?? undefined,
          supplements: body.supplements ?? [],
          morningLight: body.morning_light ?? undefined,
          socialConnection: body.social_connection ?? undefined,
          coldExposure: body.cold_exposure ?? undefined,
          heatExposure: body.heat_exposure ?? undefined,
          oralHealth: body.oral_health ?? undefined,
          caffeineCutoff: body.caffeine_cutoff ?? undefined,
          screenCutoff: body.screen_cutoff ?? undefined,
          lastMealTime: body.last_meal_time ?? undefined,
          isComplete: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          date: dateOnly,
          eveningStress: body.stress ?? body.evening_stress ?? undefined,
          eveningDigestion: body.digestion ?? body.evening_digestion ?? undefined,
          eveningMood: body.mood ?? body.evening_mood ?? undefined,
          eveningEnergy: body.energy ?? body.evening_energy ?? undefined,
          eveningLibido: body.libido ?? body.evening_libido ?? undefined,
          supplements: body.supplements ?? [],
          morningLight: body.morning_light ?? undefined,
          socialConnection: body.social_connection ?? undefined,
          coldExposure: body.cold_exposure ?? undefined,
          heatExposure: body.heat_exposure ?? undefined,
          oralHealth: body.oral_health ?? undefined,
          caffeineCutoff: body.caffeine_cutoff ?? undefined,
          screenCutoff: body.screen_cutoff ?? undefined,
          lastMealTime: body.last_meal_time ?? undefined,
          isComplete: true,
          completedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.error("[evening] DB persist error:", dbErr);
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}