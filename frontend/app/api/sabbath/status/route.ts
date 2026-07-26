import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";

function isSabbath(sabbath: { isActive: boolean; sabbathDay: number }): boolean {
  const today = new Date().getDay();
  return sabbath.isActive && sabbath.sabbathDay === today;
}

const SABBATH_MESSAGES = [
  "Disconnect to reconnect. Today is your digital sabbath.",
  "Rest is not idleness. Embrace the stillness today.",
  "Your mind deserves a break from the noise. Sabbath mode active.",
  "Reclaim your attention. The screens can wait.",
];

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const sabbath = await prisma.digitalSabbath.findUnique({ where: { userId } });

    if (!sabbath) {
      return NextResponse.json({
        data: { isSabbath: false, message: null, sabbathConfigured: false },
      });
    }

    const todayIsSabbath = isSabbath(sabbath);
    const message = todayIsSabbath
      ? SABBATH_MESSAGES[Math.floor(Math.random() * SABBATH_MESSAGES.length)]
      : null;

    return NextResponse.json({
      data: { isSabbath: todayIsSabbath, message, sabbathConfigured: true },
    });
  } catch (err) {
    console.error("[sabbath/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}