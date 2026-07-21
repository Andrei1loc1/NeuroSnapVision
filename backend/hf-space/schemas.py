from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class Targets(BaseModel):
    calories: float = 0
    protein: float = 0
    fats: float = 0


class RecommendationRequest(BaseModel):
    protein: float = 0
    calories: float = 0
    fats: float = 0
    late_meals_count: int = 0
    days_on_target: int = 0
    targets: dict = Field(default_factory=dict)


class HealthyScoreRequest(BaseModel):
    calories: float = 0
    target_calories: float = 0
    protein: float = 0
    target_protein: float = 0
    fats: float = 0
    target_fats: float = 0
    late_meals_count: int = 0
    days_on_target: int = 0


class MealItem(BaseModel):
    food_class: str


class MindScoreRequest(BaseModel):
    meals: list[MealItem]


class MorningProtocolRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str
    date: str
    protocols: list[dict] = Field(default_factory=list)
    mood: int = Field(5, ge=1, le=5)
    energy: int = Field(5, ge=1, le=5)
    recovery: int = Field(5, ge=1, le=5)
    sleep_hours: float = Field(7.0, ge=0, le=24)
    hrv_reading: Optional[dict] = None
    digestion: int = Field(5, ge=1, le=5)
    stress: int = Field(5, ge=1, le=5)
    sleep_quality: int = Field(5, ge=1, le=5)
    libido: int = Field(5, ge=1, le=5)
    focus: int = Field(5, ge=1, le=5)
    morningLight: Optional[bool] = None


class EveningProtocolRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str
    date: str
    protocols: list[dict] = Field(default_factory=list)
    stress: int = Field(5, ge=1, le=5)
    digestion: int = Field(5, ge=1, le=5)
    mood: int = Field(5, ge=1, le=5)
    energy: int = Field(5, ge=1, le=5)
    supplements: list[str] = Field(default_factory=list)
    last_meal_time: Optional[str] = None
    social_connection: int = Field(5, ge=1, le=5, alias="socialConnection")
    oral_health: int = Field(5, ge=1, le=5, alias="oralHealth")
    cold_exposure: bool = False
    heat_exposure: bool = False
    caffeine_cutoff: Optional[str] = None
    screen_cutoff: Optional[str] = None
    focus: int = Field(5, ge=1, le=5)
    libido: int = Field(5, ge=1, le=5)
    gratitude: str = ""
    wins: str = ""


class WorkoutLogRequest(BaseModel):
    user_id: str
    type: str
    intensity: int = Field(..., ge=1, le=10)
    duration_min: int = Field(..., ge=0)
    date: str
    exercises: list[dict] = Field(default_factory=list)
    notes: str = ""


class CircadianScoreRequest(BaseModel):
    user_id: str
    date: str
    meals: list[dict] = Field(default_factory=list)
    first_meal_time: Optional[str] = None
    last_meal_time: Optional[str] = None


class HRVProcessRequest(BaseModel):
    signal_data: list[float] = Field(default_factory=list)
    sample_rate: int = Field(30, ge=1)


class AllostaticLoadRequest(BaseModel):
    hrv_readings: list[dict] = Field(default_factory=list)
    stress_events: list[dict] = Field(default_factory=list)
    protocols: list[dict] = Field(default_factory=list)


class BioAgeTargets(BaseModel):
    calories: float = 0
    protein: float = 0
    fats: float = 0


class BioAgeRequest(BaseModel):
    """Raw user data payload for /bio-age/snapshot.

    Frontend collects meals, protocols, workouts and hrv_readings from
    Prisma plus targets/subjective scores from localStorage and posts
    them here. The backend derives per-dimension scores internally via
    bio_age_service.compute_bio_age_from_raw_data.
    """
    user_id: str = ""
    chronological_age: int = Field(..., ge=0, le=120)
    sex: str = "male"
    meals: list[dict] = Field(default_factory=list)
    protocols: list[dict] = Field(default_factory=list)
    workouts: list[dict] = Field(default_factory=list)
    hrv_readings: list[dict] = Field(default_factory=list)
    targets: BioAgeTargets = Field(default_factory=BioAgeTargets)
    late_meal_threshold: int = 21
    first_meal_time: Optional[str] = None
    last_meal_time: Optional[str] = None
    today: Optional[str] = None
    intervention_history: Optional[list[dict]] = None
    history: list[dict] = Field(default_factory=list)


class InterventionRequest(BaseModel):
    """Payload for /intervention/today.

    `user_history` is the list of recent BioAgeSnapshot records (last ~7
    days) collected from Prisma by the frontend. Each snapshot must
    expose dimension score fields (nutritionScore, sleepScore, ansScore,
    movementScore, lightScore, subjectiveScore) so the backend can
    compute per-dimension trend bonuses for declining dimensions.
    """
    user_id: str = ""
    chronological_age: int = Field(..., ge=0, le=120)
    north_star: Optional[str] = None
    metrics: Optional[dict] = None
    user_history: list[dict] = Field(default_factory=list)