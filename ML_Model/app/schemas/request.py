from datetime import date

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    date: date
    city: str = Field(min_length=2, max_length=100)


class RangePredictRequest(BaseModel):
    city: str = Field(min_length=2, max_length=100)
    start_date: date
    end_date: date


class NextDaysRequest(BaseModel):
    city: str = Field(min_length=2, max_length=100)
    start_date: date | None = None
    days: int = Field(default=7, ge=1, le=14)


class YearPredictRequest(BaseModel):
    city: str = Field(min_length=2, max_length=100)
    year: int = Field(ge=2000, le=2100)


class ExplainRequest(BaseModel):
    city: str = Field(min_length=2, max_length=100)
    mode: str = Field(min_length=3, max_length=20)
    start_date: date
    end_date: date
