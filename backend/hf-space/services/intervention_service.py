from typing import Optional

from services.bio_age_service import compute_leverage_point

# Dimension score fields stored on BioAgeSnapshot records (Prisma) and
# sent back in user_history. Keep in sync with frontend BioAgeSnapshot type.
_SNAPSHOT_DIM_FIELDS = {
    "nutrition": "nutritionScore",
    "sleep":     "sleepScore",
    "ans":       "ansScore",
    "movement":  "movementScore",
    "light":     "lightScore",
    "subjective": "subjectiveScore",
}

# Dose-gain scale (mirrors DOSE_GAINS in bio_age_service) — used to
# normalize the trend bonus so a 10% drop maps to a meaningful uplift.
_DIM_MAX_GAIN = 1.8  # max DOSE_GAINS value (sleep)


def compute_trend_bonuses(history: Optional[list[dict]]) -> dict[str, float]:
    """Compute per-dimension priority bonuses from the user's recent history.

    Compares the mean dimension score over the last 3 snapshots with the
    mean over snapshots 4..7 (the prior 4). For each dimension where the
    recent mean dropped by more than 10% relative to the prior mean, a
    bonus is added proportional to the magnitude of the decline (capped
    so the bonus can swing the leverage selection but not dominate it).

    Snapshots are expected in chronological order (oldest first). Each
    snapshot must expose dimension score fields (nutritionScore,
    sleepScore, ansScore, movementScore, lightScore, subjectiveScore).
    """
    if not history or len(history) < 4:
        return {}

    # Take the most recent 7 (oldest first), so slicing is predictable.
    recent = history[-7:]
    recent_count = len(recent)

    # last 3 days vs prior 4 days
    recent_block = recent[-3:] if recent_count >= 3 else recent
    prior_block = recent[:-3] if recent_count > 3 else []

    if not prior_block:
        return {}

    bonuses: dict[str, float] = {}
    for dim, field in _SNAPSHOT_DIM_FIELDS.items():
        recent_vals = [float(s.get(field)) for s in recent_block if s.get(field) is not None]
        prior_vals = [float(s.get(field)) for s in prior_block if s.get(field) is not None]
        if not recent_vals or not prior_vals:
            continue

        recent_mean = sum(recent_vals) / len(recent_vals)
        prior_mean = sum(prior_vals) / len(prior_vals)
        if prior_mean <= 0:
            continue

        drop_ratio = (prior_mean - recent_mean) / prior_mean  # >0 means decline
        if drop_ratio <= 0.10:
            continue

        # Map a 10%+ drop to a bonus. Scale the bonus so a 50% drop saturates
        # the leverage bonus to ~half the max dose-gain, ensuring declining
        # dimensions are prioritized without overwhelming current-score room.
        normalized_drop = min(drop_ratio, 0.50) / 0.50  # 0..1
        bonuses[dim] = round(_DIM_MAX_GAIN * 0.5 * normalized_drop, 3)

    return bonuses


def get_todays_intervention(
    user_id: str,
    chronological_age: int,
    metrics: Optional[dict] = None,
    north_star: Optional[str] = None,
    user_history: Optional[list[dict]] = None,
) -> dict:
    """Personalize today's intervention using real user history.

    `user_history` is the list of recent BioAgeSnapshot records (last ~7
    days) sent by the frontend from Prisma. We derive per-dimension
    trend bonuses (recent-3-days vs days-4-7) and pass them to
    `compute_leverage_point` so dimensions in decline get priority
    uplift on top of the standard room-to-improve ranking.
    """
    trend_bonuses = compute_trend_bonuses(user_history)
    return compute_leverage_point(
        chronological_age,
        metrics,
        north_star=north_star,
        trend_bonuses=trend_bonuses,
    )