import os  # v2.1
import logging
from datetime import date
from fastapi import FastAPI, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Lazy model loading ──────────────────────────────────────
_predict_food = None
_calculate_healthy_score = None
_calculate_mind_score = None
_get_multi_agent_recommendation = None
_submit_morning_checkin = None
_submit_evening_checkin = None
_get_daily_protocol = None
_get_compliance_streak = None
_get_bio_age_snapshot = None
_get_bio_age_history = None
_log_workout = None
_get_weekly_movement_score = None
_get_todays_intervention = None
_score_circadian_nutrition = None


def _load_services():
    global _predict_food, _calculate_healthy_score, _calculate_mind_score
    global _get_multi_agent_recommendation
    global _submit_morning_checkin, _submit_evening_checkin, _get_daily_protocol, _get_compliance_streak
    global _get_bio_age_snapshot, _get_bio_age_history
    global _log_workout, _get_weekly_movement_score
    global _get_todays_intervention, _score_circadian_nutrition

    if _predict_food is not None:
        return

    from services.nutrition_service import calculate_healthy_score
    from services.mind_score_service import calculate_mind_score
    from agents.multi_agent_service import get_multi_agent_recommendation
    from services.protocol_service import submit_morning_checkin, submit_evening_checkin, get_daily_protocol, get_compliance_streak
    from services.bio_age_service import get_bio_age_snapshot, get_bio_age_history
    from services.workout_service import log_workout, get_weekly_movement_score
    from services.intervention_service import get_todays_intervention
    from services.circadian_service import score_circadian_nutrition

    _calculate_healthy_score = calculate_healthy_score
    _calculate_mind_score = calculate_mind_score
    _get_multi_agent_recommendation = get_multi_agent_recommendation
    _submit_morning_checkin = submit_morning_checkin
    _submit_evening_checkin = submit_evening_checkin
    _get_daily_protocol = get_daily_protocol
    _get_compliance_streak = get_compliance_streak
    _get_bio_age_snapshot = get_bio_age_snapshot
    _get_bio_age_history = get_bio_age_history
    _log_workout = log_workout
    _get_weekly_movement_score = get_weekly_movement_score
    _get_todays_intervention = get_todays_intervention
    _score_circadian_nutrition = score_circadian_nutrition

    try:
        from services.prediction_service import predict_food
        _predict_food = predict_food
        logger.info("Prediction service loaded successfully")
    except Exception as e:
        logger.error(f"Prediction service unavailable: {e}")
        import traceback
        traceback.print_exc()


@app.on_event("startup")
async def startup_event():
    logger.info("=== NeuroSnap Vision Backend Starting ===")
    try:
        _load_services()
        logger.info(f"Services loaded. predict_available: {_predict_food is not None}")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        import traceback
        traceback.print_exc()
    logger.info("=== Startup Complete ===")


@app.get("/")
def root():
    return {
        "message": "NeuroSnap Vision backend is running",
        "status": "ok",
        "predict_available": _predict_food is not None,
    }


@app.post("/scan")
async def predict(request: Request, portion: str = "medium"):
    logger.info(f"Scan endpoint called, portion={portion}")
    _load_services()
    if _predict_food is None:
        return {"error": "Prediction service unavailable", "detail": "Models failed to load"}
    try:
        image_bytes = await request.body()
        logger.info(f"Received image: {len(image_bytes)} bytes")
        if len(image_bytes) == 0:
            return {"error": "Empty image"}
        result = _predict_food(image_bytes, portion)
        logger.info(f"Prediction result: {result.get('food_class', 'unknown')}")
        return result
    except BaseException as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Predict error: {e}")
        with open("/tmp/predict_error.txt", "w") as f:
            f.write(f"Error: {type(e).__name__}: {e}\n\nTraceback:\n{tb}")
        from fastapi.responses import JSONResponse
        return JSONResponse(content={"error": str(e), "type": type(e).__name__, "traceback": tb}, status_code=500)

# Keep /predict as alias
@app.post("/predict")
async def predict_alias(request: Request, portion: str = "medium"):
    return await predict(request, portion)


