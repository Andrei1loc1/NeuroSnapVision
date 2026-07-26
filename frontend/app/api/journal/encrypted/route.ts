import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: Record<string, unknown> = { userId };
    if (start || end) {
      const dateFilter: Record<string, Date> = {};
      if (start) dateFilter.gte = new Date(start);
      if (end) dateFilter.lte = new Date(end);
      where.date = dateFilter;
    }

    const entries = await prisma.encryptedJournal.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: entries });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();
    const { date, encryptedEntry, iv } = body;

    if (!encryptedEntry || typeof encryptedEntry !== "string") {
      return NextResponse.json({ error: "encryptedEntry is required" }, { status: 400 });
    }
    if (!iv || typeof iv !== "string") {
      return NextResponse.json({ error: "iv is required" }, { status: 400 });
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const entry = await prisma.encryptedJournal.upsert({
      where: { userId_date: { userId, date: entryDate } },
      update: { encryptedEntry, iv },
      create: { userId, date: entryDate, encryptedEntry, iv },
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}