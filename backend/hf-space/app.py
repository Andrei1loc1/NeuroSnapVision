import os  # v2.1
import logging
import sys
import time
import traceback
import uuid
from datetime import date
from typing import Literal
from fastapi import FastAPI, UploadFile, File, Query, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from schemas import (
    RecommendationRequest,
    HealthyScoreRequest,
    MindScoreRequest,
    MorningProtocolRequest,
    EveningProtocolRequest,
    WorkoutLogRequest,
    CircadianScoreRequest,
    BioAgeRequest,
    InterventionRequest,
)

START_TIME = time.time()
APP_VERSION = "1.0.0"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

DEBUG = os.environ.get("DEBUG", "").lower() == "true"

app = FastAPI()


def _client_key_func(request: Request) -> str:
    """Rate-limit key: prefer X-Forwarded-For (real client IP behind HF proxy), fall back to client address."""
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


limiter = Limiter(key_func=_client_key_func)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    retry_after = getattr(exc, "retry_after", None)
    if retry_after is None and exc.limit:
        retry_after = exc.limit.period
    content = {
        "error": "Rate limit exceeded",
        "code": "RATE_LIMIT",
        "retry_after": retry_after,
    }
    return JSONResponse(status_code=429, content=content)

_ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
] or ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


_PUBLIC_PATHS = {"/", "/health"}


@app.middleware("http")
async def internal_token_middleware(request: Request, call_next):
    path = request.url.path
    if path in _PUBLIC_PATHS:
        return await call_next(request)

    expected_token = os.environ.get("INTERNAL_API_TOKEN")
    if not expected_token:
        logger.warning(
            "INTERNAL_API_TOKEN not set — internal auth disabled (dev mode)."
        )
        return await call_next(request)

    provided = request.headers.get("X-Internal-Token")
    if not provided or provided != expected_token:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.warning(
            "Unauthorized internal request [request_id=%s] path=%s", request_id, path
        )
        return JSONResponse(
            status_code=401,
            content={"error": "Unauthorized", "code": "UNAUTHORIZED", "request_id": request_id},
        )
    return await call_next(request)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


def _get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unknown")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = _get_request_id(request)
    logger.error(
        "Unhandled exception [request_id=%s] %s: %s\n%s",
        request_id, type(exc).__name__, exc, traceback.format_exc(),
    )
    content = {
        "error": "Internal server error",
        "code": "INTERNAL",
        "request_id": request_id,
    }
    if DEBUG:
        content["detail"] = str(exc)
    return JSONResponse(status_code=500, content=content)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    request_id = _get_request_id(request)
    logger.warning("HTTPException [request_id=%s] status=%s detail=%s", request_id, exc.status_code, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "code": "HTTP_ERROR", "request_id": request_id},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = _get_request_id(request)
    logger.warning("ValidationError [request_id=%s] %s", request_id, exc.errors())
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation error",
            "code": "VALIDATION",
            "request_id": request_id,
            "details": exc.errors(),
        },
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
_get_bio_age_snapshot_from_raw_data = None
_log_workout = None
_get_weekly_movement_score = None
_get_todays_intervention = None
_score_circadian_nutrition = None


def _load_services():
    global _predict_food, _calculate_healthy_score, _calculate_mind_score
    global _get_multi_agent_recommendation
    global _submit_morning_checkin, _submit_evening_checkin, _get_daily_protocol, _get_compliance_streak
    global _get_bio_age_snapshot, _get_bio_age_history, _get_bio_age_snapshot_from_raw_data
    global _log_workout, _get_weekly_movement_score
    global _get_todays_intervention, _score_circadian_nutrition

    if _predict_food is not None:
        return

    from services.nutrition_service import calculate_healthy_score
    from services.mind_score_service import calculate_mind_score
    from agents.multi_agent_service import get_multi_agent_recommendation
    from services.protocol_service import submit_morning_checkin, submit_evening_checkin, get_daily_protocol, get_compliance_streak
    from services.bio_age_service import get_bio_age_snapshot, get_bio_age_history, get_bio_age_snapshot_from_raw_data
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
    _get_bio_age_snapshot_from_raw_data = get_bio_age_snapshot_from_raw_data
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


