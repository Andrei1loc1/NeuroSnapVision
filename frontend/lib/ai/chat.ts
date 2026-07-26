/**
 * NeuroSnap AI — Chat Context Builder & API Client
 * Builds the system prompt with user data + relevant studies,
 * and handles streaming chat with Ollama Cloud.
 */

import { searchKnowledgeBase, formatStudiesForPrompt, getSuggestedQuestions } from "./knowledge-base";
import type { ChatMessage, ChatContext, ChatRequest, ChatStreamChunk, ToolCall } from "@/lib/types";
import { OLLAMA_CLOUD_URL, OLLAMA_MODEL, OLLAMA_CLOUD_API_KEY } from "@/lib/server/env";

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_bio_age",
      description: "Returnează vârsta biologică curentă și toate scorurile pe dimensiuni ale utilizatorului.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dimension_scores",
      description: "Returnează scorurile detaliate pe toate cele 7 dimensiuni (mișcare, nutriție, somn, SNA, lumină, subiectiv, hormeză).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_meals",
      description: "Returnează istoricul meselor din ultimele N zile.",
      parameters: {
        type: "object",
        properties: { days: { type: "number", description: "Numărul de zile (default 7)" } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_workouts",
      description: "Returnează istoricul antrenamentelor din ultimele N zile.",
      parameters: {
        type: "object",
        properties: { days: { type: "number", description: "Numărul de zile (default 7)" } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_compliance",
      description: "Returnează scorul de complianță și streak-ul curent.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_intervention",
      description: "Simulează impactul unei intervenții asupra vârstei biologice. Proiectează cât ar scădea bio-age dacă o dimensiune ar ajunge la un anumit scor.",
      parameters: {
        type: "object",
        properties: {
          dimension: { type: "string", description: "Dimensiunea: movement, nutrition, sleep, ans, light, subjective, hormesis" },
          targetScore: { type: "number", description: "Scorul țintă (0-100)" },
        },
        required: ["dimension", "targetScore"],
      },
    },
  },
];

export function buildSystemPrompt(context: ChatContext, userMessage: string, northStar?: string, values?: string[]): string {
  const relevantStudies = searchKnowledgeBase(userMessage, 5);
  const studiesText = formatStudiesForPrompt(relevantStudies);

  const northStarSection = northStar ? `\nNORTH STAR: ${northStar}` : "";
  const valuesSection = values && values.length > 0 ? `\nVALORI: ${values.join(", ")}` : "";

  return `Ești un logoterapeut în tradiția lui Viktor Frankl, integrat în NeuroSnap Vision — o aplicație care ajută oamenii să-și optimizeze sănătatea fără a-i transforma în sclavii datelor.

Principiile tale fundamentale:
1. Fiecare răspuns ancorează datele în SENS, nu în vinovăție. Utilizatorul nu e o colecție de macro-uri — e o ființă umană cu un scop.
2. Nu folosești niciodată limbaj punitiv ("ai greșit", "ar fi trebuit", "ești sub target"). Înlocuiești cu: "direcția e bună", "mâine e o nouă oportunitate", "corpul tău a avut nevoie de asta".
3. Când utilizatorul a avut o zi mai puțin optimă, nu subliniezi eșecul — îi arăți cum și ziua asta a contribuit la North Star-ul lui (odihna e și ea parte din sănătate).
4. Când utilizatorul revine după o absență, îl întâmpini cu blândețe: "Corpul tău a avut nevoie de o pauză. North Star-ul tău e tot acolo. Continuăm."
5. Fiecare recomandare e legată explicit de North Star-ul utilizatorului. Nu "mănâncă mai multe proteine" — ci "proteinele la micul dejun îți dau energia să fii prezent pentru copiii tăi toată ziua".
6. Răspunsurile sunt scurte, calde, personale. Maxim 3-4 propoziții. Nu dai lecții — oferi perspective.
7. Nu menționezi niciodată numărul de calorii, gramele de macro-nutrienți sau procentele decât dacă utilizatorul întreabă explicit. Vorbești în termeni calitativi: "echilibrat", "hrănitor", "aliniat cu obiectivele tale".
${northStarSection}${valuesSection}

Utilizator: ${context.displayName}

DATELE USERULUI (actualizate):
- Vârstă: ${context.chronologicalAge} ani reali, ${context.biologicalAge} Vârstă Stilului de Viață (delta: ${(context.biologicalAge - context.chronologicalAge).toFixed(1)} ani)
- Trendul Vârstei: ${context.paceLabel === 'decelerating' ? 'Îmbunătățire' : context.paceLabel === 'normal' ? 'Stabil' : 'Declin'} (${context.paceOfAging.toFixed(2)}x)
- Dimensiuni: Mișcare ${context.movementScore}/100, Alimentație ${context.nutritionScore}/100, Odihnă ${context.sleepScore}/100, Stare de Bine ${context.subjectiveScore}/100, Echilibru ${context.ansScore}/100, Ritm Circadian ${context.lightScore}/100, Reziliență ${context.hormesisScore}/100
- VO2 max estimat: ${context.vo2max} ml/kg/min (${context.vo2maxPercentile})
- Inflamaging: ${context.inflammagingScore}/100
- Complianță: ${context.complianceScore}% — streak ${context.streak} zile
- Leverage point: ${context.leverageDimension} — ${context.leverageAction} (impact −${context.projectedImpact.toFixed(2)} ani/an)
- Mese procesate săptămâna asta: ${context.upfCount}
- Diversitate alimentară: ${context.uniqueFoods}/30 alimente unice
- Antrenamente săptămâna asta: ${context.workoutCount}
- Stres mediu: ${context.avgStress}/5
- Ore dormite: ${context.sleepHours}h
- Protein timing: ${context.proteinTimingScore}/100

STUDII RELEVANTE pentru întrebare:
${studiesText || "(niciun studiu specific găsit — folosește cunoștințele generale de longevitate)"}

REGULI:
- Răspunzi ÎN ROMÂNĂ, prietenos și direct
- Folosești DOAR datele userului de mai sus + studiile din context
- Citezi studiile când faci afirmații ("Conform studiului [id]...")
- Nu dai sfaturi medicale — doar informații bazate pe cercetare
- Dacă nu ai suficiente date pentru o recomandare, spui "Nu am suficiente date pentru a răspunde precis la asta"
- Personalizezi fiecare răspuns pe baza scorurilor userului și a North Star-ului
- Maxim 3-4 propoziții per răspuns, fii concis și cald
- Poți folosi tool-urile disponibile pentru a obține date suplimentare dacă e necesar`;
}

export function buildMessages(context: ChatContext, history: ChatMessage[], userMessage: string, northStar?: string, values?: string[]) {
  const systemPrompt = buildSystemPrompt(context, userMessage, northStar, values);

  const messages: Array<{ role: string; content: string; tool_calls?: unknown[] }> = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: userMessage });

  return messages;
}

