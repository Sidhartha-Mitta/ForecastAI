from datetime import date, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

from app.schemas.request import (
    ExplainRequest,
    NextDaysRequest,
    PredictRequest,
    RangePredictRequest,
    YearPredictRequest,
)
from app.schemas.response import AggregatePredictResponse, ExplainResponse, MetaResponse, PredictResponse
from app.services.preprocess import preprocess_batch, preprocess_input
from app.core.model import lstm
from app.core.predictor import hybrid_predict, hybrid_predict_batch
from app.config import CITY_LIST

from app.services.explanation import generate_explanation, generate_period_explanation
from app.services.alert import generate_alert
from app.services.trend import generate_trend
from app.services.agriculture import generate_advice
from app.services.forecast import multi_day_forecast

APP_NAME = "Forecast AI"
FORECAST_DAYS = 7

app = FastAPI(title=f"{APP_NAME} API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SEQ_LEN = lstm.input_shape[1]


def normalize_city(city: str) -> str:
    requested = city.strip().lower()
    city_lookup = {name.lower(): name for name in CITY_LIST}

    if requested not in city_lookup:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported city '{city}'. Choose one of: {', '.join(CITY_LIST)}."
        )

    return city_lookup[requested]


def build_day_prediction(city: str, request_date: str):
    X, month = preprocess_input(request_date, city)
    last_seq = np.repeat(X.astype(np.float32), SEQ_LEN, axis=0)
    pred = hybrid_predict(X, last_seq)

    return {
        "city": city,
        "date": request_date,
        "temperature_max": float(pred[0]),
        "temperature_min": float(pred[1]),
        "rainfall": float(pred[3]),
        "explanation": generate_explanation(pred, month, city, request_date),
        "alert": generate_alert(pred),
        "trend": generate_trend(pred),
        "advice": generate_advice(pred),
        "forecast": multi_day_forecast(X, last_seq, days=FORECAST_DAYS),
    }


def iterate_dates(start_date: date, end_date: date):
    dates = []
    current = start_date

    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)

    return dates


def aggregate_predictions(city: str, mode: str, dates: list[date]):
    if not dates:
        raise HTTPException(status_code=400, detail="At least one date is required.")

    if len(dates) > 366:
        raise HTTPException(status_code=400, detail="Requested period is too large.")

    date_strings = [current_date.isoformat() for current_date in dates]
    X_batch, months = preprocess_batch(date_strings, city)
    seq_batch = np.repeat(X_batch[:, np.newaxis, :].astype(np.float32), SEQ_LEN, axis=1)
    preds = hybrid_predict_batch(X_batch, seq_batch)

    day_payloads = []
    for request_date, pred, month in zip(date_strings, preds, months):
        day_payloads.append({
            "city": city,
            "date": request_date,
            "temperature_max": float(pred[0]),
            "temperature_min": float(pred[1]),
            "rainfall": float(pred[3]),
            "explanation": generate_explanation(pred, int(month), city, request_date),
            "alert": generate_alert(pred),
            "trend": generate_trend(pred),
            "advice": generate_advice(pred),
        })

    rainfall_total = sum(day["rainfall"] for day in day_payloads)
    average_max = sum(day["temperature_max"] for day in day_payloads) / len(day_payloads)
    average_min = sum(day["temperature_min"] for day in day_payloads) / len(day_payloads)
    hottest_day = max(day_payloads, key=lambda item: item["temperature_max"])
    wettest_day = max(day_payloads, key=lambda item: item["rainfall"])

    return {
        "mode": mode,
        "city": city,
        "generated_at": date.today().isoformat(),
        "start_date": day_payloads[0]["date"],
        "end_date": day_payloads[-1]["date"],
        "total_days": len(day_payloads),
        "rainfall_total": rainfall_total,
        "average_max": average_max,
        "average_min": average_min,
        "hottest_day": hottest_day["date"],
        "hottest_value": hottest_day["temperature_max"],
        "wettest_day": wettest_day["date"],
        "wettest_value": wettest_day["rainfall"],
        "days": day_payloads,
    }


def build_explanation(city: str, dates: list[date]):
    aggregate = aggregate_predictions(city, "explain", dates)
    return generate_period_explanation(city, aggregate)

@app.get("/")
def home():
    return {
        "message": f"{APP_NAME} API running",
        "supported_cities": CITY_LIST,
        "forecast_days": FORECAST_DAYS,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/meta", response_model=MetaResponse)
def meta():
    return {
        "app_name": APP_NAME,
        "supported_cities": CITY_LIST,
        "forecast_days": FORECAST_DAYS,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    city = normalize_city(req.city)
    request_date = req.date.isoformat()
    return build_day_prediction(city, request_date)


@app.post("/predict/range", response_model=AggregatePredictResponse)
def predict_range(req: RangePredictRequest):
    city = normalize_city(req.city)
    if req.end_date < req.start_date:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date.")

    dates = iterate_dates(req.start_date, req.end_date)
    if len(dates) > 31:
        raise HTTPException(status_code=400, detail="Range predictions are limited to 31 days.")

    return aggregate_predictions(city, "range", dates)


@app.post("/predict/next7", response_model=AggregatePredictResponse)
def predict_next_days(req: NextDaysRequest):
    city = normalize_city(req.city)
    start_date = req.start_date or date.today()
    dates = [start_date + timedelta(days=offset) for offset in range(req.days)]
    return aggregate_predictions(city, "next7", dates)


@app.post("/predict/year", response_model=AggregatePredictResponse)
def predict_year(req: YearPredictRequest):
    city = normalize_city(req.city)
    start_date = date(req.year, 1, 1)
    end_date = date(req.year, 12, 31)
    return aggregate_predictions(city, "year", iterate_dates(start_date, end_date))


@app.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    city = normalize_city(req.city)
    if req.end_date < req.start_date:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date.")

    dates = iterate_dates(req.start_date, req.end_date)
    if len(dates) > 366:
        raise HTTPException(status_code=400, detail="Explanation range is too large.")

    return build_explanation(city, dates)
