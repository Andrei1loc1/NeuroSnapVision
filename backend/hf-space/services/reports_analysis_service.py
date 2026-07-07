from typing import Optional


UPF_FOOD_CLASSES = {
    "fried_fast_food", "pastries_sweets", "processed_meat",
    "sugary_drinks", "packaged_snacks",
}

HIGH_FIBER_FOODS = {
    "leafy_greens", "other_vegetables", "berries", "nuts",
    "whole_grains", "beans", "fruits",
}

METRIC_TARGETS = {
    "food_diversity_score": 100,
    "upf_score": 100,
    "pe_ratio_score": 100,
    "fiber_score": 100,
    "nutrient_timing_score": 100,
    "compliance_score": 100,
}

METRIC_RECOMMENDATIONS = {
    "food_diversity_score": {
        "title": "Diversitate alimentară",
        "description": (
            "Adaugă 2-3 alimente vegetale noi în meniul săptămânal. "
            "Țintește 30+ plante diferite pe săptămână pentru un microbiom optim."
        ),
    },
    "upf_score": {
        "title": "Redu alimentele ultra-procesate",
        "description": (
            "Înlocuiește snacks-urile procesate cu fructe, nuci sau iaurt. "
            "Gătește mai mult acasă și evită produsele cu >5 ingrediente."
        ),
    },
    "pe_ratio_score": {
        "title": "Optimizează raportul proteină/energie",
        "description": (
            "Adaugă o sursă de proteine slabe la fiecare masă (ouă, pește, piept de pui, tofu). "
            "Țintește >1.5g proteină per 100kcal."
        ),
    },
    "fiber_score": {
        "title": "Crește aportul de fibre",
        "description": (
            "Adaugă legume, fructe și cereale integrale la 2 mese pe zi. "
            "Fibrele hrănesc microbiomul și reduc inflamația sistemică."
        ),
    },
    "nutrient_timing_score": {
        "title": "Optimizează fereastra de mâncare",
        "description": (
            "Prima masă până la 8:00, ultima până la 19:00. "
            "O fereastră de 10-12h îmbunătățește ritmul circadian și somnul."
        ),
    },
    "compliance_score": {
        "title": "Urmează recomandările Daily Leverage",
        "description": (
            "Aplică consecvent intervenția recomandată. "
            "Fiecare zi de complianță îți reduce vârsta biologică."
        ),
    },
}


def _parse_hour(time_str: Optional[str]) -> Optional[int]:
    if not time_str:
        return None
    try:
        if "T" in time_str:
            from datetime import datetime
            return datetime.fromisoformat(time_str).hour
        return int(time_str.split(":")[0])
    except (ValueError, IndexError, TypeError):
        return None


def compute_food_diversity(meals: list[dict], days: int = 7) -> dict:
    if not meals:
        return {
            "food_diversity_score": 50.0,
            "unique_foods": 0,
            "target": 30,
            "foods_list": [],
        }

    food_classes = set()
    for meal in meals:
        fc = meal.get("food_class")
        if fc:
            food_classes.add(fc)

    unique_count = len(food_classes)
    score = min(unique_count / 30, 1.0) * 100

    return {
        "food_diversity_score": round(score, 1),
        "unique_foods": unique_count,
        "target": 30,
        "foods_list": sorted(food_classes),
    }


def compute_upf_percentage(meals: list[dict]) -> dict:
    if not meals:
        return {
            "upf_score": 50.0,
            "upf_count": 0,
            "total_meals": 0,
            "upf_percentage": 0.0,
        }

    total = len(meals)
    upf_count = sum(1 for m in meals if m.get("food_class") in UPF_FOOD_CLASSES)
    upf_ratio = upf_count / max(total, 1)
    score = max(0.0, min(100.0, 100 - (upf_ratio * 100)))

    return {
        "upf_score": round(score, 1),
        "upf_count": upf_count,
        "total_meals": total,
        "upf_percentage": round(upf_ratio * 100, 1),
    }


