from datetime import date
from typing import Optional

from services.bio_age_service import compute_bio_age, WEIGHTS


LEVERAGE_RECOMMENDATIONS = {
    "nutrition": "Improve your nutrition: add 1-2 servings of leafy greens daily and ensure protein at every meal. Focus on MIND-diet foods (berries, nuts, fish, olive oil).",
    "sleep": "Optimize sleep: establish a consistent bedtime, reduce blue light 2h before bed, and aim for 7-8h of quality sleep. Morning sunlight exposure helps anchor your circadian rhythm.",
    "ans": "Strengthen autonomic balance: practice 5-min breathwork (4-7-8 or box breathing) daily, reduce stimulant intake, and prioritize morning recovery routines.",
    "movement": "Boost movement quality: add 2 resistance sessions per week, include 150min of Zone 2 cardio, and stretch or do mobility work 3x per week.",
    "light": "Align your circadian rhythm: eat within a 10-12h window, get morning sunlight within 30min of waking, and avoid late-night eating 2h before bed.",
    "subjective": "Enhance subjective wellbeing: practice daily gratitude, prioritize social connection, and schedule 15min of mindful reflection each evening.",
}


def get_daily_leverage_point(
    user_id: str,
    target_date: date,
    chronological_age: int,
    meals: list[dict],
    protocols: list[dict],
    workouts: list[dict],
    sleep_time: Optional[str] = None,
    target_nutrition: Optional[dict] = None,
) -> dict:
    snapshot = compute_bio_age(
        user_id=user_id,
        target_date=target_date,
        chronological_age=chronological_age,
        meals=meals,
        protocols=protocols,
        workouts=workouts,
        sleep_time=sleep_time,
        target_nutrition=target_nutrition,
    )

    leverage = snapshot.get("leverage_point", {})
    dimension = leverage.get("dimension")
    current_score = leverage.get("currentScore", 0)
    target_score = leverage.get("targetScore", 0)
    projected_impact = leverage.get("projectedImpact", 0)

    if not dimension:
        worst_dim = _find_worst_dimension(snapshot.get("dimension_scores", {}))
        if worst_dim:
            dimension = worst_dim
            current_score = snapshot["dimension_scores"].get(dimension, 50)
            target_score = min(current_score + 10, 100)

    action = LEVERAGE_RECOMMENDATIONS.get(dimension, "Focus on building consistent daily habits across all dimensions.")

    return {
        "dimension": dimension,
        "action": action,
        "projectedImpact": projected_impact,
        "currentScore": current_score,
        "targetScore": target_score,
        "biologicalAge": snapshot.get("biological_age"),
        "chronologicalAge": chronological_age,
        "paceOfAging": snapshot.get("pace_of_aging"),
    }


def _find_worst_dimension(dimension_scores: dict) -> Optional[str]:
    if not dimension_scores:
        return None
    return min(dimension_scores, key=dimension_scores.get)