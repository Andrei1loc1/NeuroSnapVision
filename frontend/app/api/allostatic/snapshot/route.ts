import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let snapshot = await prisma.allostaticSnapshot.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!snapshot) {
      const todayStart = new Date(today);

      const stressEventsToday = await prisma.stressEvent.count({
        where: {
          userId,
          timestamp: { gte: todayStart },
        },
      });

      const hrvReadingsToday = await prisma.hrvReading.findMany({
        where: {
          userId,
          timestamp: { gte: todayStart },
        },
      });

      const dailyLoad = stressEventsToday * 10 + hrvReadingsToday.reduce((sum, r) => sum + r.stressLevel, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const previousSnapshots = await prisma.allostaticSnapshot.findMany({
        where: {
          userId,
          date: { lte: yesterday },
        },
        orderBy: { date: "desc" },
        take: 7,
      });

      const cumulativeBase = previousSnapshots.length > 0
        ? previousSnapshots.reduce((sum, s) => sum + s.dailyLoad, 0) / previousSnapshots.length
        : 0;
      const cumulativeLoad = cumulativeBase * 0.7 + dailyLoad * 0.3;

      const hrvBaseline = hrvReadingsToday.length > 0
        ? hrvReadingsToday.reduce((sum, r) => sum + (r.rmssd ?? 0), 0) / hrvReadingsToday.length
        : null;

      const trend = cumulativeLoad < cumulativeBase * 0.9 ? "improving"
        : cumulativeLoad > cumulativeBase * 1.1 ? "worsening"
        : "stable";

      const recoveryScore = Math.max(0, Math.min(100, 100 - cumulativeLoad * 2));

      snapshot = await prisma.allostaticSnapshot.create({
        data: {
          userId,
          date: today,
          dailyLoad,
          cumulativeLoad,
          trend,
          hrvBaseline,
          stressEvents: stressEventsToday,
          recoveryScore,
        },
      });
    }

    return NextResponse.json({ data: snapshot });
  } catch (err) {
    console.error("[snapshot]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}