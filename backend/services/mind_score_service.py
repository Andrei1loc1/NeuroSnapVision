import json
import joblib
import pandas as pd

MODEL_PATH = "models/mind_pattern_model.pkl"
CONFIG_PATH = "models/mind_score_config.json"

mind_model = joblib.load(MODEL_PATH)

with open(CONFIG_PATH, "r") as f:
    mind_config = json.load(f)

positive_categories = mind_config["positive_categories"]
negative_categories = mind_config["negative_categories"]
all_categories = mind_config["all_categories"]
mind_mapping = mind_config["mind_mapping"]


def calculate_mind_score_from_counts(counts: dict):
    positive_targets = {
        "leafy_greens": 6,
        "other_vegetables": 7,
        "berries": 2,
        "nuts": 5,
        "whole_grains": 7,
        "fish": 1,
        "poultry": 2,
        "beans": 3,
        "olive_oil": 4,
    }

    negative_limits = {
        "red_meat": 3,
        "butter_margarine": 2,
        "cheese": 2,
        "pastries_sweets": 3,
        "fried_fast_food": 2,
    }

    positive_score = 0
    negative_penalty = 0

    for category, target in positive_targets.items():
        positive_score += min(counts.get(category, 0) / target, 1)

    for category, limit in negative_limits.items():
        negative_penalty += min(counts.get(category, 0) / limit, 1)

    positive_score = (positive_score / len(positive_targets)) * 100
    negative_score = 100 - ((negative_penalty / len(negative_limits)) * 100)

    mind_score = round((positive_score * 0.65) + (negative_score * 0.35), 2)

    return {
        "mind_score": max(0, min(100, mind_score)),
        "positive_score": round(positive_score, 2),
        "negative_score": round(negative_score, 2),
    }


def meals_to_mind_counts(meals: list):
    counts = {category: 0 for category in all_categories}

    for meal in meals:
        food_class = meal.get("food_class")
        category = mind_mapping.get(food_class)

        if category in counts:
            counts[category] += 1

    return counts


def generate_mind_recommendation(counts: dict):
    if counts.get("fried_fast_food", 0) >= 2:
        return "Reduce fried and fast-food meals this week and replace one meal with vegetables or fish."

    if counts.get("pastries_sweets", 0) >= 3:
        return "Reduce sweets and pastries. Try adding berries, nuts, or yogurt as healthier alternatives."

    if counts.get("red_meat", 0) >= 3:
        return "Limit red meat and choose fish, poultry, or beans more often."

    if counts.get("fish", 0) < 1:
        return "Add at least one fish-based meal this week to improve your brain nutrition pattern."

    if counts.get("other_vegetables", 0) < 4:
        return "Add more vegetables or leafy greens throughout the week."

    if counts.get("nuts", 0) < 2:
        return "Add nuts as a small snack a few times this week."

    return "Your brain nutrition pattern looks balanced. Keep the current habits."


def calculate_mind_score(meals: list):
    counts = meals_to_mind_counts(meals)
    score_data = calculate_mind_score_from_counts(counts)

    features = pd.DataFrame([{**counts, "mind_score": score_data["mind_score"]}])
    pattern = mind_model.predict(features)[0]

    return {
        "brain_nutrition_score": score_data["mind_score"],
        "positive_score": score_data["positive_score"],
        "negative_score": score_data["negative_score"],
        "pattern": pattern,
        "category_counts": counts,
        "recommendation": generate_mind_recommendation(counts),
    }