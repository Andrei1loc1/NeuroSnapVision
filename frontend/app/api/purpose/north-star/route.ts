import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const purpose = await prisma.userPurpose.findUnique({ where: { userId } });
    if (!purpose) {
      return NextResponse.json({ data: null });
    }
    return NextResponse.json({ data: purpose });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();
    const { northStar, whyStatement, values } = body;

    if (!northStar || typeof northStar !== "string" || !northStar.trim()) {
      return NextResponse.json({ error: "northStar is required" }, { status: 400 });
    }

    const purpose = await prisma.userPurpose.upsert({
      where: { userId },
      update: {
        northStar: northStar.trim(),
        whyStatement: whyStatement?.trim() ?? null,
        values: Array.isArray(values) ? values : [],
      },
      create: {
        userId,
        northStar: northStar.trim(),
        whyStatement: whyStatement?.trim() ?? null,
        values: Array.isArray(values) ? values : [],
      },
    });

    return NextResponse.json({ data: purpose });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}