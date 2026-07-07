import json
from agents.coordinator import get_best_action, coordinate_recommendation

Q_TABLES_PATH = "models/multi_agent_q_tables.json"

with open(Q_TABLES_PATH, "r") as f:
    q_tables = json.load(f)

protein_q = q_tables["protein_q"]
calorie_q = q_tables["calorie_q"]
timing_q = q_tables["timing_q"]
fat_q = q_tables["fat_q"]
consistency_q = q_tables["consistency_q"]


def get_protein_state(protein, target_protein):
    if protein < target_protein * 0.5:
        return "very_low_protein"
    if protein < target_protein * 0.8:
        return "low_protein"
    return "adequate_protein"


def get_calorie_state(calories, target_calories):
    if calories < target_calories * 0.75:
        return "too_low_calories"
    if calories > target_calories * 1.15:
        return "too_high_calories"
    return "normal_calories"


def get_timing_state(late_meals_count):
    if late_meals_count >= 3:
        return "late_meals"
    return "normal_timing"


def get_fat_state(fats, target_fats):
    if fats < target_fats * 0.6:
        return "low_fats"
    if fats > target_fats * 1.2:
        return "high_fats"
    return "normal_fats"


def get_consistency_state(days_on_target):
    if days_on_target <= 2:
        return "inconsistent"
    if days_on_target <= 5:
        return "moderately_consistent"
    return "consistent"


def get_multi_agent_recommendation(data: dict):
    protein_state = get_protein_state(data["protein"], data["target_protein"])
    calorie_state = get_calorie_state(data["calories"], data["target_calories"])
    timing_state = get_timing_state(data["late_meals_count"])
    fat_state = get_fat_state(data["fats"], data["target_fats"])
    consistency_state = get_consistency_state(data["days_on_target"])

    agent_outputs = {
        "protein_agent": {
            "state": protein_state,
            "action": get_best_action(protein_q, protein_state),
            "priority": 5 if protein_state == "very_low_protein" else 3 if protein_state == "low_protein" else 1
        },
        "calorie_agent": {
            "state": calorie_state,
            "action": get_best_action(calorie_q, calorie_state),
            "priority": 5 if calorie_state in ["too_high_calories", "too_low_calories"] else 1
        },
        "timing_agent": {
            "state": timing_state,
            "action": get_best_action(timing_q, timing_state),
            "priority": 4 if timing_state == "late_meals" else 1
        },
        "fat_agent": {
            "state": fat_state,
            "action": get_best_action(fat_q, fat_state),
            "priority": 4 if fat_state == "high_fats" else 2 if fat_state == "low_fats" else 1
        },
        "consistency_agent": {
            "state": consistency_state,
            "action": get_best_action(consistency_q, consistency_state),
            "priority": 4 if consistency_state == "inconsistent" else 2 if consistency_state == "moderately_consistent" else 1
        }
    }

    selected_agent, selected_output = coordinate_recommendation(agent_outputs)
    selected_action = selected_output["action"]

    messages = {
        "increase_protein": "Increase your protein intake. Add eggs, chicken, Greek yogurt, tuna, or cottage cheese.",
        "suggest_lean_protein": "Add a lean protein source to one of your next meals.",
        "maintain": "Your nutrition is balanced. Keep the current habits.",
        "increase_calories": "Your calorie intake is too low. Add a balanced meal or healthy snack.",
        "reduce_calories": "Your calorie intake is too high. Choose a lighter next meal.",
        "eat_earlier": "You often eat late. Try moving your last meal 1–2 hours earlier.",
        "maintain_timing": "Your meal timing looks good. Keep the current routine.",
        "increase_healthy_fats": "Add healthy fats such as avocado, nuts, olive oil, or salmon.",
        "maintain_fats": "Your fat intake is balanced.",
        "reduce_fats": "Reduce high-fat foods and choose leaner meals.",
        "improve_consistency": "Your nutrition is inconsistent. Try keeping more days close to your targets.",
        "stabilize_meal_routine": "Your routine is improving. Keep similar meal timing and nutrition targets.",
        "maintain_consistency": "Your weekly consistency is strong. Keep it up."
    }

    return {
        "selected_agent": selected_agent,
        "state": selected_output["state"],
        "action": selected_action,
        "recommendation": messages[selected_action],
        "all_agents": agent_outputs
    }