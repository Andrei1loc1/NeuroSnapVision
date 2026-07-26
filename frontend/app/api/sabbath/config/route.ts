import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const sabbath = await prisma.digitalSabbath.findUnique({ where: { userId } });
    if (!sabbath) {
      return NextResponse.json({
        data: { id: null, userId, sabbathDay: 6, isActive: true },
      });
    }
    return NextResponse.json({ data: sabbath });
  } catch (err) {
    console.error("[sabbath/config]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();
    const { sabbathDay, isActive } = body;

    if (sabbathDay == null || typeof sabbathDay !== "number" || sabbathDay < 0 || sabbathDay > 6) {
      return NextResponse.json({ error: "sabbathDay must be a number 0-6" }, { status: 400 });
    }

    const sabbath = await prisma.digitalSabbath.upsert({
      where: { userId },
      update: {
        sabbathDay: Number(sabbathDay),
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      create: {
        userId,
        sabbathDay: Number(sabbathDay),
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json({ data: sabbath });
  } catch (err) {
    console.error("[sabbath/config]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}