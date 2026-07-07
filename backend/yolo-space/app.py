import json
import io
import base64
import numpy as np
from PIL import Image
import gradio as gr

from ultralytics import YOLO

MODEL_PATH = "yolo_foodseg_best.pt"
yolo_model = YOLO(MODEL_PATH, task="segment")


def detect_food(image: Image.Image):
    if image is None:
        return json.dumps({"error": "No image provided"})

    img = image.convert("RGB")
    results = yolo_model(img, verbose=False, device="cpu")
    result = results[0]

    regions = []
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
        sorted_indices = np.argsort(-areas)
        top_indices = sorted_indices[:3]

        for idx in top_indices:
            x1, y1, x2, y2 = boxes[idx]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            w, h = x2 - x1, y2 - y1
            if w < 10 or h < 10:
                continue

            cropped = img.crop((x1, y1, x2, y2))
            buf = io.BytesIO()
            cropped.save(buf, format="JPEG", quality=85)
            crop_b64 = base64.b64encode(buf.getvalue()).decode()

            regions.append({
                "bbox": {"x": x1, "y": y1, "width": w, "height": h},
                "confidence": round(float(confidences[idx]), 4),
                "crop_base64": crop_b64,
            })

    if len(regions) == 0:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        full_b64 = base64.b64encode(buf.getvalue()).decode()
        regions.append({
            "bbox": {"x": 0, "y": 0, "width": img.width, "height": img.height},
            "confidence": 0,
            "crop_base64": full_b64,
        })

    return json.dumps({
        "detections": len(regions),
        "regions": regions,
    })


demo = gr.Interface(
    fn=detect_food,
    inputs=gr.Image(type="pil", label="Imagine cu mancare"),
    outputs=gr.Markdown(label="Detectii"),
    title="NeuroSnap Food Detect",
    description="YOLO segmentation — gaseste si decupeaza mancarea din imagine.",
)

demo.launch()
