from typing import Optional

VO2MAX_BASELINE = {
    "male": {20: 45, 30: 42, 40: 38, 50: 34, 60: 30, 70: 26, 80: 22},
    "female": {20: 38, 30: 35, 40: 31, 50: 27, 60: 23, 70: 20, 80: 17},
}

VO2MAX_HR_MAP = [
    (55, 0.40),
    (50, 0.50),
    (45, 0.60),
    (40, 0.75),
    (35, 0.90),
    (30, 1.00),
    (25, 1.20),
    (20, 1.40),
    (15, 1.70),
    (0, 2.00),
]


def estimate_vo2max(workouts: list[dict], chronological_age: int, sex: str = "male") -> dict:
    sex_key = "female" if sex.lower() in ("female", "f") else "male"
    age_bracket = min(VO2MAX_BASELINE[sex_key].keys(), key=lambda k: abs(k - chronological_age))
    baseline = VO2MAX_BASELINE[sex_key][age_bracket]

    if not workouts:
        return {
            "vo2max_estimated": round(baseline, 1),
            "vo2max_score": 50.0,
            "baseline": baseline,
            "adjustment": 0.0,
        }

    freq = len(workouts)
    avg_intensity = sum(w.get("intensity", 5) for w in workouts) / max(freq, 1)
    types = set(w.get("type", "") for w in workouts)
    has_cardio = any(t.lower() in ("cardio", "running", "cycling", "swimming", "hiit") for t in types)
    has_resistance = any(t.lower() in ("resistance", "strength", "weights", "lifting") for t in types)

    freq_bonus = min(freq, 7) * 0.8
    intensity_bonus = (avg_intensity - 5) * 1.2
    type_bonus = (1.0 if has_cardio else 0.0) + (0.5 if has_resistance else 0.0)

    adjustment = freq_bonus + intensity_bonus + type_bonus
    estimated = baseline + adjustment
    estimated = max(15, min(estimated, 65))

    vo2max_score = (estimated - 15) / (65 - 15) * 100
    vo2max_score = max(0, min(100, vo2max_score))

    return {
        "vo2max_estimated": round(estimated, 1),
        "vo2max_score": round(vo2max_score, 1),
        "baseline": baseline,
        "adjustment": round(adjustment, 1),
    }


def get_vo2max_hazard_ratio(vo2max_score: float) -> float:
    estimated_vo2max = 15 + (vo2max_score / 100) * (65 - 15)
    for threshold, hr in VO2MAX_HR_MAP:
        if estimated_vo2max >= threshold:
            return hr
    return 2.00
