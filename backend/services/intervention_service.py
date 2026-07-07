from services.bio_age_service import compute_leverage_point


def get_todays_intervention(user_id: str, chronological_age: int, metrics: dict = None, north_star: str = None) -> dict:
    return compute_leverage_point(chronological_age, metrics, north_star=north_star)
