import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

function calculateSolarWindow(
  location: { latitude: number; longitude: number; timezone: string },
  profile: { sleepTimeTarget: string; wakeTimeTarget: string }
) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  const solarNoonOffset = location.longitude / 15;
  const solarNoonHour = 12 + solarNoonOffset;

  let metabolicEfficiency: number;
  let phase: "alert" | "transition" | "wind-down" | "sleep";

  if (hour >= 8 && hour < 12) {
    metabolicEfficiency = 0.85 + (hour - 8) * 0.05;
    phase = "alert";
  } else if (hour >= 12 && hour < 17) {
    metabolicEfficiency = 1.0 - (hour - 12) * 0.08;
    phase = hour < 15 ? "alert" : "transition";
  } else if (hour >= 17 && hour < 21) {
    metabolicEfficiency = 0.6 - (hour - 17) * 0.15;
    phase = "wind-down";
  } else {
    metabolicEfficiency = 0;
    phase = "sleep";
  }
  metabolicEfficiency = Math.max(0, Math.min(1, metabolicEfficiency));

  const sleepHour = parseInt(profile.sleepTimeTarget.split(":")[0]);
  const dlmoHour = sleepHour - 2;

  const wakeHour = parseInt(profile.wakeTimeTarget.split(":")[0]);

  return {
    solarNoon: `${Math.floor(solarNoonHour)}:${String(Math.round((solarNoonHour % 1) * 60)).padStart(2, "0")}`,
    currentSolarAngle: (hour - 6) * 15,
    melatoninOnset: `${dlmoHour}:00`,
    optimalEatingWindow: {
      start: `${wakeHour + 1}:00`,
      end: `${dlmoHour - 1}:00`,
    },
    currentMetabolicEfficiency: metabolicEfficiency,
    phase,
  };
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const location = await prisma.userLocation.findUnique({ where: { userId } });
    const profile = await prisma.circadianProfile.findUnique({ where: { userId } });

    if (!location) {
      const defaultResult = calculateSolarWindow(
        { latitude: 0, longitude: 0, timezone: "UTC" },
        { sleepTimeTarget: profile?.sleepTimeTarget ?? "23:00", wakeTimeTarget: profile?.wakeTimeTarget ?? "07:00" }
      );
      return NextResponse.json({ data: { ...defaultResult, usingDefaultLocation: true } });
    }

    const result = calculateSolarWindow(
      { latitude: location.latitude, longitude: location.longitude, timezone: location.timezone },
      { sleepTimeTarget: profile?.sleepTimeTarget ?? "23:00", wakeTimeTarget: profile?.wakeTimeTarget ?? "07:00" }
    );

    return NextResponse.json({ data: { ...result, usingDefaultLocation: false } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}