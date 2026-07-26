/**
 * Client pentru scoruri AI și recomandări — proxy prin rutele interne.
 */
import { apiFetch } from "./client";
import type {
  HealthyScoreInput,
  HealthyScoreResult,
  RecommendationResult,
  MindScoreInput,
  MindScoreResult,
} from "@/lib/types";

export type {
  HealthyScoreInput,
  HealthyScoreResult,
  RecommendationResult,
  MindScoreInput,
  MindScoreResult,
};

export async function fetchHealthyScore(
  input: HealthyScoreInput
): Promise<HealthyScoreResult> {
  const data = await apiFetch<{ data: HealthyScoreResult }>("/api/healthy-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function fetchRecommendation(
  input: HealthyScoreInput
): Promise<RecommendationResult> {
  const data = await apiFetch<{ data: RecommendationResult }>("/api/recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function fetchMindScore(
  meals: { food_class: string }[]
): Promise<MindScoreResult> {
  const data = await apiFetch<{ data: MindScoreResult }>("/api/mind-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meals }),
  });
  return data.data;
}
