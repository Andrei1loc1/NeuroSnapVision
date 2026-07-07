from datetime import date, timedelta
from typing import Optional


def get_daily_protocol(user_id: str, target_date: date, protocols: list[dict], previous_protocol: Optional[dict] = None) -> dict:
    existing = _find_protocol(protocols, user_id, target_date)
    if existing:
        return existing

    protocol = _create_default_protocol(user_id, target_date)
    if previous_protocol:
        protocol = _prefill_from_previous(protocol, previous_protocol)

    return protocol


def submit_morning_checkin(user_id: str, target_date: date, data: dict, protocols: list[dict]) -> dict:
    protocol = _find_protocol(protocols, user_id, target_date)
    if not protocol:
        protocol = _create_default_protocol(user_id, target_date)

    protocol["morning"] = {
        "mood": data.get("mood", 5),
        "energy": data.get("energy", 5),
        "recovery": data.get("recovery", data.get("morning_recovery", 5)),
        "digestion": data.get("digestion", 5),
        "stress": data.get("stress", 5),
        "sleep_quality": data.get("sleep_quality", data.get("recovery", 5)),
        "libido": data.get("libido", 5),
        "focus": data.get("focus", 5),
        "morningLight": data.get("morningLight"),
    }
    protocol["morningCompleted"] = True

    if protocol.get("eveningCompleted"):
        protocol["isComplete"] = True

    streak = _compute_streak_from_protocols(protocols, user_id, target_date, extra_protocol=protocol)
    protocol["streak"] = streak

    return protocol


def submit_evening_checkin(user_id: str, target_date: date, data: dict, protocols: list[dict]) -> dict:
    protocol = _find_protocol(protocols, user_id, target_date)
    if not protocol:
        protocol = _create_default_protocol(user_id, target_date)

    protocol["evening"] = {
        "mood": data.get("mood", 5),
        "energy": data.get("energy", 5),
        "stress": data.get("stress", 5),
        "focus": data.get("focus", 5),
        "libido": data.get("libido", 5),
        "digestion": data.get("digestion", 5),
        "gratitude": data.get("gratitude", ""),
        "wins": data.get("wins", ""),
        "supplements": data.get("supplements", []),
        "last_meal_time": data.get("last_meal_time"),
        "socialConnection": data.get("socialConnection"),
        "coldExposure": data.get("coldExposure"),
        "heatExposure": data.get("heatExposure"),
        "oralHealth": data.get("oralHealth"),
        "caffeineCutoff": data.get("caffeineCutoff"),
        "screenCutoff": data.get("screenCutoff"),
    }
    protocol["eveningCompleted"] = True

    if protocol.get("morningCompleted"):
        protocol["isComplete"] = True

    streak = _compute_streak_from_protocols(protocols, user_id, target_date, extra_protocol=protocol)
    protocol["streak"] = streak

    return protocol


def get_compliance_streak(user_id: str, protocols: list[dict], as_of: Optional[date] = None) -> int:
    if as_of is None:
        as_of = date.today()
    return _compute_streak_from_protocols(protocols, user_id, as_of)


def _find_protocol(protocols: list[dict], user_id: str, target_date: date) -> Optional[dict]:
    date_str = target_date.isoformat()
    for p in protocols:
        if p.get("user_id") == user_id and p.get("date") == date_str:
            return p
    return None


def _create_default_protocol(user_id: str, target_date: date) -> dict:
    return {
        "user_id": user_id,
        "date": target_date.isoformat(),
        "morningCompleted": False,
        "eveningCompleted": False,
        "isComplete": False,
        "morning": None,
        "evening": None,
    }


def _prefill_from_previous(protocol: dict, previous: dict) -> dict:
    if previous.get("morning"):
        protocol["morning"] = previous["morning"]
    if previous.get("evening"):
        protocol["evening"] = previous["evening"]
    return protocol


def _compute_streak_from_protocols(protocols: list[dict], user_id: str, as_of: date, extra_protocol: Optional[dict] = None) -> int:
    user_protocols = [p for p in protocols if p.get("user_id") == user_id]
    completed_dates = set()
    for p in user_protocols:
        if p.get("isComplete"):
            try:
                completed_dates.add(date.fromisoformat(p["date"]))
            except (ValueError, KeyError):
                continue

    if extra_protocol and extra_protocol.get("isComplete"):
        try:
            completed_dates.add(date.fromisoformat(extra_protocol["date"]))
        except (ValueError, KeyError):
            pass

    streak = 0
    check = as_of
    for _ in range(365):
        if check in completed_dates:
            streak += 1
            check -= timedelta(days=1)
        else:
            break

    return streak