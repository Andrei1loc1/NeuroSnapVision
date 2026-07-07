from datetime import date, timedelta
from typing import Optional
import math

from services.vo2max_service import estimate_vo2max, get_vo2max_hazard_ratio
from services.inflammaging_service import compute_inflammaging, get_inflammaging_hazard_ratio
from services.hormesis_service import compute_hormesis, get_hormesis_hazard_ratio
from services.nutrition_service import calculate_protein_timing_score
from services.circadian_service import score_circadian_extended

WEIGHTS = {
    "movement":   0.25,
    "nutrition":  0.20,
    "sleep":      0.20,
    "subjective": 0.15,
    "ans":        0.10,
    "light":      0.10,
    "hormesis":   0.00,
}

DIMENSIONS = ["nutrition", "sleep", "ans", "movement", "light", "subjective", "hormesis"]

ORGAN_WEIGHTS = {
    "brain": {"subjective": 0.40, "sleep": 0.35, "inflammaging": 0.25},
    "cardiovascular": {"movement": 0.50, "ans": 0.30, "inflammaging": 0.20},
    "metabolic": {"nutrition": 0.45, "sleep": 0.25, "inflammaging": 0.30},
    "immune": {"sleep": 0.35, "subjective": 0.25, "inflammaging": 0.40},
}

DOSE_GAINS = {
    "sleep": 1.8,
    "movement": 1.2,
    "nutrition": 1.0,
    "ans": 1.4,
    "light": 0.8,
    "subjective": 1.1,
    "hormesis": 0.6,
}

LEVERAGE_ACTIONS = {
    "nutrition": (
        "Optimizează nutriția: adaugă 1-2 porții de verdeață zilnic "
        "și asigură proteine la fiecare masă. Concentrează-te pe "
        "alimente MIND-diet (fructe de pădure, nuci, pește, ulei de măsline)."
    ),
    "sleep": (
        "Optimizează somnul: stabilește o oră de culcare consistentă, "
        "redu lumina albastră cu 2h înainte de somn și țintește 7-8h "
        "de somn de calitate. Expunerea la lumină matinală ajută ritmul circadian."
    ),
    "ans": (
        "Echilibrează sistemul nervos: practică 5 min de respirație "
        "(4-7-8 sau box breathing) zilnic, redu stimulentele și "
        "prioritizează rutinele de recuperare matinală."
    ),
    "movement": (
        "Îmbunătățește mișcarea: adaugă 2 sesiuni de rezistență pe "
        "săptămână, include 150min de cardio Zone 2 și fă stretching "
        "sau mobilitate de 3x pe săptămână."
    ),
    "light": (
        "Aliniază-ți ritmul circadian: mănâncă într-o fereastră de "
        "10-12h, expune-te la lumină solară matinală în 30min de la "
        "trezire și evită mesele târzii cu 2h înainte de somn."
    ),
    "subjective": (
        "Îmbunătățește starea subiectivă: practică recunoștința zilnic, "
        "prioritizează conexiunile sociale și programează 15min de "
        "reflecție conștientă în fiecare seară."
    ),
    "hormesis": (
        "Activează hormesis: adaugă expunere la frig (duș rece 30s), "
        "saună de 1-2x pe săptămână sau post intermitent 14h+. "
        "Stresul controlat activează sirtuins și autophagy."
    ),
}


