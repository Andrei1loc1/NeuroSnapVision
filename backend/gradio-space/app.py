import json
import os
import numpy as np
from PIL import Image
import gradio as gr

os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf

MODEL_PATH = "nutritrack_B4_SUPREM.keras"
CLASS_NAMES_PATH = "class_names_270.json"
NUTRITION_PATH = "nutrition_data.json"

classifier_model = tf.keras.models.load_model(MODEL_PATH, compile=False)

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

with open(NUTRITION_PATH, "r") as f:
    nutrition_data = json.load(f)


def format_food_name(name: str) -> str:
    return name.replace("_", " ").title()


def get_nutrition(food_class: str, portion: str = "medium"):
    default = {"calories": 200, "protein": 10, "carbs": 25, "fats": 8}
    nutrition = nutrition_data.get(food_class, default)
    multiplier = {"small": 0.7, "medium": 1.0, "large": 1.3}.get(portion, 1.0)
    return {k: round(v * multiplier, 2) for k, v in nutrition.items()}


def predict_food(image: Image.Image, portion: str = "medium"):
    if image is None:
        return json.dumps({"error": "No image provided"})

    img = image.convert("RGB").resize((380, 380))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)

    predictions = classifier_model.predict(img_array, verbose=0)[0]
    top_indices = predictions.argsort()[-3:][::-1]

    results = []
    for idx in top_indices:
        food_class = class_names[int(idx)].strip()
        confidence = float(predictions[idx]) * 100
        nutrition = get_nutrition(food_class, portion)
        results.append({
            "food_class": food_class,
            "display_name": format_food_name(food_class),
            "confidence": round(confidence, 2),
            "nutrition": nutrition,
        })

    best = results[0]
    return json.dumps({
        "food_class": best["food_class"],
        "display_name": best["display_name"],
        "confidence": best["confidence"],
        "portion": portion,
        "nutrition": best["nutrition"],
        "top_predictions": results,
    })


demo = gr.Interface(
    fn=predict_food,
    inputs=[
        gr.Image(type="pil", label="Imagine cu mancare"),
        gr.Dropdown(choices=["small", "medium", "large"], value="medium", label="Portie"),
    ],
    outputs=gr.Markdown(label="Rezultat"),
    title="NeuroSnap Food Predict",
    description="Fă o poză mâncării și primești instant: numele, caloriile și macronutrienții.",
)

demo.launch()
