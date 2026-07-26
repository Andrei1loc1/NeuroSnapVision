import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { serializeMeal } from "@/lib/db/serializers";
import {
  normalizeMealType,
  normalizePortionSize,
} from "@/lib/server/validators";

function calculateMetabolicMultiplier(
  loggedAt: Date,
  circadianProfile?: { wakeTimeTarget: string; sleepTimeTarget: string; melatoninOnset: string | null } | null,
): number {
  const hour = loggedAt.getHours() + loggedAt.getMinutes() / 60;

  if (!circadianProfile) {
    if (hour >= 7 && hour <= 20) return 1.0;
    if (hour >= 23 || hour < 5) return 1.5;
    if (hour >= 21) return 1.4;
    return 1.2;
  }

  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const wake = parseTime(circadianProfile.wakeTimeTarget);
  const sleep = parseTime(circadianProfile.sleepTimeTarget);
  const optimalStart = wake + 1;
  const optimalEnd = sleep - 3;

  if (hour >= optimalStart && hour <= optimalEnd) return 1.0;

  const melatoninOnset = circadianProfile.melatoninOnset
    ? parseTime(circadianProfile.melatoninOnset)
    : sleep - 2;

  if (hour >= melatoninOnset || hour < wake) return 1.5;
  if (hour >= sleep - 2) return 1.4;

  const distAfterEnd = hour > optimalEnd ? hour - optimalEnd : optimalStart - hour;
  const distBeforeStart = hour < optimalStart ? optimalStart - hour : 0;
  const dist = Math.max(distAfterEnd, distBeforeStart);

  if (dist >= 2) return 1.2;
  if (dist >= 1) return 1.1;
  return 1.0;
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: start ? new Date(start) : undefined, lte: end ? new Date(end) : undefined },
    },
    include: {
      items: true,
      sourceScan: { include: { image: true } },
    },
    orderBy: { loggedAt: "desc" },
  });

  return NextResponse.json({ data: meals.map(serializeMeal), range: { start, end } });
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const body = await request.json();
  const mealType = normalizeMealType(body.mealType);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!body.title && items.length === 0) {
    return NextResponse.json(
      { error: "title or at least one item is required" },
      { status: 400 },
    );
  }

  let sourceScanId: string | undefined;

  if (body.imageUrl && typeof body.imageUrl === "string") {
    const bestItem = items[0];
    const scanImage = await prisma.scanImage.create({
      data: {
        url: body.imageUrl,
        mimeType: "image/jpeg",
      },
    });

    const scan = await prisma.scan.create({
      data: {
        userId,
        predictedLabel: bestItem?.name ?? "unknown",
        displayName: bestItem?.name ?? "Unknown",
        confidence: 0,
        portionSize: "MEDIUM",
        calories: bestItem?.calories ?? 0,
        proteinGrams: bestItem?.proteinGrams ?? 0,
        carbsGrams: bestItem?.carbsGrams ?? 0,
        fatGrams: bestItem?.fatGrams ?? 0,
        status: "ADDED_TO_JOURNAL",
        imageId: scanImage.id,
      },
    });

    sourceScanId = scan.id;
  }

  const loggedAt = body.loggedAt ? new Date(body.loggedAt) : new Date();

  let circadianProfile: { wakeTimeTarget: string; sleepTimeTarget: string; melatoninOnset: string | null } | null = null;
  if (userId) {
    circadianProfile = await prisma.circadianProfile.findUnique({ where: { userId } });
  }

  const metabolicMultiplier = calculateMetabolicMultiplier(loggedAt, circadianProfile);

  let stressMultiplier = 1.0;
  if (userId) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentStressEvent = await prisma.hrvReading.findFirst({
      where: {
        userId,
        stressLevel: { gt: 7 },
        timestamp: { gte: thirtyMinutesAgo },
      },
      orderBy: { stressLevel: "desc" },
    });
    if (recentStressEvent) {
      stressMultiplier = recentStressEvent.stressLevel > 9 ? 1.3 : 1.2;
    }
  }

  const meal = await prisma.meal.create({
    data: {
      userId,
      mealType,
      title: body.title ? String(body.title) : "",
      notes: body.notes ? String(body.notes) : null,
      loggedAt,
      metabolicMultiplier,
      stressMultiplier,
      sourceScanId,
      items: {
        create: items.map((item: { name?: unknown; quantity?: unknown; portionSize?: unknown; portionLabel?: unknown; calories?: unknown; proteinGrams?: unknown; carbsGrams?: unknown; fatGrams?: unknown }) => ({
          foodId: null,
          name: String(item.name ?? ""),
          quantity: Number(item.quantity ?? 1),
          portionSize: normalizePortionSize(item.portionSize),
          portionLabel: (item.portionLabel != null ? String(item.portionLabel) : null) as string | null,
          calories: Number(item.calories ?? 0),
          proteinGrams: Number(item.proteinGrams ?? 0),
          carbsGrams: Number(item.carbsGrams ?? 0),
          fatGrams: Number(item.fatGrams ?? 0),
        })),
      },
    },
    include: { items: true, sourceScan: { include: { image: true } } },
  });

  return NextResponse.json({ data: serializeMeal(meal) }, { status: 201 });
}
