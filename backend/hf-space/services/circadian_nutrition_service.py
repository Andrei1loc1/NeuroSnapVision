from datetime import date, datetime, timedelta
from typing import Optional
import statistics


def score_day(user_id: str, target_date: date, meals: list[dict], sleep_time: Optional[str] = None) -> dict:
    day_meals = _filter_meals_for_day(meals, user_id, target_date)

    if not day_meals:
        return {
            "circadian_score": 50,
            "eating_window": {"hours": 0, "score": 50},
            "distribution": {"percent_before_onset": 0, "score": 50},
            "timing": {"coefficient_of_variation": 0, "score": 50},
            "consistency": {"std_dev_hours": 0, "score": 50},
        }

    meal_times = _extract_meal_times(day_meals)
    meal_calories = _extract_meal_calories(day_meals)

    if len(meal_times) < 2:
        return {
            "circadian_score": 50,
            "eating_window": {"hours": 0, "score": 50},
            "distribution": {"percent_before_onset": 0, "score": 50},
            "timing": {"coefficient_of_variation": 0, "score": 50},
            "consistency": {"std_dev_hours": 0, "score": 50},
        }

    melatonin_onset = _get_melatonin_onset(sleep_time)

    window_result = _score_eating_window(meal_times)
    distribution_result = _score_caloric_distribution(meal_times, meal_calories, melatonin_onset)
    timing_result = _score_macro_timing(meal_calories)
    consistency_result = _score_fasting_consistency(meal_times)

    circadian_score = round(
        window_result["score"] * 0.30
        + distribution_result["score"] * 0.30
        + timing_result["score"] * 0.20
        + consistency_result["score"] * 0.20,
        1,
    )

    return {
        "circadian_score": circadian_score,
        "eating_window": window_result,
        "distribution": distribution_result,
        "timing": timing_result,
        "consistency": consistency_result,
    }


def _filter_meals_for_day(meals: list[dict], user_id: str, target_date: date) -> list[dict]:
    date_str = target_date.isoformat()
    return [m for m in meals if m.get("user_id") == user_id and m.get("date") == date_str]


def _extract_meal_times(meals: list[dict]) -> list[float]:
    times = []
    for m in meals:
        t = m.get("time") or m.get("timestamp")
        if t is None:
            continue
        try:
            if isinstance(t, str):
                if "T" in t:
                    dt = datetime.fromisoformat(t)
                    times.append(dt.hour + dt.minute / 60)
                else:
                    parts = t.split(":")
                    times.append(int(parts[0]) + int(parts[1]) / 60)
            elif isinstance(t, (int, float)):
                times.append(float(t))
        except (ValueError, IndexError, TypeError):
            continue
    return sorted(times)


def _extract_meal_calories(meals: list[dict]) -> list[float]:
    return [m.get("calories", 0) for m in meals]


def _get_melatonin_onset(sleep_time: Optional[str]) -> float:
    default_bedtime = 23.0
    if sleep_time:
        try:
            if ":" in sleep_time:
                parts = sleep_time.split(":")
                bedtime = int(parts[0]) + int(parts[1]) / 60
            else:
                bedtime = float(sleep_time)
        except (ValueError, IndexError):
            bedtime = default_bedtime
    else:
        bedtime = default_bedtime

    onset = bedtime - 2
    if onset < 0:
        onset += 24
    return onset


def _score_eating_window(meal_times: list[float]) -> dict:
    window_hours = meal_times[-1] - meal_times[0]
    if window_hours < 0:
        window_hours += 24

    target_min, target_max = 10, 12
    if target_min <= window_hours <= target_max:
        score = 100
    elif window_hours < target_min:
        score = max(0, 100 - (target_min - window_hours) * 10)
    else:
        score = max(0, 100 - (window_hours - target_max) * 8)

    return {"hours": round(window_hours, 1), "score": round(score, 1)}


def _score_caloric_distribution(meal_times: list[float], meal_calories: list[float], melatonin_onset: float) -> dict:
    total_calories = sum(meal_calories)
    if total_calories == 0:
        return {"percent_before_onset": 0, "score": 50}

    before_onset = sum(c for t, c in zip(meal_times, meal_calories) if t < melatonin_onset)
    percent = (before_onset / total_calories) * 100

    target = 70
    if percent >= target:
        score = 100
    else:
        score = max(0, 100 - (target - percent) * 1.5)

    return {"percent_before_onset": round(percent, 1), "score": round(score, 1)}


def _score_macro_timing(meal_calories: list[float]) -> dict:
    total = sum(meal_calories)
    if total == 0 or len(meal_calories) < 2:
        return {"coefficient_of_variation": 0, "score": 50}

    n = len(meal_calories)
    ideal = total / n
    if ideal == 0:
        return {"coefficient_of_variation": 0, "score": 50}

    mean_cal = statistics.mean(meal_calories)
    if mean_cal == 0:
        return {"coefficient_of_variation": 0, "score": 50}

    std_dev = statistics.stdev(meal_calories) if len(meal_calories) > 1 else 0
    cv = std_dev / mean_cal

    if cv < 0.2:
        score = 100
    elif cv < 0.4:
        score = 80
    elif cv < 0.6:
        score = 60
    else:
        score = max(0, 60 - (cv - 0.6) * 100)

    return {"coefficient_of_variation": round(cv, 2), "score": round(score, 1)}


def _score_fasting_consistency(meal_times: list[float]) -> dict:
    if len(meal_times) < 2:
        return {"std_dev_hours": 0, "score": 50}

    first_meal = meal_times[0]
    std_dev = 0
    score = 50

    return {"std_dev_hours": round(std_dev, 2), "score": round(score, 1)}