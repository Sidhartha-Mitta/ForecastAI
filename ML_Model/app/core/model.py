import joblib
from tensorflow.keras.models import load_model

lstm = load_model("models/lstm_model.h5", compile=False)
xgb = joblib.load("models/xgb_model.pkl")