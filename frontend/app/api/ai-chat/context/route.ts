import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  const userId = auth;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const [workoutCount, hrvAvg, user, todayProtocol] = await Promise.all([
      prisma.workoutLog.count({
        where: {
          userId,
          date: { gte: today, lt: tomorrow },
        },
      }),
      prisma.hrvReading.aggregate({
        where: {
          userId,
          timestamp: { gte: today, lt: tomorrow },
        },
        _avg: { stressLevel: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { sleepHours: true },
      }),
      prisma.dailyProtocol.findUnique({
        where: {
          userId_date: { userId, date: today },
        },
        select: {
          eveningStress: true,
          morningEnergy: true,
          isComplete: true,
        },
      }),
    ]);

    const avgStress = hrvAvg._avg.stressLevel
      ? Math.round(hrvAvg._avg.stressLevel * 10) / 10
      : todayProtocol?.eveningStress ?? 3;

    const sleepHours = user?.sleepHours ?? 0;

    return NextResponse.json({
      workoutCount,
      avgStress,
      sleepHours,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch context" },
      { status: 500 }
    );
  }
}