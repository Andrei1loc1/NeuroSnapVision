/**
 * Client pentru predicția AI — comunică cu rutele interne /api/*.
 */
import { apiFetch } from "@/lib/api/client";
import type {
  PredictionResult,
  SavedScan,
  UploadedScanImage,
} from "@/lib/types";

export type { PredictionResult, SavedScan, UploadedScanImage };

export async function predictMeal(
  file: File,
  portion: string,
): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiFetch<{ data: PredictionResult }>(`/api/predict?portion=${encodeURIComponent(portion)}`, {
    method: "POST",
    body: formData,
    // omit Content-Type so browser sets multipart boundary
  });

  return data.data;
}

export async function savePredictionScan(
  prediction: PredictionResult,
  image?: UploadedScanImage,
): Promise<SavedScan> {
  const data = await apiFetch<{ data: SavedScan }>("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      predictedLabel: prediction.food_class,
      confidence: prediction.confidence,
      portion: prediction.portion,
      nutrition: prediction.nutrition,
      image,
      rawPrediction: prediction,
    }),
  });

  return data.data;
}

export async function uploadScanImage(dataUrl: string): Promise<UploadedScanImage> {
  const data = await apiFetch<{ data: UploadedScanImage }>("/api/uploads/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });

  return data.data;
}

export async function addScanToJournal(scanId: string, portionSize?: string) {
  const data = await apiFetch<{ data: unknown }>(`/api/scans/${scanId}/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portionSize: portionSize || "medium" }),
  });

  return data.data;
}

export async function saveMultiItemMeal(
  items: Array<{
    name: string;
    food_class: string;
    nutrition: { calories: number; protein: number; carbs: number; fats: number };
  }>,
  portionSize: string,
  mealTitle?: string,
  imageUrl?: string,
): Promise<unknown> {
  const PORTION_MULTIPLIERS: Record<string, number> = {
    small: 0.7,
    medium: 1.0,
    large: 1.3,
  };
  const multiplier = PORTION_MULTIPLIERS[portionSize] ?? 1.0;

  const mealItems = items.map((item) => ({
    name: item.name,
    quantity: 1,
    portionSize: portionSize.toUpperCase(),
    portionLabel: portionSize,
    calories: Math.round(item.nutrition.calories * multiplier * 100) / 100,
    proteinGrams: Math.round(item.nutrition.protein * multiplier * 100) / 100,
    carbsGrams: Math.round(item.nutrition.carbs * multiplier * 100) / 100,
    fatGrams: Math.round(item.nutrition.fats * multiplier * 100) / 100,
  }));

  const title = mealTitle || (items.length === 1 ? items[0].name : `${items.length} alimente`);

  const body: Record<string, unknown> = {
    mealType: "SNACK",
    title,
    items: mealItems,
  };
  if (imageUrl) body.imageUrl = imageUrl;

  const data = await apiFetch<{ data: unknown }>("/api/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return data.data;
}
