import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { getDateRange } from "@/lib/db/dateRange";
import {
  addNutrition,
  emptyNutrition,
  toNumber,
  type NutritionTotals,
} from "@/lib/db/nutrition";
import { serializeReport } from "@/lib/db/serializers";
import { normalizeReportType } from "@/lib/server/validators";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const { searchParams } = new URL(request.url);
  const { start, end } = getDateRange(searchParams);
  const report = await buildReport(start, end, userId);

  return NextResponse.json({ data: report });
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const body = await request.json().catch(() => ({}));
  const rangeStart = body.rangeStart ? new Date(body.rangeStart) : undefined;
  const rangeEnd = body.rangeEnd ? new Date(body.rangeEnd) : undefined;

  if (!rangeStart || !rangeEnd) {
    return NextResponse.json(
      { error: "rangeStart and rangeEnd are required" },
      { status: 400 },
    );
  }

  const report = await buildReport(rangeStart, rangeEnd, userId);
  const type = normalizeReportType(body.type);

  const snapshot = await prisma.reportSnapshot.create({
    data: {
      type,
      title: String(body.title ?? report.title),
      rangeStart,
      rangeEnd,
      totalCalories: report.totals.calories,
      totalProteinGrams: report.totals.proteinGrams,
      totalCarbsGrams: report.totals.carbsGrams,
      totalFatGrams: report.totals.fatGrams,
      mealCount: report.mealCount,
      recommendations: body.recommendations ?? report.recommendations,
      snapshot: report,
    },
  });

  return NextResponse.json({ data: serializeReport(snapshot) }, { status: 201 });
}

async function buildReport(start: Date, end: Date, userId: string | null) {
  const meals = await prisma.meal.findMany({
    where: {
      userId: userId ?? null,
      loggedAt: { gte: start, lte: end },
    },
    include: { items: true },
    orderBy: { loggedAt: "asc" },
  });

  const totals = meals.reduce<NutritionTotals>((mealTotals, meal) => {
    const itemTotals = meal.items.reduce<NutritionTotals>((totalsSoFar, item) => {
      return addNutrition(totalsSoFar, {
        calories: toNumber(item.calories),
        proteinGrams: toNumber(item.proteinGrams),
        carbsGrams: toNumber(item.carbsGrams),
        fatGrams: toNumber(item.fatGrams),
      });
    }, emptyNutrition());

    return addNutrition(mealTotals, itemTotals);
  }, emptyNutrition());

  const totalMacros = totals.proteinGrams + totals.carbsGrams + totals.fatGrams;

  return {
    title: "Nutrition Report",
    range: { start, end },
    mealCount: meals.length,
    totals,
    macroBalance:
      totalMacros === 0
        ? { protein: 0, carbs: 0, fat: 0 }
        : {
            protein: Math.round((totals.proteinGrams / totalMacros) * 100),
            carbs: Math.round((totals.carbsGrams / totalMacros) * 100),
            fat: Math.round((totals.fatGrams / totalMacros) * 100),
          },
    recommendations: buildRecommendations(totals),
  };
}

function buildRecommendations(totals: NutritionTotals) {
  if (totals.calories === 0) {
    return [{ title: "Log meals", description: "Add meals to unlock report insights." }];
  }
  if (totals.proteinGrams < 80) {
    return [{ title: "Increase protein", description: "Add a high-protein meal or snack." }];
  }
  return [{ title: "Keep tracking", description: "Your journal has enough data for trend reports." }];
}
