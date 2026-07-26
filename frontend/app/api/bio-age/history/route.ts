import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const url = new URL(request.url);
    const days = Math.max(1, Math.min(730, Number(url.searchParams.get("days")) || 90));

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await prisma.bioAgeSnapshot.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
    });

    const snapshots = rows.map((row) => {
      const stored = (row.inputData ?? {}) as Record<string, unknown>;
      return {
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
    });

    return NextResponse.json({ data: { snapshots } });
  } catch (err) {
    console.error("[bio-age/history] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}