def compute_bio_age(
    chronological_age: int,
    metrics: Optional[dict] = None,
    history: Optional[list[dict]] = None,
) -> dict:
    metrics = metrics or {}

    dimension_scores = _compute_all_dimensions(metrics)
    composite = _weighted_composite(dimension_scores)
    hazard_ratios = _compute_hazard_ratios(dimension_scores, metrics, chronological_age)
    biological_age = _composite_to_bio_age(composite, chronological_age, hazard_ratios)

    pace_of_aging = _compute_pace(biological_age, chronological_age, history, hazard_ratios)
    pace_label = "decelerating" if pace_of_aging < 0.95 else "normal" if pace_of_aging < 1.05 else "accelerating"

    organ_ages = _compute_organ_ages(biological_age, chronological_age, dimension_scores, metrics)

    leverage = _find_leverage_point(dimension_scores, chronological_age, metrics)

    protocol = metrics.get("protocol", {})
    meals = metrics.get("meals", [])
    workouts = metrics.get("workouts", [])
    oral_health = protocol.get("oralHealth", True)
    sex = metrics.get("sex", "male")

    vo2max_data = estimate_vo2max(workouts, chronological_age, sex)
    inflammaging_data = compute_inflammaging(protocol, meals, workouts, oral_health)
    hormesis_data = compute_hormesis(protocol)
    protein_timing_data = calculate_protein_timing_score(meals)
    circadian_ext_data = score_circadian_extended(protocol)

    intervention_history = metrics.get("interventionHistory")
    efficacy_data = _compute_intervention_efficacy(
        leverage["dimension"],
        dimension_scores.get(leverage["dimension"], 50),
        intervention_history,
    )

    return {
        "biologicalAge": round(biological_age, 1),
        "chronologicalAge": chronological_age,
        "paceOfAging": round(pace_of_aging, 2),
        "paceLabel": pace_label,
        "nutritionScore": round(dimension_scores["nutrition"], 1),
        "sleepScore": round(dimension_scores["sleep"], 1),
        "ansScore": round(dimension_scores["ans"], 1),
        "movementScore": round(dimension_scores["movement"], 1),
        "lightScore": round(dimension_scores["light"], 1),
        "subjectiveScore": round(dimension_scores["subjective"], 1),
        "hormesisScore": round(dimension_scores["hormesis"], 1),
        "brainAge": round(organ_ages["brain"], 1),
        "cardiovascularAge": round(organ_ages["cardiovascular"], 1),
        "metabolicAge": round(organ_ages["metabolic"], 1),
        "immuneAge": round(organ_ages["immune"], 1),
        "topLeverageDimension": leverage["dimension"],
        "leverageAction": leverage["action"],
        "projectedImpact": round(leverage["projected_impact"], 2),
        "hazardRatios": {k: round(v, 2) for k, v in hazard_ratios.items()},
        "vo2max": vo2max_data,
        "inflammaging": inflammaging_data,
        "hormesis": hormesis_data,
        "proteinTiming": protein_timing_data,
        "circadianExtended": circadian_ext_data,
        "interventionEfficacy": efficacy_data,
        "inputData": metrics,
    }


def compute_leverage_point(
    chronological_age: int,
    metrics: Optional[dict] = None,
    north_star: Optional[str] = None,
) -> dict:
    metrics = metrics or {}
    dimension_scores = _compute_all_dimensions(metrics)
    leverage = _find_leverage_point(dimension_scores, chronological_age, metrics, north_star=north_star)

    return {
        "dimension": leverage["dimension"],
        "action": leverage["action"],
        "projectedImpact": round(leverage["projected_impact"], 2),
        "currentScore": round(dimension_scores.get(leverage["dimension"], 50), 1),
        "targetScore": round(min(dimension_scores.get(leverage["dimension"], 50) + 10, 100), 1),
    }


def _compute_all_dimensions(metrics: dict) -> dict[str, float]:
    return {
        "nutrition":   _score_nutrition(metrics),
        "sleep":       _score_sleep(metrics),
        "ans":         _score_ans(metrics),
        "movement":    _score_movement(metrics),
        "light":       _score_light(metrics),
        "subjective":  _score_subjective(metrics),
        "hormesis":    _score_hormesis(metrics),
    }


def _score_nutrition(metrics: dict) -> float:
    healthy = metrics.get("healthy_score")
    mind = metrics.get("mind_score")
    circadian = metrics.get("circadian_score")
    meals = metrics.get("meals", [])

    protein_timing = calculate_protein_timing_score(meals)
    protein_score = protein_timing["protein_timing_score"]

    scores = []
    weights = []

    if healthy is not None:
        scores.append(float(healthy))
        weights.append(0.30)
    if mind is not None:
        scores.append(float(mind))
        weights.append(0.25)
    if circadian is not None:
        scores.append(float(circadian))
        weights.append(0.20)
    if protein_score is not None:
        scores.append(float(protein_score))
        weights.append(0.25)

    if not scores:
        return 50.0

    total_w = sum(weights)
    return sum(s * w / total_w for s, w in zip(scores, weights))


def _score_sleep(metrics: dict) -> float:
    protocol = metrics.get("protocol", {})
    recovery = _safe_int(protocol.get("morningRecovery"))
    energy = _safe_int(protocol.get("morningEnergy"))

    if recovery is None and energy is None:
        return 50.0

    recovery_score = _scale_1to5_to_100(recovery or 3)
    energy_score = _scale_1to5_to_100(energy or 3)

    return recovery_score * 0.6 + energy_score * 0.4


def _score_ans(metrics: dict) -> float:
    protocol = metrics.get("protocol", {})
    recovery = _safe_int(protocol.get("morningRecovery"), 3)
    stress = _safe_int(protocol.get("eveningStress"), 3)
    digestion = _safe_int(protocol.get("eveningDigestion"), 3)

    hrv_proxy = (recovery / max(stress, 1)) * (digestion / 3.0)
    hrv_proxy = max(0.2, min(hrv_proxy, 5.0))
    hrv_score = _scale_range_to_100(hrv_proxy, 0.2, 5.0)

    stress_history = metrics.get("stressHistory", [])
    allo_score = _compute_allostatic_load(stress_history, stress)

    return hrv_score * 0.70 + allo_score * 0.30


