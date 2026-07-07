from typing import Optional

INFLAMMAGING_HR_MAP = [
    (90, 0.70),
    (80, 0.80),
    (70, 0.90),
    (60, 1.00),
    (50, 1.10),
    (40, 1.25),
    (30, 1.40),
    (20, 1.60),
    (0, 1.80),
]


def compute_inflammaging(
    protocol: dict,
    meals: list[dict],
    workouts: list[dict],
    oral_health: bool = True,
) -> dict:
    stress = _safe_int(protocol.get("eveningStress"), 3)
    recovery = _safe_int(protocol.get("morningRecovery"), 3)
    digestion = _safe_int(protocol.get("eveningDigestion"), 3)
    energy = _safe_int(protocol.get("morningEnergy"), 3)

    stress_score = (5 - stress) / 4 * 100
    recovery_score = (recovery - 1) / 4 * 100
    digestion_score = (digestion - 1) / 4 * 100
    energy_score = (energy - 1) / 4 * 100

    meal_count = len(meals)
    meal_score = min(meal_count / 3, 1.0) * 100

    workout_count = len(workouts)
    exercise_score = min(workout_count / 5, 1.0) * 100

    oral_score = 100.0 if oral_health else 40.0

    inflammaging_score = (
        stress_score * 0.20
        + recovery_score * 0.15
        + digestion_score * 0.15
        + energy_score * 0.10
        + meal_score * 0.15
        + exercise_score * 0.15
        + oral_score * 0.10
    )

    return {
        "inflammaging_score": round(inflammaging_score, 1),
        "sub_scores": {
            "stress": round(stress_score, 1),
            "recovery": round(recovery_score, 1),
            "digestion": round(digestion_score, 1),
            "energy": round(energy_score, 1),
            "meal_regularity": round(meal_score, 1),
            "exercise": round(exercise_score, 1),
            "oral_health": round(oral_score, 1),
        },
    }


def get_inflammaging_hazard_ratio(inflammaging_score: float) -> float:
    for threshold, hr in INFLAMMAGING_HR_MAP:
        if inflammaging_score >= threshold:
            return hr
    return 1.80


def _safe_int(value, default=3):
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