def compute_pe_ratio(meals: list[dict]) -> dict:
    if not meals:
        return {
            "pe_ratio_score": 50.0,
            "average_pe_ratio": 0.0,
            "target": 1.5,
        }

    pe_values = []
    for meal in meals:
        protein = meal.get("protein", 0)
        calories = meal.get("calories", 0)
        if calories > 0:
            pe_values.append(protein / (calories / 100))
        else:
            pe_values.append(0.0)

    avg_pe = sum(pe_values) / len(pe_values) if pe_values else 0.0
    score = min(avg_pe / 1.5, 1.0) * 100

    return {
        "pe_ratio_score": round(score, 1),
        "average_pe_ratio": round(avg_pe, 2),
        "target": 1.5,
    }


def compute_fiber_score(meals: list[dict]) -> dict:
    if not meals:
        return {
            "fiber_score": 50.0,
            "fiber_meals": 0,
            "target": 14,
        }

    fiber_meals = sum(1 for m in meals if m.get("food_class") in HIGH_FIBER_FOODS)
    score = min(fiber_meals / 14, 1.0) * 100

    return {
        "fiber_score": round(score, 1),
        "fiber_meals": fiber_meals,
        "target": 14,
    }


def compute_nutrient_timing(meals: list[dict]) -> dict:
    if not meals:
        return {
            "nutrient_timing_score": 50.0,
            "first_meal_hour": None,
            "last_meal_hour": None,
            "eating_window_hours": None,
            "breakdown": {
                "first_meal_score": 50.0,
                "last_meal_score": 50.0,
                "window_score": 50.0,
            },
        }

    hours = []
    for meal in meals:
        h = _parse_hour(meal.get("time"))
        if h is not None:
            hours.append(h)

    if not hours:
        return {
            "nutrient_timing_score": 50.0,
            "first_meal_hour": None,
            "last_meal_hour": None,
            "eating_window_hours": None,
            "breakdown": {
                "first_meal_score": 50.0,
                "last_meal_score": 50.0,
                "window_score": 50.0,
            },
        }

    first_hour = min(hours)
    last_hour = max(hours)
    window = last_hour - first_hour
    if window < 0:
        window += 24

    if first_hour <= 8:
        first_score = 100.0
    elif first_hour <= 10:
        first_score = 70.0
    else:
        first_score = 30.0

    if last_hour <= 19:
        last_score = 100.0
    elif last_hour <= 21:
        last_score = 60.0
    else:
        last_score = 20.0

    if window <= 10:
        window_score = 100.0
    elif window <= 12:
        window_score = 80.0
    elif window <= 14:
        window_score = 50.0
    else:
        window_score = 20.0

    score = first_score * 0.30 + last_score * 0.30 + window_score * 0.40

    return {
        "nutrient_timing_score": round(score, 1),
        "first_meal_hour": first_hour,
        "last_meal_hour": last_hour,
        "eating_window_hours": round(window, 1),
        "breakdown": {
            "first_meal_score": round(first_score, 1),
            "last_meal_score": round(last_score, 1),
            "window_score": round(window_score, 1),
        },
    }


def compute_compliance_score(intervention_history: list[dict], days: int = 7) -> dict:
    if not intervention_history:
        return {
            "compliance_score": 50.0,
            "followed": 0,
            "total": 0,
            "streak": 0,
        }

    total = len(intervention_history)
    followed = sum(1 for h in intervention_history if h.get("followed", False))

    max_streak = 0
    current_streak = 0
    for h in intervention_history:
        if h.get("followed", False):
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 0

    score = (followed / max(total, 1)) * 100

    return {
        "compliance_score": round(score, 1),
        "followed": followed,
        "total": total,
        "streak": max_streak,
    }


