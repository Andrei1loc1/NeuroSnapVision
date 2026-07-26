import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      age: true,
      sex: true,
      bodyType: true,
      activityLevel: true,
      goal: true,
      sleepHours: true,
      weight: true,
      height: true,
      sleepTime: true,
      targetCalories: true,
      targetProtein: true,
      targetFats: true,
      lateMealThreshold: true,
      focusArea: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PUT(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();

    const data: Record<string, unknown> = {};
    const allowedFields = [
      "displayName", "age", "sex", "bodyType", "activityLevel", "goal",
      "sleepHours", "weight", "height", "sleepTime",
      "targetCalories", "targetProtein", "targetFats",
      "lateMealThreshold", "focusArea",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (data.displayName) {
      data.displayName = String(data.displayName);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({ data: user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}