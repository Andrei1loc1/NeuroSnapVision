import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const latestReading = await prisma.hrvReading.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayReadings = await prisma.hrvReading.findMany({
      where: {
        userId,
        timestamp: { gte: todayStart },
      },
      orderBy: { timestamp: "desc" },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReadings = await prisma.hrvReading.findMany({
      where: {
        userId,
        timestamp: { gte: sevenDaysAgo },
      },
      orderBy: { timestamp: "asc" },
    });

    const baseline = recentReadings.length >= 3
      ? recentReadings.reduce((sum, r) => sum + (r.rmssd ?? 0), 0) / recentReadings.length
      : null;

    const trend = recentReadings.length >= 5
      ? (() => {
          const firstHalf = recentReadings.slice(0, Math.floor(recentReadings.length / 2));
          const secondHalf = recentReadings.slice(Math.floor(recentReadings.length / 2));
          const firstAvg = firstHalf.reduce((s, r) => s + (r.rmssd ?? 0), 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((s, r) => s + (r.rmssd ?? 0), 0) / secondHalf.length;
          if (secondAvg > firstAvg * 1.05) return "improving";
          if (secondAvg < firstAvg * 0.95) return "declining";
          return "stable";
        })()
      : "insufficient_data";

    const needsPause = latestReading != null && latestReading.stressLevel > 7;

    return NextResponse.json({
      data: {
        latestReading,
        baseline,
        trend,
        needsPause,
        todayReadingCount: todayReadings.length,
      },
    });
  } catch (err) {
    console.error("[hrv/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}