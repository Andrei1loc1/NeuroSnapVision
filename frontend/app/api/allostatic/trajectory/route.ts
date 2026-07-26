import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const validDays = [30, 90].includes(days) ? days : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validDays);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await prisma.allostaticSnapshot.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      data: snapshots,
      range: { days: validDays, start: startDate.toISOString() },
    });
  } catch (err) {
    console.error("[trajectory]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}