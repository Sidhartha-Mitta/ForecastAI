from typing import List

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    day: int
    temperature: float
    rainfall: float


class PredictResponse(BaseModel):
    city: str
    date: str
    temperature_max: float
    temperature_min: float
    rainfall: float
    explanation: str
    alert: str
    trend: str
    advice: str
    forecast: List[ForecastPoint]


class DayPrediction(BaseModel):
    city: str
    date: str
    temperature_max: float
    temperature_min: float
    rainfall: float
    explanation: str
    alert: str
    trend: str
    advice: str


class AggregatePredictResponse(BaseModel):
    mode: str
    city: str
    generated_at: str
    start_date: str
    end_date: str
    total_days: int
    rainfall_total: float
    average_max: float
    average_min: float
    hottest_day: str
    hottest_value: float
    wettest_day: str
    wettest_value: float
    days: List[DayPrediction]


class ExplainResponse(BaseModel):
    summary: str
    weather_reason: str
    agricultural_assessment: str
    risk_note: str


class MetaResponse(BaseModel):
    app_name: str
    supported_cities: List[str]
    forecast_days: int