def _score_movement(metrics: dict) -> float:
    workouts = metrics.get("workouts", [])
    if not workouts:
        return 50.0

    freq = len(workouts)
    avg_intensity = sum(w.get("intensity", 5) for w in workouts) / max(freq, 1)
    types = set(w.get("type", "") for w in workouts)
    type_variety = len(types)

    freq_score = min(freq / 5, 1.0) * 40
    intensity_score = min(avg_intensity / 8, 1.0) * 35
    variety_score = min(type_variety / 3, 1.0) * 25

    return freq_score + intensity_score + variety_score


def _score_light(metrics: dict) -> float:
    protocol = metrics.get("protocol", {})
    circadian = metrics.get("circadian_score")

    circadian_ext = score_circadian_extended(protocol)
    ext_score = circadian_ext["circadian_extended_score"]

    if circadian is not None:
        return float(circadian) * 0.5 + ext_score * 0.3 + 15.0

    last_meal = protocol.get("lastMealTime")
    meal_score = 50.0
    if last_meal:
        try:
            hour = int(last_meal.split(":")[0])
            if 17 <= hour <= 19:
                meal_score = 85.0
            elif 19 < hour <= 20:
                meal_score = 70.0
            elif 20 < hour <= 21:
                meal_score = 55.0
            else:
                meal_score = 40.0
        except (ValueError, IndexError):
            pass

    return meal_score * 0.5 + ext_score * 0.5


def _score_subjective(metrics: dict) -> float:
    protocol = metrics.get("protocol", {})
    mood = _safe_int(protocol.get("eveningMood") or protocol.get("morningMood"))
    energy = _safe_int(protocol.get("eveningEnergy") or protocol.get("morningEnergy"))
    focus = _safe_int(protocol.get("morningFocus"))
    libido = _safe_int(protocol.get("eveningLibido"))
    social = _safe_int(protocol.get("socialConnection"))

    scores = []
    weights = []

    if mood is not None:
        scores.append(_scale_1to5_to_100(mood))
        weights.append(0.25)
    if energy is not None:
        scores.append(_scale_1to5_to_100(energy))
        weights.append(0.20)
    if focus is not None:
        scores.append(_scale_1to5_to_100(focus))
        weights.append(0.15)
    if libido is not None:
        scores.append(_scale_1to5_to_100(libido))
        weights.append(0.10)
    if social is not None:
        scores.append(_scale_1to5_to_100(social))
        weights.append(0.30)

    if not scores:
        return 50.0

    total_w = sum(weights)
    return sum(s * w / total_w for s, w in zip(scores, weights))


def _score_hormesis(metrics: dict) -> float:
    protocol = metrics.get("protocol", {})
    hormesis_data = compute_hormesis(protocol)
    return hormesis_data["hormesis_score"]


def _weighted_composite(scores: dict[str, float]) -> float:
    return sum(scores[dim] * WEIGHTS[dim] for dim in DIMENSIONS)


def _composite_to_bio_age(composite: float, chronological_age: int, hazard_ratios: dict[str, float]) -> float:
    hr_product = 1.0
    for hr in hazard_ratios.values():
        hr_product *= hr

    hr_product = max(0.5, min(hr_product, 2.0))

    return chronological_age * hr_product


