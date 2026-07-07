from typing import Optional
from datetime import date, timedelta

DISTRIBUTION_WEIGHTS = {
    "morning": 0.30,
    "midday": 0.40,
    "evening": 0.30,
}

IDEAL_WINDOW_HOURS = 10
MAX_WINDOW_HOURS = 16
IDEAL_LAST_MEAL_HOUR = 19
IDEAL_FIRST_MEAL_HOUR = 8


def score_circadian_nutrition(
    user_id: str,
    target_date: str,
    meals: Optional[list] = None,
    first_meal_time: Optional[str] = None,
    last_meal_time: Optional[str] = None,
) -> dict:
    meals = meals or []

    distribution = _calc_distribution(meals)
    timing = _calc_timing(first_meal_time, last_meal_time)
    consistency = _calc_consistency(meals, user_id)
    eating_window = _calc_eating_window(first_meal_time, last_meal_time)

    circadian_score = round(
        distribution["score"] * 0.30
        + timing["score"] * 0.30
        + consistency["score"] * 0.20
        + eating_window["score"] * 0.20,
        1,
    )

    return {
        "circadian_score": circadian_score,
        "eating_window": eating_window,
        "distribution": distribution,
        "timing": timing,
        "consistency": consistency,
    }


def _calc_distribution(meals: list) -> dict:
    morning = sum(1 for m in meals if _meal_period(m) == "morning")
    midday = sum(1 for m in meals if _meal_period(m) == "midday")
    evening = sum(1 for m in meals if _meal_period(m) == "evening")
    total = len(meals) or 1

    actual = {
        "morning": morning / total,
        "midday": midday / total,
        "evening": evening / total,
    }

    deviation = sum(
        abs(actual[p] - DISTRIBUTION_WEIGHTS[p]) for p in ["morning", "midday", "evening"]
    )
    score = max(0, round(100 - deviation * 200, 1))

    return {
        "score": score,
        "morning_count": morning,
        "midday_count": midday,
        "evening_count": evening,
        "ideal": DISTRIBUTION_WEIGHTS,
        "actual": {k: round(v, 2) for k, v in actual.items()},
    }


def _calc_timing(first_meal_time: Optional[str], last_meal_time: Optional[str]) -> dict:
    score = 50.0
    first_hour = None
    last_hour = None

    if first_meal_time:
        try:
            parts = first_meal_time.split(":")
            first_hour = int(parts[0])
        except (ValueError, IndexError):
            pass

    if last_meal_time:
        try:
            parts = last_meal_time.split(":")
            last_hour = int(parts[0])
        except (ValueError, IndexError):
            pass

    if first_hour is not None:
        if first_hour <= IDEAL_FIRST_MEAL_HOUR:
            score += 25
        elif first_hour <= 10:
            score += 15
        else:
            score -= 10

    if last_hour is not None:
        if last_hour <= IDEAL_LAST_MEAL_HOUR:
            score += 25
        elif last_hour <= 21:
            score += 10
        else:
            score -= 15

    score = max(0, min(100, score))

    return {
        "score": round(score, 1),
        "first_meal": first_meal_time,
        "last_meal": last_meal_time,
        "ideal_first_meal": f"{IDEAL_FIRST_MEAL_HOUR:02d}:00",
        "ideal_last_meal": f"{IDEAL_LAST_MEAL_HOUR:02d}:00",
    }


def _calc_consistency(meals: list, user_id: str) -> dict:
    meal_count = len(meals)
    if meal_count >= 3:
        score = 90.0
    elif meal_count == 2:
        score = 70.0
    elif meal_count == 1:
        score = 40.0
    else:
        score = 0.0

    return {
        "score": score,
        "meal_count": meal_count,
        "ideal_meal_count": 3,
    }


def _calc_eating_window(first_meal_time: Optional[str], last_meal_time: Optional[str]) -> dict:
    first_hour = None
    last_hour = None

    if first_meal_time:
        try:
            parts = first_meal_time.split(":")
            first_hour = int(parts[0]) + int(parts[1]) / 60
        except (ValueError, IndexError):
            pass

    if last_meal_time:
        try:
            parts = last_meal_time.split(":")
            last_hour = int(parts[0]) + int(parts[1]) / 60
        except (ValueError, IndexError):
            pass

    window_hours = None
    score = 50.0

    if first_hour is not None and last_hour is not None:
        window_hours = round(last_hour - first_hour, 1)
        if window_hours <= IDEAL_WINDOW_HOURS:
            score = 100.0
        elif window_hours <= 12:
            score = 80.0
        elif window_hours <= MAX_WINDOW_HOURS:
            score = 50.0
        else:
            score = 20.0

    return {
        "score": score,
        "window_hours": window_hours,
        "ideal_window_hours": IDEAL_WINDOW_HOURS,
        "first_meal": first_meal_time,
        "last_meal": last_meal_time,
    }


def score_circadian_extended(protocol: dict) -> dict:
    morning_light = _safe_int(protocol.get("morningLight"), 0)
    evening_screens = _safe_int(protocol.get("eveningScreens"), 3)
    sleep_consistency = _safe_int(protocol.get("sleepConsistency"), 3)
    caffeine_cutoff = _safe_int(protocol.get("caffeineCutoff"), 0)

    light_score = min(morning_light / 30, 1.0) * 100
    screen_score = (5 - evening_screens) / 4 * 100
    consistency_score = (sleep_consistency - 1) / 4 * 100
    caffeine_score = 100.0 if caffeine_cutoff >= 14 else 50.0 if caffeine_cutoff >= 12 else 20.0

    circadian_extended_score = (
        light_score * 0.35
        + screen_score * 0.25
        + consistency_score * 0.25
        + caffeine_score * 0.15
    )

    return {
        "circadian_extended_score": round(circadian_extended_score, 1),
        "sub_scores": {
            "morning_light": round(light_score, 1),
            "evening_screens": round(screen_score, 1),
            "sleep_consistency": round(consistency_score, 1),
            "caffeine_cutoff": round(caffeine_score, 1),
        },
    }


def _safe_int(value, default=0):
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def _meal_period(meal: dict) -> str:
    time_str = meal.get("time", "")
    try:
        parts = time_str.split(":")
        hour = int(parts[0])
    except (ValueError, IndexError):
        return "midday"

    if hour < 11:
        return "morning"
    elif hour < 17:
        return "midday"
    else:
        return "evening"


