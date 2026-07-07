from datetime import date
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from services.nutrition_service import calculate_healthy_score
try:
    from services.prediction_service import predict_food
except ImportError:
    predict_food = None
from agents.multi_agent_service import get_multi_agent_recommendation
from services.mind_score_service import calculate_mind_score
from services.protocol_service import submit_morning_checkin, submit_evening_checkin, get_daily_protocol, get_compliance_streak
from services.bio_age_service import get_bio_age_snapshot, get_bio_age_history
from services.workout_service import log_workout, get_weekly_movement_score
from services.intervention_service import get_todays_intervention
from services.circadian_service import score_circadian_nutrition
from services.solar_service import calculate_solar_window
from services.hrv_service import process_ppg_signal, get_breathing_exercise
from services.allostatic_service import compute_daily_allostatic_load, compute_cumulative_load, determine_trend, get_allostatic_trajectory

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "NeuroSnap Vision backend is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...), portion: str = "medium"):
    if predict_food is None:
        return {"error": "Prediction service unavailable (tensorflow not installed)"}
    image_bytes = await file.read()
    return predict_food(image_bytes, portion)


@app.post("/recommendation")
async def recommendation(data: dict):
    return get_multi_agent_recommendation(data)


@app.post("/healthy-score")
async def healthy_score(data: dict):
    return calculate_healthy_score(data)


@app.post("/mind-score")
async def mind_score(data: dict):
    return calculate_mind_score(data["meals"])


@app.post("/protocol/morning")
async def protocol_morning(data: dict):
    user_id = data["user_id"]
    target_date = date.fromisoformat(data["date"])
    protocols = data.get("protocols", [])
    streak = 0
    protocol = submit_morning_checkin(user_id, target_date, data, protocols)
    streak = protocol.get("streak", 0)
    return {"protocol": protocol, "streak": streak}


@app.post("/protocol/evening")
async def protocol_evening(data: dict):
    user_id = data["user_id"]
    target_date = date.fromisoformat(data["date"])
    protocols = data.get("protocols", [])
    protocol = submit_evening_checkin(user_id, target_date, data, protocols)
    streak = protocol.get("streak", 0)
    is_complete = protocol.get("isComplete", False)
    return {"protocol": protocol, "streak": streak, "is_complete": is_complete}


@app.get("/protocol/today")
async def protocol_today(user_id: str = Query(...)):
    protocols = []
    target_date = date.today()
    previous = None
    protocol = get_daily_protocol(user_id, target_date, protocols, previous)
    streak = get_compliance_streak(user_id, protocols)
    return {"protocol": protocol, "streak": streak}


@app.get("/bio-age/current")
async def bio_age_current(user_id: str = Query(...), age: int = Query(...)):
    result = get_bio_age_snapshot(age)
    return result


@app.get("/bio-age/history")
async def bio_age_history(user_id: str = Query(...), days: int = Query(90)):
    result = get_bio_age_history(user_id, days)
    return result


@app.post("/workout/log")
async def workout_log(data: dict):
    user_id = data["user_id"]
    workout = log_workout(user_id, data)
    return {"workout": workout}


@app.get("/workout/weekly")
async def workout_weekly(user_id: str = Query(...), week_start: str = Query(default=None)):
    start = date.fromisoformat(week_start) if week_start else date.today()
    workouts = []
    result = get_weekly_movement_score(user_id, start, workouts)
    return {"movement_score": result["movementScore"], "breakdown": result["breakdown"]}


@app.get("/intervention/today")
async def intervention_today(user_id: str = Query(...), age: int = Query(...), north_star: str = Query(default=None)):
    result = get_todays_intervention(user_id, age, north_star=north_star)
    return result


@app.post("/circadian/score")
async def circadian_score(data: dict):
    user_id = data["user_id"]
    target_date = data["date"]
    meals = data.get("meals", [])
    first_meal_time = data.get("first_meal_time")
    last_meal_time = data.get("last_meal_time")
    result = score_circadian_nutrition(user_id, target_date, meals, first_meal_time, last_meal_time)
    return result


@app.get("/solar-window")
async def solar_window(
    latitude: float = Query(...),
    longitude: float = Query(...),
    wake_time: str = Query(...),
    sleep_time: str = Query(...),
    timezone_offset: float = Query(0.0),
):
    return calculate_solar_window(latitude, longitude, wake_time, sleep_time, timezone_offset)


@app.post("/hrv/process")
async def hrv_process(data: dict):
    signal_data = data.get("signal_data", [])
    sample_rate = data.get("sample_rate", 30)
    return process_ppg_signal(signal_data, sample_rate)


@app.get("/hrv/breathing")
async def hrv_breathing(duration_sec: int = Query(60)):
    return get_breathing_exercise(duration_sec)


@app.get("/allostatic/load")
async def allostatic_load(user_id: str = Query(...)):
    hrv_readings = []
    stress_events = []
    protocols = []
    return compute_daily_allostatic_load(hrv_readings, stress_events, protocols)


@app.post("/allostatic/load")
async def allostatic_load_compute(data: dict):
    hrv_readings = data.get("hrv_readings", [])
    stress_events = data.get("stress_events", [])
    protocols = data.get("protocols", [])
    return compute_daily_allostatic_load(hrv_readings, stress_events, protocols)


@app.get("/allostatic/trajectory")
async def allostatic_trajectory(user_id: str = Query(...), days: int = Query(30)):
    return get_allostatic_trajectory(user_id, days)