def _compute_hazard_ratios(
    dimension_scores: dict[str, float],
    metrics: dict,
    chronological_age: int,
) -> dict[str, float]:
    hrs = {}

    workouts = metrics.get("workouts", [])
    sex = metrics.get("sex", "male")
    vo2max_data = estimate_vo2max(workouts, chronological_age, sex)
    hrs["movement"] = get_vo2max_hazard_ratio(vo2max_data["vo2max_score"])

    nutrition_score = dimension_scores["nutrition"]
    if nutrition_score >= 80:
        hrs["nutrition"] = 0.75
    elif nutrition_score >= 60:
        hrs["nutrition"] = 0.85
    elif nutrition_score >= 40:
        hrs["nutrition"] = 1.00
    elif nutrition_score >= 20:
        hrs["nutrition"] = 1.15
    else:
        hrs["nutrition"] = 1.30

    sleep_score = dimension_scores["sleep"]
    if sleep_score >= 80:
        hrs["sleep"] = 0.70
    elif sleep_score >= 60:
        hrs["sleep"] = 0.85
    elif sleep_score >= 40:
        hrs["sleep"] = 1.00
    elif sleep_score >= 20:
        hrs["sleep"] = 1.20
    else:
        hrs["sleep"] = 1.40

    ans_score = dimension_scores["ans"]
    if ans_score >= 80:
        hrs["ans"] = 0.85
    elif ans_score >= 60:
        hrs["ans"] = 0.95
    elif ans_score >= 40:
        hrs["ans"] = 1.00
    elif ans_score >= 20:
        hrs["ans"] = 1.15
    else:
        hrs["ans"] = 1.30

    light_score = dimension_scores["light"]
    if light_score >= 80:
        hrs["light"] = 0.85
    elif light_score >= 60:
        hrs["light"] = 0.95
    elif light_score >= 40:
        hrs["light"] = 1.00
    elif light_score >= 20:
        hrs["light"] = 1.10
    else:
        hrs["light"] = 1.20

    subjective_score = dimension_scores["subjective"]
    if subjective_score >= 80:
        hrs["subjective"] = 0.80
    elif subjective_score >= 60:
        hrs["subjective"] = 0.90
    elif subjective_score >= 40:
        hrs["subjective"] = 1.00
    elif subjective_score >= 20:
        hrs["subjective"] = 1.20
    else:
        hrs["subjective"] = 1.50

    hormesis_data = compute_hormesis(metrics.get("protocol", {}))
    hrs["hormesis"] = get_hormesis_hazard_ratio(hormesis_data["hormesis_score"])

    return hrs