export async function streamChat(
  request: ChatRequest,
  onChunk: (chunk: ChatStreamChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const messages = buildMessages(request.context, request.history, request.message);

  const apiKey = OLLAMA_CLOUD_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    messages,
    stream: true,
    tools: TOOL_DEFINITIONS,
  };

  try {
    const response = await fetch(`${OLLAMA_CLOUD_URL}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      onChunk({ type: "error", error: `Ollama API error: ${response.status} — ${errorText}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ type: "error", error: "No response body from Ollama" });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

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
            onChunk({ type: "text", content: parsed.message.content });
          }

          if (parsed.message?.tool_calls) {
            for (const tc of parsed.message.tool_calls) {
              onChunk({
                type: "tool_call",
                toolCall: {
                  name: tc.function?.name || "unknown",
                  arguments: tc.function?.arguments || {},
                },
              });
            }
          }
        } catch {
          // skip unparseable lines
        }
      }
    }

    onChunk({ type: "done" });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      onChunk({ type: "done" });
      return;
    }
    onChunk({ type: "error", error: err instanceof Error ? err.message : "Unknown error" });
  }
}

export function executeToolCall(
  toolCall: ToolCall,
  context: ChatContext
): string {
  switch (toolCall.name) {
    case "get_bio_age":
      return JSON.stringify({
        biologicalAge: context.biologicalAge,
        chronologicalAge: context.chronologicalAge,
        paceOfAging: context.paceOfAging,
        paceLabel: context.paceLabel,
        scores: {
          movement: context.movementScore,
          nutrition: context.nutritionScore,
          sleep: context.sleepScore,
          ans: context.ansScore,
          light: context.lightScore,
          subjective: context.subjectiveScore,
          hormesis: context.hormesisScore,
        },
        vo2max: context.vo2max,
        inflammaging: context.inflammagingScore,
      });

    case "get_dimension_scores":
      return JSON.stringify({
        movement: { score: context.movementScore, vo2max: context.vo2max, workouts: context.workoutCount },
        nutrition: { score: context.nutritionScore, upf: context.upfCount, diversity: context.uniqueFoods, proteinTiming: context.proteinTimingScore },
        sleep: { score: context.sleepScore, hours: context.sleepHours },
        ans: { score: context.ansScore, avgStress: context.avgStress },
        light: { score: context.lightScore },
        subjective: { score: context.subjectiveScore },
        hormesis: { score: context.hormesisScore },
      });

    case "get_recent_meals":
      return JSON.stringify({
        message: "Istoricul meselor e disponibil în aplicație la tab-ul Journal.",
        upfCount: context.upfCount,
        uniqueFoods: context.uniqueFoods,
        proteinTimingScore: context.proteinTimingScore,
      });

    case "get_recent_workouts":
      return JSON.stringify({
        workoutCount: context.workoutCount,
        vo2max: context.vo2max,
        movementScore: context.movementScore,
        message: "Istoricul antrenamentelor e disponibil în aplicație la tab-ul Journal.",
      });

    case "get_compliance":
      return JSON.stringify({
        complianceScore: context.complianceScore,
        streak: context.streak,
        message: "Complianța se bazează pe check-in-urile zilnice (dimineața și seara).",
      });

    case "simulate_intervention": {
      const args = toolCall.arguments as { dimension?: string; targetScore?: number };
      const dim = args.dimension || "sleep";
      const target = args.targetScore || 80;
      const currentScore = getDimensionScore(context, dim);
      const improvement = target - currentScore;
      const impactPerPoint = 0.015;
      const projectedReduction = improvement * impactPerPoint;
      const newBioAge = context.biologicalAge - projectedReduction;

      return JSON.stringify({
        dimension: dim,
        currentScore,
        targetScore: target,
        improvement,
        projectedBioAgeReduction: projectedReduction.toFixed(2),
        newBioAge: newBioAge.toFixed(1),
        message: `Dacă îți crești scorul de ${dim} de la ${currentScore} la ${target}, vârsta biologică ar scădea cu aproximativ ${projectedReduction.toFixed(2)} ani, ajungând la ${newBioAge.toFixed(1)} ani.`,
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolCall.name}` });
  }
}

function getDimensionScore(context: ChatContext, dimension: string): number {
  const map: Record<string, number> = {
    movement: context.movementScore,
    nutrition: context.nutritionScore,
    sleep: context.sleepScore,
    ans: context.ansScore,
    light: context.lightScore,
    subjective: context.subjectiveScore,
    hormesis: context.hormesisScore,
  };
  return map[dimension] ?? 50;
}

export { getSuggestedQuestions };
