/**
 * NeuroSnap AI Chat — Next.js API Route (optimized)
 * Proxies chat requests to Ollama Cloud with streaming.
 * Compact prompt, limited history, capped output.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { searchKnowledgeBase } from "@/lib/ai/knowledge-base";
import type { ChatContext, ChatMessage } from "@/lib/types";
import { OLLAMA_CLOUD_URL, OLLAMA_MODEL, OLLAMA_CLOUD_API_KEY as OLLAMA_API_KEY } from "@/lib/server/env";

function compactContext(ctx: ChatContext): string {
  const delta = (ctx.biologicalAge - ctx.chronologicalAge).toFixed(1);
  const deltaStr = delta.startsWith("-") ? delta : `+${delta}`;
  const pace = ctx.paceLabel === "decelerating" ? "Imbunatatire" : ctx.paceLabel === "normal" ? "Stabil" : "Declin";
  return [
    `${ctx.displayName}, ${ctx.chronologicalAge} ani, ${ctx.biologicalAge} VS (${deltaStr})`,
    `${pace} ${ctx.paceOfAging.toFixed(2)}x`,
    `Scoruri: Misc ${ctx.movementScore} Alim ${ctx.nutritionScore} Odihna ${ctx.sleepScore} ANS ${ctx.ansScore} Circ ${ctx.lightScore} Stare ${ctx.subjectiveScore} Horm ${ctx.hormesisScore}`,
    `VO2: ${ctx.vo2max} (${ctx.vo2maxPercentile}) Inflam: ${ctx.inflammagingScore}`,
    `Compl: ${ctx.complianceScore}% Streak: ${ctx.streak}z`,
    `Leverage: ${ctx.leverageDimension} - ${ctx.leverageAction} (-${ctx.projectedImpact.toFixed(2)} ani/an)`,
    `Mese tarzii: ${ctx.upfCount} Divers: ${ctx.uniqueFoods}/30 ProtTiming: ${ctx.proteinTimingScore}`,
    `Antren: ${ctx.workoutCount} Stres: ${ctx.avgStress}/5 Somn: ${ctx.sleepHours}h`,
  ].join(" | ");
}

export async function POST(request: NextRequest) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { message, history = [], context, northStar, values } = body as {
      message: string;
      history: ChatMessage[];
      context: ChatContext;
      northStar?: string;
      values?: string[];
    };

    if (!message || !context) {
      return new Response(JSON.stringify({ error: "Missing message or context" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const studies = searchKnowledgeBase(message, 2);
    const studiesText = studies.length > 0
      ? studies.map(s => `${s.finding} (${s.citation})`).join(". ")
      : "";

    const systemLines = [
      "Ești un coach de longevitate în NeuroSnap Vision. Răspunzi în română, cald, scurt (3-4 propoziții).",
      "",
      "REGULI:",
      "- Ancorează fiecare răspuns în North Star-ul utilizatorului",
      "- Fără limbaj punitiv. Fără vinovăție. Blând și orientat spre sens.",
      "- Nu menționa calorii/grame decât dacă utilizatorul întreabă explicit",
      "- Citează studiile natural în text dacă sunt relevante",
      "- Dacă nu ai date suficiente, spui sincer",
      "",
      ...(northStar ? [`NORTH STAR: ${northStar}`] : []),
      ...(values && values.length > 0 ? [`VALORI: ${values.join(", ")}`] : []),
      "",
      `DATE: ${compactContext(context)}`,
      studiesText ? `STUDII: ${studiesText}` : "",
    ];

    const systemPrompt = systemLines.filter(Boolean).join("\n");

    const recentHistory = history.slice(-4);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: "user", content: message });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    const ollamaBody: Record<string, unknown> = {
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: {
        num_predict: 500,
        temperature: 0.4,
      },
      keep_alive: "5m",
    };

    const ollamaResponse = await fetch(`${OLLAMA_CLOUD_URL}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(ollamaBody),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return new Response(
        JSON.stringify({ error: `Ollama API error: ${ollamaResponse.status} — ${errorText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = ollamaResponse.body?.getReader();
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "No response body" })}\n\n`));
            controller.close();
            return;
          }

          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: parsed.message.content })}\n\n`)
                  );
                }
              } catch {
                // skip
              }
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: err instanceof Error ? err.message : "Stream error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