def _model_loaded(module_name: str, attr: str) -> bool:
    """Check if a model global was loaded without triggering import side effects. Returns False if not loaded yet."""
    try:
        mod = sys.modules.get(module_name)
        if mod is None:
            return False
        return getattr(mod, attr, None) is not None
    except Exception:
        return False


@app.get("/health")
def health():
    # Lightweight, no model loading, <10ms. Inspects already-loaded globals only.
    yolo_loaded = _model_loaded("services.prediction_service", "yolo_model")
    classifier_loaded = _model_loaded("services.prediction_service", "classifier_model")
    mind_model_loaded = _model_loaded("services.mind_score_service", "mind_model")
    return {
        "status": "ok",
        "models_loaded": yolo_loaded and classifier_loaded and mind_model_loaded,
        "yolo_loaded": yolo_loaded,
        "classifier_loaded": classifier_loaded,
        "mind_model_loaded": mind_model_loaded,
        "uptime_seconds": time.time() - START_TIME,
        "version": APP_VERSION,
    }


@app.post("/scan")
@limiter.limit("10/minute")
async def predict(request: Request, portion: Literal["small", "medium", "large"] = Query("medium")):
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
        request_id = _get_request_id(request)
        logger.error("Predict error [request_id=%s] %s: %s\n%s", request_id, type(e).__name__, e, traceback.format_exc())
        content = {
            "error": "Internal server error",
            "code": "INTERNAL",
            "request_id": request_id,
        }
        if DEBUG:
            content["detail"] = str(e)
        return JSONResponse(status_code=500, content=content)


# Keep /predict as alias
@app.post("/predict")
@limiter.limit("10/minute")
async def predict_alias(request: Request, portion: Literal["small", "medium", "large"] = Query("medium")):
    return await predict(request, portion)


@app.post("/predict-raw")
@limiter.limit("10/minute")
async def predict_raw(request: Request):
    """Test endpoint that reads raw body without UploadFile."""
    logger.info("predict-raw endpoint called")
    try:
        body = await request.body()
        logger.info(f"Raw body size: {len(body)}")
        return {"size": len(body), "preview": body[:100].hex()}
    except BaseException as e:
        request_id = _get_request_id(request)
        logger.error("predict-raw error [request_id=%s] %s: %s\n%s", request_id, type(e).__name__, e, traceback.format_exc())
        content = {
            "error": "Internal server error",
            "code": "INTERNAL",
            "request_id": request_id,
        }
        if DEBUG:
            content["detail"] = str(e)
        return JSONResponse(status_code=500, content=content)


@app.get("/debug/error")
async def debug_error():
    # Protected by internal_token_middleware (401 without token). Additionally require DEBUG=true.
    if not DEBUG:
        return JSONResponse(
            status_code=403,
            content={"error": "Debug endpoint requires DEBUG=true", "code": "HTTP_ERROR"},
        )
    has_error = os.path.exists("/tmp/predict_error.txt")
    return {"has_error": has_error}


@app.post("/recommendation")
@limiter.limit("60/minute")
async def recommendation(request: Request, data: RecommendationRequest):
    _load_services()
    return _get_multi_agent_recommendation(data.model_dump())


@app.post("/healthy-score")
@limiter.limit("60/minute")
async def healthy_score(request: Request, data: HealthyScoreRequest):
    _load_services()
    return _calculate_healthy_score(data.model_dump())


@app.post("/mind-score")
@limiter.limit("60/minute")
async def mind_score(request: Request, data: MindScoreRequest):
    _load_services()
    return _calculate_mind_score([m.model_dump() for m in data.meals])


