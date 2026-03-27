import numpy as np
from app.core.predictor import hybrid_predict

def multi_day_forecast(X, last_seq, days=7):
    forecast = []
    cur_seq = last_seq.copy()

    for i in range(days):
        pred = hybrid_predict(X, cur_seq)

        forecast.append({
            "day": i+1,
            "temperature": float(pred[0]),
            "rainfall": float(pred[3])
        })

        # 🔥 UPDATE SEQUENCE (IMPORTANT)
        new_row = cur_seq[-1].copy()
        new_row[:len(pred)] = pred

        cur_seq = np.vstack([cur_seq[1:], new_row])

    return forecast