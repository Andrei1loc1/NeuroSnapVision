import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const protocols = await prisma.dailyProtocol.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        isComplete: true,
      },
      select: {
        date: true,
        morningRecovery: true,
        eveningStress: true,
      },
      orderBy: { date: "asc" },
    });

    const dates: Record<string, { morning: boolean; evening: boolean }> = {};

    for (const p of protocols) {
      const key = p.date.toISOString().slice(0, 10);
      if (!dates[key]) dates[key] = { morning: false, evening: false };
      if (p.morningRecovery != null) dates[key].morning = true;
      if (p.eveningStress != null) dates[key].evening = true;
    }

    return NextResponse.json({ data: { dates } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}