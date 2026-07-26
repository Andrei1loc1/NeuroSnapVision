import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { BACKEND_URL, OLLAMA_CLOUD_URL, OLLAMA_MODEL, OLLAMA_CLOUD_API_KEY as OLLAMA_API_KEY, backendHeaders as makeBackendHeaders } from "@/lib/server/env";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function computeFallbackScore(data: {
  protocolCompleted: boolean;
  nutritionScore: number;
  sleepScore: number;
  movementScore: number;
  ansScore: number;
  mealCount: number;
  workoutDone: boolean;
}): number {
  const dimensionAvg =
    (data.nutritionScore + data.sleepScore + data.movementScore + data.ansScore) / 4;
  const protocolBonus = data.protocolCompleted ? 10 : 0;
  const mealBonus = Math.min(data.mealCount * 2, 6);
  const workoutBonus = data.workoutDone ? 5 : 0;
  return Math.min(100, Math.max(0, Math.round(dimensionAvg * 0.84 + protocolBonus + mealBonus + workoutBonus)));
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alignment = await prisma.meaningAlignment.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return NextResponse.json({
      data: alignment ? {
        alignmentScore: alignment.alignmentScore,
        reflection: alignment.reflection,
        gratitudeNote: alignment.gratitudeNote,
        date: formatDate(alignment.date),
      } : null,
    });
  } catch (err) {
    console.error("[alignment]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    let body: Record<string, unknown> = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {}
    const dateStr = (body.date as string) || formatDate(new Date());
    const dateObj = new Date(dateStr + "T00:00:00.000Z");
    const dateOnly = new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());

    const gratitudeNote = body.gratitudeNote as string | undefined;

    if (gratitudeNote !== undefined && body.gratitudeOnly === true) {
      const existing = await prisma.meaningAlignment.findUnique({
        where: { userId_date: { userId, date: dateOnly } },
      });

      const alignment = await prisma.meaningAlignment.upsert({
        where: { userId_date: { userId, date: dateOnly } },
        update: { gratitudeNote },
        create: {
          userId,
          date: dateOnly,
          alignmentScore: existing?.alignmentScore ?? 50,
          reflection: existing?.reflection ?? null,
          gratitudeNote,
        },
      });

      return NextResponse.json({
        data: {
          alignmentScore: alignment.alignmentScore,
          reflection: alignment.reflection,
          gratitudeNote: alignment.gratitudeNote,
          date: formatDate(alignment.date),
        },
      });
    }

    let northStar = body.northStar as string | undefined;
    let values: string[] = (body.values as string[]) ?? [];

    if (!northStar) {
      const purpose = await prisma.userPurpose.findUnique({ where: { userId } });
      if (purpose) {
        northStar = purpose.northStar;
        values = purpose.values ?? [];
      }
    }

    if (!northStar) {
      northStar = "sănătate și longevitate";
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { age: true } });
    const chronoAge = user?.age ?? 30;

    const backendHeaders: Record<string, string> = { "Content-Type": "application/json", ...makeBackendHeaders() };

    let bioAge: number | null = null;
    let paceOfAging: number | null = null;
    let nutritionScore = 50;
    let sleepScore = 50;
    let movementScore = 50;
    let ansScore = 50;

    try {
      const snapshotRes = await fetch(
        `${BACKEND_URL}/bio-age/current?user_id=${encodeURIComponent(userId)}&age=${chronoAge}`,
        { method: "GET", headers: backendHeaders }
      );
      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json();
        const snap = snapshotData?.data?.bio_age_snapshot ?? snapshotData?.bio_age_snapshot ?? snapshotData;
        if (snap) {
          bioAge = snap.biologicalAge ?? snap.bio_age ?? null;
          paceOfAging = snap.paceOfAging ?? snap.pace_of_aging ?? null;
          nutritionScore = snap.nutritionScore ?? snap.nutrition_score ?? nutritionScore;
          sleepScore = snap.sleepScore ?? snap.sleep_score ?? sleepScore;
          movementScore = snap.movementScore ?? snap.movement_score ?? movementScore;
          ansScore = snap.ansScore ?? snap.ans_score ?? ansScore;
        }
      }
    } catch {}

    let protocolCompleted = false;
    try {
      const protoRes = await fetch(
        `${BACKEND_URL}/protocol/today?user_id=${encodeURIComponent(userId)}`,
        { method: "GET", headers: backendHeaders }
      );
      if (protoRes.ok) {
        const protoData = await protoRes.json();
        const proto = protoData?.data?.protocol ?? protoData?.protocol ?? protoData;
        if (proto) {
          protocolCompleted = proto.isComplete ?? proto.is_complete ?? false;
        }
      }
    } catch {}

    let mealCount = 0;
    try {
      const dayStart = new Date(dateOnly);
      const dayEnd = new Date(dateOnly);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const meals = await prisma.meal.findMany({
        where: {
          userId,
          loggedAt: { gte: dayStart, lt: dayEnd },
        },
      });
      mealCount = meals.length;
    } catch {}

    let workoutDone = false;
    try {
      const workout = await prisma.workoutLog.findFirst({
        where: {
          userId,
          date: dateOnly,
        },
      });
      workoutDone = !!workout;
    } catch {}

    const fallbackData = {
      protocolCompleted,
      nutritionScore,
      sleepScore,
      movementScore,
      ansScore,
      mealCount,
      workoutDone,
    };

    const prompt = `Ești un analist de aliniere existențială în tradiția logoterapiei lui Viktor Frankl.

Analizează datele zilei utilizatorului și măsoară cât de aliniate sunt cu North Star-ul lor.

North Star: ${northStar}
Valorile: ${values.length > 0 ? values.join(", ") : "(neconfigurate)"}

Datele zilei:
- Vârstă biologică: ${bioAge ?? "N/A"} ani (reală: ${chronoAge})
- Ritm de îmbătrânire: ${paceOfAging ?? "N/A"}×
- Scor nutriție: ${nutritionScore}/100
- Scor somn: ${sleepScore}/100
- Scor mișcare: ${movementScore}/100
- Scor ANS: ${ansScore}/100
- Protocol completat: ${protocolCompleted ? "da" : "nu"}
- Mese logate: ${mealCount}
- Workout: ${workoutDone ? "da" : "nu"}

Răspunde DOAR cu JSON valid:
{
  "alignmentScore": <număr 0-100, cât de aliniate sunt acțiunile de azi cu North Star-ul>,
  "reflection": "<2-3 propoziții în română, stil Frankl: fără vinovăție, ancorate în sens, orientate spre viitor>"
}`;

    const messages = [{ role: "user", content: prompt }];

    const ollamaHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (OLLAMA_API_KEY) {
      ollamaHeaders["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    let alignmentScore: number;
    let reflection: string | null = null;

    try {
      const ollamaRes = await fetch(`${OLLAMA_CLOUD_URL}/api/chat`, {
        method: "POST",
        headers: ollamaHeaders,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 500,
          },
        }),
      });

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        const content = ollamaData?.message?.content ?? "";

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            alignmentScore = typeof parsed.alignmentScore === "number"
              ? Math.min(100, Math.max(0, Math.round(parsed.alignmentScore)))
              : computeFallbackScore(fallbackData);
            reflection = typeof parsed.reflection === "string" ? parsed.reflection : null;
          } catch {
            alignmentScore = computeFallbackScore(fallbackData);
          }
        } else {
          alignmentScore = computeFallbackScore(fallbackData);
        }
      } else {
        alignmentScore = computeFallbackScore(fallbackData);
      }
    } catch {
      alignmentScore = computeFallbackScore(fallbackData);
    }

    const alignment = await prisma.meaningAlignment.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      update: {
        alignmentScore,
        reflection,
        ...(gratitudeNote !== undefined ? { gratitudeNote } : {}),
      },
      create: {
        userId,
        date: dateOnly,
        alignmentScore,
        reflection,
        ...(gratitudeNote !== undefined ? { gratitudeNote } : {}),
      },
    });

    return NextResponse.json({
      data: {
        alignmentScore: alignment.alignmentScore,
        reflection: alignment.reflection,
        gratitudeNote: alignment.gratitudeNote,
        date: formatDate(alignment.date),
      },
    });
  } catch (err) {
    console.error("[alignment] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}