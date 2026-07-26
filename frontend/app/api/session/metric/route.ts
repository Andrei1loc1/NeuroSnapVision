import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

function calculateKpiScore(avgDurationSec: number): number {
  return Math.max(0, Math.min(100, 100 - ((avgDurationSec - 120) * 100) / 780));
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metric = await prisma.sessionMetric.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return NextResponse.json({
      data: metric
        ? {
            kpiScore: metric.kpiScore,
            sessionCount: metric.sessionCount,
            totalDurationSec: metric.totalDurationSec,
            avgDurationSec: metric.avgDurationSec,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();
    const { sessionDurationSec, sessionCount, totalDurationSec, avgDurationSec, date, kpiScore: providedKpi } = body;

    const duration = Number(sessionDurationSec ?? totalDurationSec ?? 0);
    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: "sessionDurationSec is required" },
        { status: 400 }
      );
    }

    const count = Number(sessionCount ?? 1);
    const total = Number(totalDurationSec ?? duration);
    const avg = Number(avgDurationSec ?? duration);
    const kpi = providedKpi != null ? Number(providedKpi) : calculateKpiScore(avg);

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const metric = await prisma.sessionMetric.upsert({
      where: { userId_date: { userId, date: entryDate } },
      update: {
        sessionCount: count,
        totalDurationSec: total,
        avgDurationSec: avg,
        kpiScore: kpi,
      },
      create: {
        userId,
        date: entryDate,
        sessionCount: count,
        totalDurationSec: total,
        avgDurationSec: avg,
        kpiScore: kpi,
      },
    });

    return NextResponse.json({ data: metric }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}