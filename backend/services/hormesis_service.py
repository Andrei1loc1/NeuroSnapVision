from typing import Optional

HORMESIS_HR_MAP = [
    (90, 0.75),
    (80, 0.85),
    (70, 0.92),
    (60, 1.00),
    (50, 1.05),
    (40, 1.10),
    (30, 1.15),
    (20, 1.20),
    (0, 1.25),
]


def compute_hormesis(protocol: dict) -> dict:
    cold_exposure = _safe_int(protocol.get("coldExposure"), 0)
    sauna_use = _safe_int(protocol.get("saunaUse"), 0)
    fasting_hours = _safe_float(protocol.get("fastingHours"), 0.0)
    breathwork = _safe_int(protocol.get("breathwork"), 0)

    cold_score = min(cold_exposure / 3, 1.0) * 100
    sauna_score = min(sauna_use / 2, 1.0) * 100
    fasting_score = min(fasting_hours / 14, 1.0) * 100
    breathwork_score = min(breathwork / 3, 1.0) * 100

    hormesis_score = (
        cold_score * 0.30
        + sauna_score * 0.30
        + fasting_score * 0.25
        + breathwork_score * 0.15
    )

    return {
        "hormesis_score": round(hormesis_score, 1),
        "sub_scores": {
            "cold_exposure": round(cold_score, 1),
            "sauna_use": round(sauna_score, 1),
            "fasting": round(fasting_score, 1),
            "breathwork": round(breathwork_score, 1),
        },
    }


def get_hormesis_hazard_ratio(hormesis_score: float) -> float:
    for threshold, hr in HORMESIS_HR_MAP:
        if hormesis_score >= threshold:
            return hr
    return 1.25


def _safe_int(value, default=0):
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def _safe_float(value, default=0.0):
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default
