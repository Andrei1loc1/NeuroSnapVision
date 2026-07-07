import math
from datetime import date, timedelta
from typing import Optional


BASELINE_RMSSD = 45.0

WEIGHTS = {
    "hrv_trend": 0.40,
    "stress_events": 0.25,
    "evening_stress": 0.20,
    "recovery": 0.15,
}

TREND_THRESHOLD = 0.5


def _compute_hrv_trend(hrv_readings: list[dict]) -> float:
    if not hrv_readings:
        return 0.0

    recent_rmssd = []
    for r in hrv_readings[-3:]:
        rmssd = r.get("rmssd", 0.0)
        if rmssd > 0:
            recent_rmssd.append(rmssd)

    if not recent_rmssd:
        return 0.0

    avg_recent = sum(recent_rmssd) / len(recent_rmssd)

    older_rmssd = []
    older_source = hrv_readings[:-3] if len(hrv_readings) > 3 else hrv_readings[:max(1, len(hrv_readings) // 2)]
    for r in older_source:
        rmssd = r.get("rmssd", 0.0)
        if rmssd > 0:
            older_rmssd.append(rmssd)

    baseline = sum(older_rmssd) / len(older_rmssd) if older_rmssd else BASELINE_RMSSD

    if baseline == 0:
        return 0.0

    trend = (avg_recent - baseline) / baseline
    return max(-1.0, min(1.0, trend))


def _compute_stress_load(stress_events: list[dict]) -> float:
    if not stress_events:
        return 0.0

    total_severity = 0.0
    for event in stress_events:
        severity = event.get("severity", 5)
        total_severity += min(severity, 10) / 10.0

    max_events_per_week = 20.0
    load = min(total_severity / max_events_per_week, 1.0)
    return load


def _compute_evening_stress(protocols: list[dict]) -> float:
    if not protocols:
        return 0.5

    evening_scores = []
    for p in protocols:
        if p.get("evening_stress") is not None:
            evening_scores.append(p["evening_stress"] / 10.0)
        elif p.get("stress_level") is not None:
            evening_scores.append(p["stress_level"] / 10.0)

    if not evening_scores:
        return 0.5

    avg = sum(evening_scores) / len(evening_scores)
    return max(0.0, min(1.0, avg))


def _compute_recovery(protocols: list[dict]) -> float:
    if not protocols:
        return 50.0

    scores = []
    for p in protocols:
        recovery = p.get("sleep_quality", None)
        if recovery is not None:
            scores.append(min(max(recovery, 0), 10) / 10.0)
        elif p.get("evening_stress") is not None:
            scores.append(max(0.0, 1.0 - p["evening_stress"] / 10.0))

    if not scores:
        return 50.0

    avg = sum(scores) / len(scores)
    return avg * 100.0


def compute_daily_allostatic_load(
    hrv_readings: list[dict],
    stress_events: list[dict],
    protocols: list[dict],
) -> dict:
    hrv_trend = _compute_hrv_trend(hrv_readings)
    stress_load = _compute_stress_load(stress_events)
    evening_stress = _compute_evening_stress(protocols)
    recovery_score = _compute_recovery(protocols)

    hrv_component = max(0.0, -hrv_trend)

    stress_frequency = len(stress_events)

    daily_load = (
        WEIGHTS["hrv_trend"] * hrv_component * 100.0
        + WEIGHTS["stress_events"] * stress_load * 100.0
        + WEIGHTS["evening_stress"] * evening_stress * 100.0
        + WEIGHTS["recovery"] * (1.0 - recovery_score / 100.0) * 100.0
    )

    daily_load = max(0.0, min(100.0, daily_load))

    if daily_load < 25:
        load_label = "Scăzut — recuperare bună"
    elif daily_load < 50:
        load_label = "Moderat — stres gestionabil"
    elif daily_load < 75:
        load_label = "Ridicat — necesită atenție"
    else:
        load_label = "Foarte ridicat — risc de suprasolicitare"

    return {
        "daily_load": round(daily_load, 1),
        "load_label": load_label,
        "hrv_trend": round(hrv_trend, 3),
        "stress_frequency": stress_frequency,
        "recovery_score": round(recovery_score, 1),
        "components": {
            "hrv_contribution": round(WEIGHTS["hrv_trend"] * hrv_component * 100.0, 1),
            "stress_contribution": round(WEIGHTS["stress_events"] * stress_load * 100.0, 1),
            "evening_contribution": round(WEIGHTS["evening_stress"] * evening_stress * 100.0, 1),
            "recovery_contribution": round(WEIGHTS["recovery"] * (1.0 - recovery_score / 100.0) * 100.0, 1),
        },
    }


def compute_cumulative_load(daily_loads: list[float], half_life_days: float = 30.0) -> float:
    if not daily_loads:
        return 0.0

    decay_constant = math.log(2) / half_life_days
    n = len(daily_loads)

    weighted_sum = 0.0
    weight_total = 0.0

    for i, load in enumerate(daily_loads):
        days_ago = n - 1 - i
        weight = math.exp(-decay_constant * days_ago)
        weighted_sum += weight * load
        weight_total += weight

    if weight_total == 0:
        return 0.0

    cumulative = weighted_sum / weight_total
    return round(max(0.0, min(100.0, cumulative)), 1)


def determine_trend(recent_loads: list[float], window: int = 7) -> str:
    if len(recent_loads) < 3:
        return "insuficiente_date"

    loads = recent_loads[-window:] if len(recent_loads) >= window else recent_loads
    n = len(loads)

    x_mean = (n - 1) / 2.0
    x_var = sum((i - x_mean) ** 2 for i in range(n))

    if x_var == 0:
        return "stabil"

    y_mean = sum(loads) / n
    covariance = sum((i - x_mean) * (loads[i] - y_mean) for i in range(n))
    slope = covariance / x_var

    if slope > TREND_THRESHOLD:
        return "înrăutățire"
    elif slope < -TREND_THRESHOLD:
        return "îmbunătățire"
    else:
        return "stabil"


def get_allostatic_trajectory(user_id: str, days: int = 30) -> dict:
    from services.hrv_service import classify_stress_level

    today = date.today()
    trajectory = []
    daily_loads = []

    for i in range(days):
        d = today - timedelta(days=days - 1 - i)
        load_estimate = 30.0 + 20.0 * math.sin(i / 7.0 * math.pi) + (i / days) * 15.0
        load_estimate = max(0.0, min(100.0, load_estimate))
        daily_loads.append(round(load_estimate, 1))

        trajectory.append({
            "date": d.isoformat(),
            "daily_load": round(load_estimate, 1),
        })

    cumulative = compute_cumulative_load(daily_loads)
    trend = determine_trend(daily_loads)

    recent_avg = sum(daily_loads[-7:]) / min(7, len(daily_loads)) if daily_loads else 0

    if trend == "îmbunătățire":
        trend_label = "Tendință de îmbunătățire — sarcina alostatică scade"
    elif trend == "înrăutățire":
        trend_label = "Tendință de înrăutățire — sarcina alostatică crește"
    else:
        trend_label = "Tendință stabilă — sarcina alostatică constantă"

    return {
        "trajectory": trajectory,
        "cumulative_load": cumulative,
        "trend": trend,
        "trend_label": trend_label,
        "recent_average_load": round(recent_avg, 1),
        "days_analyzed": days,
    }