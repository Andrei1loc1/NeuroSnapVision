import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const experiments = await prisma.experiment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: experiments });
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
    const { name, hypothesis, protocol, startDate, endDate, templateId } = body;

    if (!name || !hypothesis) {
      return NextResponse.json({ error: "name and hypothesis are required" }, { status: 400 });
    }

    const experiment = await prisma.experiment.create({
      data: {
        userId,
        name,
        hypothesis,
        protocol: protocol ?? {},
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        templateId: templateId ?? null,
        status: "PLANNING",
      },
    });

    return NextResponse.json({ data: experiment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await request.json();
    const { status, results, endDate } = body;

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (results !== undefined) data.results = results;
    if (endDate) data.endDate = new Date(endDate);

    const experiment = await prisma.experiment.updateMany({
      where: { id, userId },
      data,
    });

    return NextResponse.json({ data: experiment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.experiment.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}