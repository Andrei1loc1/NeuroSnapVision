import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import {
  formatFoodName,
  normalizeNutrition,
  slugFromLabel,
} from "@/lib/db/nutrition";
import { serializeScan } from "@/lib/db/serializers";
import { normalizePortionSize } from "@/lib/server/validators";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const scans = await prisma.scan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { image: true },
    take: 50,
  });

  return NextResponse.json({ data: scans.map(serializeScan) });
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const body = await request.json();
  const predictedLabel = String(body.predictedLabel ?? body.food_class ?? "").trim();

  if (!predictedLabel) {
    return NextResponse.json(
      { error: "predictedLabel is required" },
      { status: 400 },
    );
  }

  const nutrition = normalizeNutrition(body.nutrition);
  const food = await prisma.food.findUnique({
    where: { slug: slugFromLabel(predictedLabel) },
  });

  const image = body.image?.url
    ? await prisma.scanImage.create({
        data: {
          url: String(body.image.url),
          mimeType: body.image.mimeType ? String(body.image.mimeType) : null,
          sizeBytes: Number.isFinite(Number(body.image.sizeBytes))
            ? Number(body.image.sizeBytes)
            : null,
          width: Number.isFinite(Number(body.image.width))
            ? Number(body.image.width)
            : null,
          height: Number.isFinite(Number(body.image.height))
            ? Number(body.image.height)
            : null,
        },
      })
    : null;

  const portionSize = normalizePortionSize(body.portionSize ?? body.portion ?? "MEDIUM");

  const scan = await prisma.scan.create({
    data: {
      userId,
      foodId: food?.id,
      imageId: image?.id,
      predictedLabel,
      displayName: String(body.displayName ?? formatFoodName(predictedLabel)),
      confidence: Number(body.confidence ?? 0),
      portionSize,
      portionLabel: body.portionLabel ?? body.portion ?? null,
      calories: nutrition.calories,
      proteinGrams: nutrition.proteinGrams,
      carbsGrams: nutrition.carbsGrams,
      fatGrams: nutrition.fatGrams,
      rawPrediction: body.rawPrediction ?? body,
    },
    include: { image: true },
  });

  return NextResponse.json({ data: serializeScan(scan) }, { status: 201 });
}
