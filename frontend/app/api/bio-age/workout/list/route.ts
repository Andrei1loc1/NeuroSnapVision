import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: {
        workouts: workouts.map((w) => ({
          id: w.id,
          userId: w.userId,
          date: w.date.toISOString().slice(0, 10),
          type: w.type,
          intensity: w.intensity,
          durationMin: w.durationMin,
          notes: w.notes,
          source: w.source,
          createdAt: w.createdAt.toISOString(),
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}