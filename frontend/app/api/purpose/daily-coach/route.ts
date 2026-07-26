import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/db/prisma";
import { BACKEND_URL, OLLAMA_CLOUD_URL, OLLAMA_MODEL, OLLAMA_CLOUD_API_KEY as OLLAMA_API_KEY, backendHeaders as makeBackendHeaders } from "@/lib/server/env";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

const FALLBACK: Record<string, { coach: string; bridge: string }> = {
  sleep: { coach: "Azi, concentrează-te pe somn. Culcă-te la ora potrivită.", bridge: "Odihna de azi e puterea de mâine." },
  nutrition: { coach: "Azi, alimentația e prioritatea. Alege proteine la fiecare masă.", bridge: "Fiecare masă contează." },
  movement: { coach: "Azi, mișcarea face diferența. 20 de minute de mers.", bridge: "Fiecare pas te face mai puternic." },
  ans: { coach: "Azi, gestionează stresul. 5 minute de respirație conștientă.", bridge: "Calmul de azi e claritatea de mâine." },
  light: { coach: "Azi, expune-te la lumină naturală dimineața.", bridge: "Ritmul circadian e busola sănătății." },
  subjective: { coach: "Azi, fă un lucru care îți aduce bucurie.", bridge: "Sensul se construiește pas cu pas." },
  default: { coach: "Azi, fă o alegere care te apropie de obiectivul tău.", bridge: "Fiecare zi contează." },
};

function getWeakestDimension(scores: Record<string, number>): string {
  let weakest = "default";
  let lowest = 101;
  for (const [dim, score] of Object.entries(scores)) {
    if (score < lowest) {
      lowest = score;
      weakest = dim;
    }
  }
  return weakest;
}

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const cached = await prisma.dailyCoachCache.findUnique({
      where: { userId_date: { userId, date: getTodayKey() } },
    });

    if (cached) {
      return NextResponse.json({
        data: {
          coach: cached.coach,
          dimension: cached.dimension,
          leverageBridge: cached.leverageBridge ?? null,
          date: cached.date,
        },
      });
    }

    return NextResponse.json({ data: null });
  } catch (err) {
    console.error("[daily-coach] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth;

  try {
    const today = getTodayKey();

    const existing = await prisma.dailyCoachCache.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing) {
      if (existing.leverageBridge) {
        return NextResponse.json({
          data: {
            coach: existing.coach,
            dimension: existing.dimension,
            leverageBridge: existing.leverageBridge,
            date: existing.date,
          },
        });
      }
    }

    let chronoAge = 40;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { age: true } });
      if (user?.age) chronoAge = user.age;
    } catch {}

    const backendHeaders: Record<string, string> = { "Content-Type": "application/json", ...makeBackendHeaders() };

    let nutritionScore = 50;
    let sleepScore = 50;
    let movementScore = 50;
    let ansScore = 50;
    let lightScore = 50;

    try {
      const snapshotRes = await fetch(
        `${BACKEND_URL}/bio-age/current?user_id=${encodeURIComponent(userId)}&age=${chronoAge}`,
        { method: "GET", headers: backendHeaders }
      );
      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json();
        const snap = snapshotData?.data?.bio_age_snapshot ?? snapshotData?.bio_age_snapshot ?? snapshotData;
        if (snap) {
          nutritionScore = snap.nutritionScore ?? snap.nutrition_score ?? nutritionScore;
          sleepScore = snap.sleepScore ?? snap.sleep_score ?? sleepScore;
          movementScore = snap.movementScore ?? snap.movement_score ?? movementScore;
          ansScore = snap.ansScore ?? snap.ans_score ?? ansScore;
          lightScore = snap.lightScore ?? snap.light_score ?? lightScore;
        }
      }
    } catch {}

    const scores: Record<string, number> = {
      nutrition: nutritionScore,
      sleep: sleepScore,
      movement: movementScore,
      ans: ansScore,
      light: lightScore,
    };

    const weakest = getWeakestDimension(scores);
    const fallback = FALLBACK[weakest] ?? FALLBACK.default;

    const dimLabels: Record<string, string> = {
      nutrition: "alimentație",
      sleep: "odihnă",
      movement: "mișcare",
      ans: "stres",
      light: "lumină",
      subjective: "bunăstare",
    };

    const prompt = `Ești un coach de longevitate. Generează DOUĂ fraze scurte în română.

Dimensiunea cea mai slabă: ${weakest} (scor: ${scores[weakest]}/100)

RĂSPUNDE DOAR cu un JSON valid, fără alt text:
{"coach": "O propoziție scurtă, maxim 80 caractere, care începe cu 'Azi,' și sugerează o acțiune pe ${dimLabels[weakest]}", "bridge": "O propoziție scurtă, maxim 70 caractere, motivațională, despre ${dimLabels[weakest]}"}

Reguli:
- Ambele în română, calde, directe
- Fără ghilimele în jurul textului
- Fără limbaj punitiv
- Fără numere/calorii
- JSON valid, fără markdown`;

    const ollamaHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (OLLAMA_API_KEY) {
      ollamaHeaders["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    let coach = fallback.coach;
    let leverageBridge = fallback.bridge;

    try {
      const ollamaRes = await fetch(`${OLLAMA_CLOUD_URL}/api/chat`, {
        method: "POST",
        headers: ollamaHeaders,
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [{ role: "user", content: prompt }],
          stream: false,
          options: { temperature: 0.7, num_predict: 250 },
        }),
      });

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        const content = (ollamaData?.message?.content ?? "").trim();

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.coach) coach = parsed.coach.replace(/^["']|["']$/g, "").substring(0, 100);
            if (parsed.bridge) leverageBridge = parsed.bridge.replace(/^["']|["']$/g, "").substring(0, 80);
          } catch {}
        } else {
          const lines = content.split("\n").filter((l: string) => l.trim());
          if (lines.length >= 2) {
            coach = lines[0].replace(/^["']|["']$/g, "").substring(0, 100);
            leverageBridge = lines[1].replace(/^["']|["']$/g, "").substring(0, 80);
          } else if (lines.length === 1) {
            coach = lines[0].replace(/^["']|["']$/g, "").substring(0, 100);
          }
        }
      }
    } catch {}

    const cached = await prisma.dailyCoachCache.upsert({
      where: { userId_date: { userId, date: today } },
      update: { coach, dimension: weakest, leverageBridge },
      create: { userId, date: today, coach, dimension: weakest, leverageBridge },
    });

    return NextResponse.json({
      data: {
        coach: cached.coach,
        dimension: cached.dimension,
        leverageBridge: cached.leverageBridge ?? null,
        date: cached.date,
      },
    });
  } catch (err) {
    console.error("[daily-coach] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error", stack: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.stack : undefined) : undefined },
      { status: 500 }
    );
  }
}