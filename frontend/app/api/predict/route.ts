import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";

const YOLO_URL = process.env.YOLO_SPACE_URL || "https://chindrisandrei2005-neurosnap-food-detect.hf.space";
const CLASSIFIER_URL = process.env.CLASSIFIER_SPACE_URL || "https://chindrisandrei2005-neurosnap-food-predict.hf.space";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function callGradio(spaceUrl: string, fnName: string, filePath: string, extraData?: string) {
  const body: { data: Array<Record<string, unknown> | string> } = {
    data: [{ path: filePath, meta: { _type: "gradio.FileData" } }],
  };
  if (extraData) body.data.push(extraData);

  const callRes = await fetch(`${spaceUrl}/gradio_api/call/${fnName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!callRes.ok) throw new Error(`Gradio call failed: ${callRes.status}`);
  const { event_id } = await callRes.json();

  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${spaceUrl}/gradio_api/call/${fnName}/${event_id}`, {
      signal: AbortSignal.timeout(30000),
    }).catch(() => null);
    if (!pollRes) continue;

    const text = await pollRes.text();
    if (text.includes("event: complete")) {
      const match = text.match(/data: (.+)/);
      if (match) return match[1];
    }
    if (text.includes("event: error")) throw new Error(`Gradio error: ${text}`);
  }
  throw new Error("Gradio timeout");
}

async function predictViaBackend(file: File, portion: string) {
  const arrayBuffer = await file.arrayBuffer();

  const res = await fetch(`${BACKEND_URL}/scan?portion=${encodeURIComponent(portion)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/jpeg", ...backendHeaders() },
    body: arrayBuffer,
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend prediction failed: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const portion = searchParams.get("portion") || "medium";

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fișier prea mare (max 10MB)" }, { status: 413 });
    }

    // Try backend first (always warm)
    try {
      const backendResult = await predictViaBackend(file, portion);
      if (backendResult && !backendResult.error) {
        const item = Array.isArray(backendResult) ? backendResult[0] : backendResult;
        if (item.food_class || item.display_name) {
          return NextResponse.json({
            data: {
              food_class: item.food_class || item.display_name || "unknown",
              display_name: item.display_name || item.food_class || "Unknown",
              confidence: item.confidence || 0.5,
              portion,
              nutrition: item.nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
              bbox: item.bbox || null,
              yolo_confidence: item.yolo_confidence || item.confidence || 0.5,
              top_predictions: item.top_predictions || [],
              all_regions: item.all_regions || [],
            },
          });
        }
      }
    } catch (e) {
      console.error("[predict] Backend failed, trying Gradio fallback:", e instanceof Error ? e.message : e);
    }

    // Fallback: try Gradio Spaces (may be cold)
    const yoloWake = await fetch(`${YOLO_URL}/`, { signal: AbortSignal.timeout(15000) }).catch(() => null);
    const classWake = await fetch(`${CLASSIFIER_URL}/`, { signal: AbortSignal.timeout(15000) }).catch(() => null);
    if (!yoloWake && !classWake) {
      return NextResponse.json(
        { error: "Modelele de AI sunt în repaus. Reîncearcă în 1-2 minute." },
        { status: 503 }
      );
    }

    // Step 1: Upload to YOLO Space and detect food regions
    const yoloUploadForm = new FormData();
    yoloUploadForm.append("files", file);
    const yoloUploadRes = await fetch(`${YOLO_URL}/gradio_api/upload`, {
      method: "POST",
      body: yoloUploadForm,
      signal: AbortSignal.timeout(30000),
    });
    if (!yoloUploadRes.ok) throw new Error("YOLO upload failed");
    const [yoloFilePath] = await yoloUploadRes.json();

    const yoloResultRaw = await callGradio(YOLO_URL, "detect_food", yoloFilePath);
    const yoloParsed = JSON.parse(yoloResultRaw);
    const yoloData = Array.isArray(yoloParsed) ? JSON.parse(yoloParsed[0]) : yoloParsed;

    if (!yoloData.regions || yoloData.regions.length === 0) {
      return NextResponse.json({ error: "No food detected" }, { status: 404 });
    }

    // Step 2: For each detected region, classify with EfficientNetB4
    const allResults = [];
    for (const region of yoloData.regions.slice(0, 3)) {
      try {
        const cropBytes = Buffer.from(region.crop_base64, "base64");
        const cropFile = new File([cropBytes], "crop.jpg", { type: "image/jpeg" });

        const classifyUploadForm = new FormData();
        classifyUploadForm.append("files", cropFile);
        const classifyUploadRes = await fetch(`${CLASSIFIER_URL}/gradio_api/upload`, {
          method: "POST",
          body: classifyUploadForm,
          signal: AbortSignal.timeout(30000),
        });
        if (!classifyUploadRes.ok) continue;
        const [classifyFilePath] = await classifyUploadRes.json();

        const classifyResultRaw = await callGradio(CLASSIFIER_URL, "predict_food", classifyFilePath, portion);
        const classifyParsed = JSON.parse(classifyResultRaw);
        const classifyData = Array.isArray(classifyParsed) ? JSON.parse(classifyParsed[0]) : classifyParsed;

        allResults.push({
          ...classifyData,
          bbox: region.bbox,
          yolo_confidence: region.confidence,
          crop_image: `data:image/jpeg;base64,${region.crop_base64}`,
        });
      } catch {
        // Skip failed classifications
      }
    }

    if (allResults.length === 0) {
      return NextResponse.json({ error: "Classification failed" }, { status: 500 });
    }

    const best = allResults[0];
    return NextResponse.json({
      data: {
        food_class: best.food_class,
        display_name: best.display_name,
        confidence: best.confidence,
        portion,
        nutrition: best.nutrition,
        bbox: best.bbox,
        yolo_confidence: best.yolo_confidence,
        top_predictions: best.top_predictions,
        all_regions: allResults,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}