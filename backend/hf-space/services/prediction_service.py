import json
import io
import os
import numpy as np
from PIL import Image

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from services.nutrition_service import get_nutrition, format_food_name

CLASSIFIER_MODEL_PATH = "models/nutritrack_B4_SUPREM.keras"
CLASS_NAMES_PATH = "models/class_names_270.json"

import tensorflow as tf

tf.config.set_visible_devices([], 'GPU')

classifier_model = tf.keras.models.load_model(CLASSIFIER_MODEL_PATH, compile=False)

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)


def predict_food(image_bytes: bytes, portion: str = "medium"):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    predictions = _classify_region(image)

    best = predictions[0]
    best["bbox"] = None
    best["yolo_confidence"] = None
    best["top_predictions"] = predictions
    best["all_regions"] = None

    return {
        "food_class": best["food_class"],
        "display_name": best["display_name"],
        "confidence": best["confidence"],
        "portion": portion,
        "nutrition": best["nutrition"],
        "bbox": None,
        "yolo_confidence": None,
        "top_predictions": predictions,
        "all_regions": None,
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