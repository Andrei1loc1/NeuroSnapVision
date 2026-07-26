import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { serializeMeal } from "@/lib/db/serializers";

interface RangeRequest {
  id: string;
  start: string;
  end: string;
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  let body: { ranges?: RangeRequest[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ranges = body.ranges;
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return NextResponse.json({ error: "ranges must be a non-empty array" }, { status: 400 });
  }

  const parsedRanges = ranges.map((r: RangeRequest) => ({
    id: r.id,
    start: new Date(r.start),
    end: new Date(r.end),
  }));

  const minStart = new Date(Math.min(...parsedRanges.map((r) => r.start.getTime())));
  const maxEnd = new Date(Math.max(...parsedRanges.map((r) => r.end.getTime())));

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: minStart, lte: maxEnd },
    },
    include: {
      items: true,
      sourceScan: { include: { image: true } },
    },
    orderBy: { loggedAt: "desc" },
  });

  const serialized = meals.map(serializeMeal);

  const result: Record<string, typeof serialized> = {};
  for (const r of parsedRanges) {
    result[r.id] = [];
  }

  for (const meal of serialized) {
    const loggedAt = new Date(meal.loggedAt);
    for (const r of parsedRanges) {
      if (loggedAt >= r.start && loggedAt <= r.end) {
        result[r.id].push(meal);
      }
    }
  }

  return NextResponse.json({ data: result });
}