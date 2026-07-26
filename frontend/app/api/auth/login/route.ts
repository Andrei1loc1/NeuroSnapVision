import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { signSession } from "@/lib/server/session";

async function setSessionCookie(response: NextResponse, userId: string) {
  const token = await signSession(userId);
  response.cookies.set("neurosnap_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

export async function POST(request: Request) {
  const body = await request.json();
  const displayName = (body.displayName || "").trim();
  if (!displayName) {
    return NextResponse.json({ error: "displayName required" }, { status: 400 });
  }

  const profileData: Record<string, unknown> = {};
  const allowedFields = [
    "age", "sex", "bodyType", "activityLevel", "goal", "sleepHours",
    "weight", "height", "sleepTime",
    "targetCalories", "targetProtein", "targetFats",
    "lateMealThreshold", "focusArea",
  ];
  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== null) {
      profileData[field] = body[field];
    }
  }

  try {
    const user = await prisma.user.findUnique({ where: { displayName } });
    if (user) {
      if (Object.keys(profileData).length > 0) {
        await prisma.user.update({ where: { id: user.id }, data: profileData });
      }
      return setSessionCookie(
        NextResponse.json({ id: user.id, displayName: user.displayName }),
        user.id,
      );
    }

    const newUser = await prisma.user.create({
      data: { displayName, ...profileData },
    });
    return setSessionCookie(
      NextResponse.json({ id: newUser.id, displayName: newUser.displayName }),
      newUser.id,
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.user.findUnique({ where: { displayName } });
      if (existing) {
        if (Object.keys(profileData).length > 0) {
          await prisma.user.update({ where: { id: existing.id }, data: profileData });
        }
        return setSessionCookie(
          NextResponse.json({ id: existing.id, displayName: existing.displayName }),
          existing.id,
        );
      }
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}