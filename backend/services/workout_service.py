from datetime import date, timedelta
from typing import Optional


def log_workout(user_id: str, data: dict) -> dict:
    return {
        "user_id": user_id,
        "date": data.get("date", date.today().isoformat()),
        "type": data.get("type", "resistance"),
        "intensity": data.get("intensity", 5),
        "duration_min": data.get("duration_min", 45),
        "exercises": data.get("exercises", []),
        "notes": data.get("notes", ""),
    }


def get_weekly_movement_score(user_id: str, week_start: date, workouts: list[dict]) -> dict:
    week_end = week_start + timedelta(days=6)
    week_workouts = _filter_workouts_by_range(workouts, user_id, week_start, week_end)

    if not week_workouts:
        return {
            "movementScore": 50,
            "breakdown": {
                "resistance": 50,
                "cardio": 50,
                "mobility": 50,
                "neat": 50,
            },
        }

    resistance_score = _calc_resistance_score(week_workouts)
    cardio_score = _calc_cardio_score(week_workouts)
    mobility_score = _calc_mobility_score(week_workouts)
    neat_score = _calc_neat_score(week_workouts)

    movement_score = round(
        resistance_score * 0.35
        + cardio_score * 0.25
        + mobility_score * 0.20
        + neat_score * 0.20,
        1,
    )

    return {
        "movementScore": movement_score,
        "breakdown": {
            "resistance": resistance_score,
            "cardio": cardio_score,
            "mobility": mobility_score,
            "neat": neat_score,
        },
    }


def _filter_workouts_by_range(workouts: list[dict], user_id: str, start: date, end: date) -> list[dict]:
    result = []
    for w in workouts:
        if w.get("user_id") != user_id:
            continue
        try:
            d = date.fromisoformat(w["date"])
        except (ValueError, KeyError):
            continue
        if start <= d <= end:
            result.append(w)
    return result


def _calc_resistance_score(workouts: list[dict]) -> float:
    resistance_workouts = [w for w in workouts if w.get("type") == "resistance"]
    if not resistance_workouts:
        return 40

    frequency = min(len(resistance_workouts) / 4, 1.0)
    avg_intensity = sum(w.get("intensity", 5) for w in resistance_workouts) / len(resistance_workouts) / 10
    avg_duration_factor = min(sum(w.get("duration_min", 45) for w in resistance_workouts) / (len(resistance_workouts) * 60), 1.0)

    return round(frequency * 0.4 + avg_intensity * 0.3 + avg_duration_factor * 0.3, 1) * 100


def _calc_cardio_score(workouts: list[dict]) -> float:
    zone2 = [w for w in workouts if 1 <= w.get("intensity", 0) <= 4 and w.get("type") in ("cardio", "walk", "run", "cycling")]
    hiit = [w for w in workouts if w.get("intensity", 0) >= 7 and w.get("type") in ("hiit", "cardio", "run")]

    zone2_vol = sum(w.get("duration_min", 0) for w in zone2)
    hiit_vol = sum(w.get("duration_min", 0) for w in hiit)

    zone2_score = min(zone2_vol / 150, 1.0) * 70
    hiit_score = min(hiit_vol / 45, 1.0) * 30

    return round(zone2_score + hiit_score, 1)


def _calc_mobility_score(workouts: list[dict]) -> float:
    mobility_types = {"mobility", "yoga", "stretching", "sport"}
    mobility_workouts = [w for w in workouts if w.get("type", "").lower() in mobility_types]
    frequency = len(mobility_workouts)
    return round(min(frequency / 3, 1.0) * 100, 1)


def _calc_neat_score(workouts: list[dict]) -> float:
    walks = [w for w in workouts if w.get("type", "").lower() in ("walk", "walking")]
    walk_freq = len(walks)
    walk_duration = sum(w.get("duration_min", 0) for w in walks)

    freq_score = min(walk_freq / 5, 1.0) * 50
    dur_score = min(walk_duration / 150, 1.0) * 50

    return round(freq_score + dur_score, 1)