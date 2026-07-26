import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const body = await request.json();
    const { sdnn, rmssd, stressLevel, source, sessionDurationSec } = body;

    if (stressLevel == null || typeof stressLevel !== "number") {
      return NextResponse.json({ error: "stressLevel is required" }, { status: 400 });
    }

    const reading = await prisma.hrvReading.create({
      data: {
        userId,
        sdnn: sdnn != null ? Number(sdnn) : null,
        rmssd: rmssd != null ? Number(rmssd) : null,
        stressLevel: Number(stressLevel),
        source: source ?? "ppg",
        sessionDurationSec: sessionDurationSec != null ? Number(sessionDurationSec) : null,
      },
    });

    if (stressLevel > 7) {
      await prisma.stressEvent.create({
        data: {
          userId,
          stressLevel: Number(stressLevel),
          trigger: body.trigger ?? null,
          resolution: body.resolution ?? null,
          durationSec: body.durationSec != null ? Number(body.durationSec) : null,
        },
      });
    }

    return NextResponse.json({ data: reading }, { status: 201 });
  } catch (err) {
    console.error("[hrv/reading]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}