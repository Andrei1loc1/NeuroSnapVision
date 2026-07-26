import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    await prisma.meal.delete({
      where: { id, userId },
    });

    return NextResponse.json({ data: { id } });
  } catch {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }
}
