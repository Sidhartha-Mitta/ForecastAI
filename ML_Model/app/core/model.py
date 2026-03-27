from pathlib import Path

import joblib
from tensorflow.keras.models import load_model

MODEL_DIR = Path(__file__).resolve().parents[2] / "models"

lstm = load_model(MODEL_DIR / "lstm_model.h5", compile=False)
xgb = joblib.load(MODEL_DIR / "xgb_model.pkl")