def _compute_pace(
    biological_age: float,
    chronological_age: int,
    history: Optional[list[dict]],
    hazard_ratios: dict[str, float],
) -> float:
    if not history or len(history) < 3:
        hr_product = 1.0
        for hr in hazard_ratios.values():
            hr_product *= hr
        return max(0.5, min(hr_product, 2.0))

    recent = history[-min(len(history), 30):]
    ages = [s.get("biologicalAge", s.get("biological_age", chronological_age))
            for s in recent]

    if len(ages) < 3:
        hr_product = 1.0
        for hr in hazard_ratios.values():
            hr_product *= hr
        return max(0.5, min(hr_product, 2.0))

    n = len(ages)
    x_mean = (n - 1) / 2
    y_mean = sum(ages) / n

    numerator = sum((i - x_mean) * (ages[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))

    if denominator == 0:
        hr_product = 1.0
        for hr in hazard_ratios.values():
            hr_product *= hr
        return max(0.5, min(hr_product, 2.0))

    slope = numerator / denominator
    annual_change = slope * 365
    pace = 1.0 + annual_change / max(chronological_age, 1)

    return max(0.5, min(pace, 2.0))


def _compute_organ_ages(
    biological_age: float,
    chronological_age: int,
    dimension_scores: dict[str, float],
    metrics: Optional[dict] = None,
) -> dict[str, float]:
    metrics = metrics or {}

    protocol = metrics.get("protocol", {})
    meals = metrics.get("meals", [])
    workouts = metrics.get("workouts", [])
    oral_health = protocol.get("oralHealth", True)
    inflammaging_data = compute_inflammaging(protocol, meals, workouts, oral_health)
    inflammaging_score = inflammaging_data["inflammaging_score"]

    organ_ages = {}
    for organ, weights in ORGAN_WEIGHTS.items():
        weighted_gap = 0.0
        total_w = 0.0
        for dim, w in weights.items():
            if dim == "inflammaging":
                score = inflammaging_score
            else:
                score = dimension_scores.get(dim, 50)
            weighted_gap += (100 - score) * w
            total_w += w

        avg_gap = weighted_gap / total_w if total_w > 0 else 0
        penalty = avg_gap * 0.06
        organ_ages[organ] = biological_age + penalty

    return organ_ages


def _find_leverage_point(
    dimension_scores: dict[str, float],
    chronological_age: int,
    metrics: Optional[dict] = None,
    north_star: Optional[str] = None,
) -> dict:
    metrics = metrics or {}
    current_composite = _weighted_composite(dimension_scores)
    hrs = _compute_hazard_ratios(dimension_scores, metrics, chronological_age)
    current_bio_age = _composite_to_bio_age(current_composite, chronological_age, hrs)

    best_dim = None
    best_gain = 0.0

    for dim in DIMENSIONS:
        current = dimension_scores[dim]
        if current >= 95:
            continue

        room_to_improve = 1.0 - (current / 100)
        effective_gain = DOSE_GAINS.get(dim, 0.5) * room_to_improve

        if effective_gain > best_gain:
            best_gain = effective_gain
            best_dim = dim

    if best_dim is None:
        best_dim = min(dimension_scores, key=dimension_scores.get)
        best_gain = 0.01

    base_action = LEVERAGE_ACTIONS.get(best_dim, "Construiește obiceiuri zilnice consistente.")
    if north_star:
        action = _personalize_action(best_dim, base_action, north_star)
    else:
        action = base_action

    return {
        "dimension": best_dim,
        "action": action,
        "projected_impact": round(best_gain, 2),
    }


_NORTH_STAR_TEMPLATES = {
    "nutrition": "Adaugă proteine și verdeață la fiecare masă — astfel ai energia de care ai ne pentru „{north_star}”.",
    "sleep": "Optimizează somnul: culcă-te la aceeași oră și redu lumina albastră — somnul de calitate îți dă claritate pentru „{north_star}”.",
    "ans": "Practică 5 min de respirație zilnic — sistemul tău nervos echilibrat îți susține „{north_star}”.",
    "movement": "Adaugă antrenamente de rezistență și cardio Zone 2 — corpul puternic îți permite „{north_star}”.",
    "light": "Aliniază-ți ritmul circadian cu lumină matinală și mese la ore fixe — ritmul stabilizează energia pentru „{north_star}”.",
    "subjective": "Practică recunoștința și conexiunea socială — starea de bine îți alimentează „{north_star}”.",
    "hormesis": "Adaugă stres controlat: duș rece, sauna sau post — reziliența fizică îți susține „{north_star}”.",
}


def _personalize_action(dimension: str, base_action: str, north_star: str) -> str:
    template = _NORTH_STAR_TEMPLATES.get(dimension)
    if template:
        return template.format(north_star=north_star)
    return "{base_action} \u2014 totul pentru \u201e{north_star}\u201d.".format(base_action=base_action, north_star=north_star)


def _compute_allostatic_load(stress_history: list[int], current_stress: int) -> float:
    if not stress_history:
        return 100 - (current_stress - 1) / 4 * 100

    all_stress = stress_history + [current_stress]
    recent = all_stress[-7:]

    avg_stress = sum(recent) / len(recent)

    high_stress_streak = 0
    max_streak = 0
    for s in recent:
        if s >= 4:
            high_stress_streak += 1
            max_streak = max(max_streak, high_stress_streak)
        else:
            high_stress_streak = 0

    base_score = 100 - (avg_stress - 1) / 4 * 100
    streak_penalty = max_streak * 8

    return max(0, min(100, base_score - streak_penalty))


def _compute_intervention_efficacy(
    dimension: str,
    current_score: float,
    intervention_history: Optional[list[dict]] = None,
) -> dict:
    if not intervention_history:
        return {"hasHistory": False, "message": ""}

    relevant = [h for h in intervention_history if h.get("dimension") == dimension]
    if not relevant:
        return {"hasHistory": False, "message": ""}

    latest = relevant[-1]
    score_before = latest.get("scoreBefore", current_score)
    delta = current_score - score_before

    if delta >= 10:
        message = f"Intervenția anterioară a funcționat: +{round(delta)} puncte în {dimension}"
    elif delta >= 3:
        message = f"Progres moderat: +{round(delta)} puncte în {dimension}"
    elif delta >= 0:
        message = f"Stabil. Continuă intervenția pentru rezultate."
    else:
        message = f"În scădere. Încearcă o altă abordare pentru {dimension}."

    return {
        "hasHistory": True,
        "dimension": dimension,
        "scoreBefore": round(score_before, 1),
        "scoreNow": round(current_score, 1),
        "delta": round(delta, 1),
        "message": message,
    }


def _safe_int(value, default=None):
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def _scale_1to5_to_100(value: int) -> float:
    return (value - 1) / 4 * 100


def _scale_range_to_100(value: float, min_val: float, max_val: float) -> float:
    clamped = max(min_val, min(value, max_val))
    return (clamped - min_val) / (max_val - min_val) * 100


def get_bio_age_snapshot(chronological_age: int, metrics: Optional[dict] = None) -> dict:
    snapshot = compute_bio_age(chronological_age, metrics)
    leverage = compute_leverage_point(chronological_age, metrics)

    return {
        "bio_age_snapshot": snapshot,
        "leverage_point": {
            "dimension": leverage["dimension"],
            "action": leverage["action"],
            "projectedImpact": leverage["projectedImpact"],
            "currentScore": leverage["currentScore"],
            "targetScore": leverage["targetScore"],
        },
    }


def get_bio_age_history(user_id: str, days: int = 90, snapshots: Optional[list] = None) -> dict:
    return {"snapshots": snapshots or []}