@app.post("/protocol/morning")
@limiter.limit("120/minute")
async def protocol_morning(request: Request, data: MorningProtocolRequest):
    _load_services()
    user_id = data.user_id
    target_date = date.fromisoformat(data.date)
    protocols = data.protocols
    protocol = _submit_morning_checkin(user_id, target_date, data.model_dump(by_alias=True), protocols)
    streak = protocol.get("streak", 0)
    return {"protocol": protocol, "streak": streak}


@app.post("/protocol/evening")
@limiter.limit("120/minute")
async def protocol_evening(request: Request, data: EveningProtocolRequest):
    _load_services()
    user_id = data.user_id
    target_date = date.fromisoformat(data.date)
    protocols = data.protocols
    protocol = _submit_evening_checkin(user_id, target_date, data.model_dump(by_alias=True), protocols)
    streak = protocol.get("streak", 0)
    is_complete = protocol.get("isComplete", False)
    return {"protocol": protocol, "streak": streak, "is_complete": is_complete}


@app.get("/protocol/today")
@limiter.limit("120/minute")
async def protocol_today(request: Request, user_id: str = Query(...)):
    _load_services()
    protocols = []
    target_date = date.today()
    protocol = _get_daily_protocol(user_id, target_date, protocols, None)
    streak = _get_compliance_streak(user_id, protocols)
    return {"protocol": protocol, "streak": streak}


@app.post("/bio-age/snapshot")
@limiter.limit("120/minute")
async def bio_age_snapshot(request: Request, req: BioAgeRequest):
    _load_services()
    raw_data = {
        "meals": req.meals,
        "protocols": req.protocols,
        "workouts": req.workouts,
        "hrv_readings": req.hrv_readings,
        "targets": req.targets.model_dump(),
        "late_meal_threshold": req.late_meal_threshold,
        "first_meal_time": req.first_meal_time,
        "last_meal_time": req.last_meal_time,
        "today": req.today,
        "sex": req.sex,
        "interventionHistory": req.intervention_history,
    }
    return _get_bio_age_snapshot_from_raw_data(
        req.chronological_age, raw_data, req.history
    )


@app.get("/bio-age/current")
@limiter.limit("120/minute")
async def bio_age_current(request: Request, user_id: str = Query(...), age: int = Query(...)):
    _load_services()
    return _get_bio_age_snapshot(age)


@app.get("/bio-age/history")
@limiter.limit("120/minute")
async def bio_age_history(request: Request, user_id: str = Query(...), days: int = Query(90)):
    _load_services()
    return _get_bio_age_history(user_id, days)


@app.post("/workout/log")
@limiter.limit("120/minute")
async def workout_log(request: Request, data: WorkoutLogRequest):
    _load_services()
    user_id = data.user_id
    workout = _log_workout(user_id, data.model_dump())
    return {"workout": workout}


@app.get("/workout/weekly")
@limiter.limit("120/minute")
async def workout_weekly(request: Request, user_id: str = Query(...), week_start: str = Query(default=None)):
    _load_services()
    start = date.fromisoformat(week_start) if week_start else date.today()
    workouts = []
    result = _get_weekly_movement_score(user_id, start, workouts)
    return {"movement_score": result["movementScore"], "breakdown": result["breakdown"]}


@app.post("/intervention/today")
@limiter.limit("120/minute")
async def intervention_today(request: Request, data: InterventionRequest):
    _load_services()
    return _get_todays_intervention(
        data.user_id,
        data.chronological_age,
        metrics=data.metrics,
        north_star=data.north_star,
        user_history=data.user_history,
    )


@app.post("/circadian/score")
@limiter.limit("60/minute")
async def circadian_score(request: Request, data: CircadianScoreRequest):
    _load_services()
    user_id = data.user_id
    target_date = data.date
    meals = data.meals
    first_meal_time = data.first_meal_time
    last_meal_time = data.last_meal_time
    return _score_circadian_nutrition(user_id, target_date, meals, first_meal_time, last_meal_time)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)