@app.post("/predict-raw")
async def predict_raw(request: Request):
    """Test endpoint that reads raw body without UploadFile."""
    logger.info("predict-raw endpoint called")
    try:
        body = await request.body()
        logger.info(f"Raw body size: {len(body)}")
        with open("/tmp/predict_error.txt", "w") as f:
            f.write(f"Raw body size: {len(body)}")
        return {"size": len(body), "preview": body[:100].hex()}
    except BaseException as e:
        import traceback
        tb = traceback.format_exc()
        with open("/tmp/predict_error.txt", "w") as f:
            f.write(f"Raw error: {type(e).__name__}: {e}\n\n{tb}")
        from fastapi.responses import JSONResponse
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/debug/error")
async def debug_error():
    try:
        with open("/tmp/predict_error.txt", "r") as f:
            return {"error_log": f.read()}
    except FileNotFoundError:
        return {"error_log": "No errors logged yet"}


@app.post("/recommendation")
async def recommendation(data: dict):
    _load_services()
    return _get_multi_agent_recommendation(data)


@app.post("/healthy-score")
async def healthy_score(data: dict):
    _load_services()
    return _calculate_healthy_score(data)


@app.post("/mind-score")
async def mind_score(data: dict):
    _load_services()
    return _calculate_mind_score(data["meals"])


@app.post("/protocol/morning")
async def protocol_morning(data: dict):
    _load_services()
    user_id = data["user_id"]
    target_date = date.fromisoformat(data["date"])
    protocols = data.get("protocols", [])
    protocol = _submit_morning_checkin(user_id, target_date, data, protocols)
    streak = protocol.get("streak", 0)
    return {"protocol": protocol, "streak": streak}


@app.post("/protocol/evening")
async def protocol_evening(data: dict):
    _load_services()
    user_id = data["user_id"]
    target_date = date.fromisoformat(data["date"])
    protocols = data.get("protocols", [])
    protocol = _submit_evening_checkin(user_id, target_date, data, protocols)
    streak = protocol.get("streak", 0)
    is_complete = protocol.get("isComplete", False)
    return {"protocol": protocol, "streak": streak, "is_complete": is_complete}


@app.get("/protocol/today")
async def protocol_today(user_id: str = Query(...)):
    _load_services()
    protocols = []
    target_date = date.today()
    protocol = _get_daily_protocol(user_id, target_date, protocols, None)
    streak = _get_compliance_streak(user_id, protocols)
    return {"protocol": protocol, "streak": streak}


@app.get("/bio-age/current")
async def bio_age_current(user_id: str = Query(...), age: int = Query(...)):
    _load_services()
    return _get_bio_age_snapshot(age)


@app.get("/bio-age/history")
async def bio_age_history(user_id: str = Query(...), days: int = Query(90)):
    _load_services()
    return _get_bio_age_history(user_id, days)


@app.post("/workout/log")
async def workout_log(data: dict):
    _load_services()
    user_id = data["user_id"]
    workout = _log_workout(user_id, data)
    return {"workout": workout}


@app.get("/workout/weekly")
async def workout_weekly(user_id: str = Query(...), week_start: str = Query(default=None)):
    _load_services()
    start = date.fromisoformat(week_start) if week_start else date.today()
    workouts = []
    result = _get_weekly_movement_score(user_id, start, workouts)
    return {"movement_score": result["movementScore"], "breakdown": result["breakdown"]}


@app.get("/intervention/today")
async def intervention_today(user_id: str = Query(...), age: int = Query(...), north_star: str = Query(default=None)):
    _load_services()
    return _get_todays_intervention(user_id, age, north_star=north_star)


@app.post("/circadian/score")
async def circadian_score(data: dict):
    _load_services()
    user_id = data["user_id"]
    target_date = data["date"]
    meals = data.get("meals", [])
    first_meal_time = data.get("first_meal_time")
    last_meal_time = data.get("last_meal_time")
    return _score_circadian_nutrition(user_id, target_date, meals, first_meal_time, last_meal_time)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)