def compute_sleep_nutrition_correlation(meals: list[dict], sleep_scores: list[float]) -> dict:
    if not meals or not sleep_scores:
        return {
            "correlation_detected": False,
            "late_eating_days": 0,
            "normal_days": 0,
            "avg_sleep_late": 0.0,
            "avg_sleep_normal": 0.0,
            "message": "Nu s-a detectat un pattern",
        }

    meals_by_date: dict[str, list[int]] = {}
    for meal in meals:
        date_str = meal.get("date")
        if not date_str:
            continue
        h = _parse_hour(meal.get("time"))
        if h is None:
            continue
        if date_str not in meals_by_date:
            meals_by_date[date_str] = []
        meals_by_date[date_str].append(h)

    sorted_dates = sorted(meals_by_date.keys())
    late_sleep_scores = []
    normal_sleep_scores = []

    for i, date_str in enumerate(sorted_dates):
        if i >= len(sleep_scores):
            break
        last_hour = max(meals_by_date[date_str])
        if last_hour > 20:
            late_sleep_scores.append(sleep_scores[i])
        else:
            normal_sleep_scores.append(sleep_scores[i])

    late_count = len(late_sleep_scores)
    normal_count = len(normal_sleep_scores)

    if late_count == 0 or normal_count == 0:
        return {
            "correlation_detected": False,
            "late_eating_days": late_count,
            "normal_days": normal_count,
            "avg_sleep_late": round(sum(late_sleep_scores) / max(late_count, 1), 1),
            "avg_sleep_normal": round(sum(normal_sleep_scores) / max(normal_count, 1), 1),
            "message": "Nu s-a detectat un pattern",
        }

    avg_late = sum(late_sleep_scores) / late_count
    avg_normal = sum(normal_sleep_scores) / normal_count
    correlation_detected = avg_late < avg_normal

    message = (
        "Mesele târzii îți afectează somnul"
        if correlation_detected
        else "Nu s-a detectat un pattern"
    )

    return {
        "correlation_detected": correlation_detected,
        "late_eating_days": late_count,
        "normal_days": normal_count,
        "avg_sleep_late": round(avg_late, 1),
        "avg_sleep_normal": round(avg_normal, 1),
        "message": message,
    }


def compute_week_over_week_trends(current_week: dict, previous_week: dict) -> dict:
    if not current_week or not previous_week:
        return {
            "trends": {},
            "improving_metrics": [],
            "declining_metrics": [],
        }

    trends = {}
    improving = []
    declining = []

    for key in current_week:
        current_val = current_week.get(key, 0)
        previous_val = previous_week.get(key, 0)
        delta = round(current_val - previous_val, 1)

        if delta > 0:
            direction = "up"
            improving.append(key)
        elif delta < 0:
            direction = "down"
            declining.append(key)
        else:
            direction = "stable"

        trends[key] = {
            "delta": delta,
            "direction": direction,
            "current": current_val,
            "previous": previous_val,
        }

    return {
        "trends": trends,
        "improving_metrics": improving,
        "declining_metrics": declining,
    }


def generate_smart_recommendations(metrics: dict) -> list[dict]:
    if not metrics:
        return []

    gaps = []
    for metric_key, target in METRIC_TARGETS.items():
        current = metrics.get(metric_key)
        if current is None:
            continue
        gap = target - current
        if gap > 0:
            gaps.append((metric_key, current, target, gap))

    gaps.sort(key=lambda x: x[3], reverse=True)
    top_gaps = gaps[:3]

    recommendations = []
    for metric_key, current, target, gap in top_gaps:
        rec = METRIC_RECOMMENDATIONS.get(metric_key, {})
        impact_years = (gap / 10) * 0.15
        recommendations.append({
            "title": rec.get("title", metric_key),
            "description": rec.get("description", ""),
            "metric": metric_key,
            "current": round(current, 1),
            "target": target,
            "impact": f"-{round(impact_years, 1)} ani",
        })

    return recommendations
