import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { serializeMeal } from "@/lib/db/serializers";
import {
  normalizeMealType,
  normalizePortionSize,
} from "@/lib/server/validators";

const PORTION_MULTIPLIERS: Record<string, number> = {
  SMALL: 0.7,
  MEDIUM: 1.0,
  LARGE: 1.3,
};

function applyPortionMultiplier(
  baseValue: number,
  portionSize: ReturnType<typeof normalizePortionSize>,
): number {
  const multiplier = PORTION_MULTIPLIERS[portionSize] ?? 1.0;
  return Math.round(baseValue * multiplier * 100) / 100;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const body = await request.json().catch(() => ({}));
  const mealType = normalizeMealType(body.mealType);
  const portionSize = normalizePortionSize(body.portionSize);

  const meal = await prisma.$transaction(async (tx) => {
    const scan = await tx.scan.findUnique({ where: { id } });

    if (!scan || (scan.userId && scan.userId !== userId)) {
      return null;
    }

    const createdMeal = await tx.meal.create({
      data: {
        userId,
        sourceScanId: scan.id,
        mealType,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
        title: body.title ? String(body.title) : scan.displayName,
        notes: body.notes ? String(body.notes) : null,
        items: {
          create: {
            foodId: scan.foodId,
            name: scan.displayName,
            quantity: Number(body.quantity ?? 1),
            portionSize,
            portionLabel: portionSize.toLowerCase(),
            calories: applyPortionMultiplier(Number(scan.calories), portionSize),
            proteinGrams: applyPortionMultiplier(Number(scan.proteinGrams), portionSize),
            carbsGrams: applyPortionMultiplier(Number(scan.carbsGrams), portionSize),
            fatGrams: applyPortionMultiplier(Number(scan.fatGrams), portionSize),
          },
        },
      },
      include: { items: true },
    });

    await tx.scan.update({
      where: { id: scan.id },
      data: {
        status: "ADDED_TO_JOURNAL",
        portionSize,
        portionLabel: portionSize.toLowerCase(),
      },
    });

    return createdMeal;
  });

  if (!meal) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json({ data: serializeMeal(meal) }, { status: 201 });
}
