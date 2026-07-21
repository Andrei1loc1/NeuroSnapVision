import json
import io
import os
import numpy as np
from PIL import Image

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from services.nutrition_service import get_nutrition, format_food_name

YOLO_MODEL_PATH = "models/yolo_foodseg_best.pt"
CLASSIFIER_MODEL_PATH = "models/nutritrack_B4_SUPREM.keras"
CLASS_NAMES_PATH = "models/class_names_270.json"

from ultralytics import YOLO
import tensorflow as tf

tf.config.set_visible_devices([], 'GPU')

yolo_model = YOLO(YOLO_MODEL_PATH)
classifier_model = tf.keras.models.load_model(CLASSIFIER_MODEL_PATH, compile=False)

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)


def predict_food(image_bytes: bytes, portion: str = "medium"):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    yolo_results = yolo_model(image, verbose=False)
    result = yolo_results[0]

    regions = []
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        sorted_indices = np.argsort(-boxes[:, 2] * boxes[:, 3])
        top_indices = sorted_indices[:3]

        for idx in top_indices:
            x1, y1, x2, y2 = boxes[idx]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            w, h = x2 - x1, y2 - y1
            if w < 10 or h < 10:
                continue

            cropped = image.crop((x1, y1, x2, y2))
            predictions = _classify_region(cropped)

            top_pred = predictions[0]
            top_pred["bbox"] = {"x": x1, "y": y1, "width": w, "height": h}
            top_pred["yolo_confidence"] = float(confidences[idx])
            top_pred["top_predictions"] = predictions

            regions.append(top_pred)

    if len(regions) == 0:
        predictions = _classify_region(image)
        best = predictions[0]
        best["bbox"] = None
        best["yolo_confidence"] = None
        best["top_predictions"] = predictions
        regions.append(best)

    best_region = regions[0]

    return {
        "food_class": best_region["food_class"],
        "display_name": best_region["display_name"],
        "confidence": best_region["confidence"],
        "portion": portion,
        "nutrition": best_region["nutrition"],
        "bbox": best_region.get("bbox"),
        "yolo_confidence": best_region.get("yolo_confidence"),
        "top_predictions": best_region["top_predictions"],
        "all_regions": regions if len(regions) > 1 else None,
    }


def _classify_region(image: Image.Image):
    img = image.resize((380, 380))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)

    predictions = classifier_model.predict(img_array, verbose=0)[0]
    top_indices = predictions.argsort()[-3:][::-1]

    result = []
    for index in top_indices:
        food_class = class_names[int(index)].strip()
        confidence = float(predictions[index]) * 100

        result.append({
            "food_class": food_class,
            "display_name": format_food_name(food_class),
            "confidence": round(confidence, 2),
            "nutrition": get_nutrition(food_class, portion="medium"),
        })

    return result