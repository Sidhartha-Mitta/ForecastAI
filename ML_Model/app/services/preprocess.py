import numpy as np
import pandas as pd
import joblib
from app.config import CITY_LIST

scaler = joblib.load("models/scaler.pkl")
features = joblib.load("models/feature_columns.pkl")

def preprocess_input(date, city):
    df = build_feature_frame([date], city)
    return scaler.transform(df), df['month'].values[0]


def build_feature_frame(dates, city):
    df = pd.DataFrame([{"date": item} for item in dates])
    df['date'] = pd.to_datetime(df['date'])

    df['day_of_year'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year

    df['sin_day'] = np.sin(2*np.pi*df['day_of_year']/365)
    df['cos_day'] = np.cos(2*np.pi*df['day_of_year']/365)

    df['season'] = df['month'].apply(lambda m: 1 if m in [6,7,8,9] else 0)

    df = df.drop(columns=['date'])

    for c in CITY_LIST:
        df[f'city_{c}'] = 1 if c == city else 0

    df = df[features]

    return df


def preprocess_batch(dates, city):
    df = build_feature_frame(dates, city)
    X = scaler.transform(df)
    months = df['month'].to_numpy()

    return X, months
