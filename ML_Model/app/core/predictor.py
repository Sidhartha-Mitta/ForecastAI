import numpy as np
from app.core.model import lstm, xgb

def hybrid_predict(X, last_seq):
    xgb_pred = xgb.predict(X)[0]
    lstm_pred = lstm.predict(last_seq[np.newaxis,:,:], verbose=0)[0]

    final = 0.7*lstm_pred + 0.3*xgb_pred

    # reverse log transform
    final[2] = np.expm1(final[2])
    final[3] = np.expm1(final[3])

    final[2] = max(0, final[2])
    final[3] = max(0, final[3])

    return final


def hybrid_predict_batch(X_batch, seq_batch):
    xgb_pred = xgb.predict(X_batch)
    lstm_pred = lstm.predict(seq_batch, verbose=0)

    final = 0.7 * lstm_pred + 0.3 * xgb_pred

    final[:, 2] = np.expm1(final[:, 2])
    final[:, 3] = np.expm1(final[:, 3])
    final[:, 2] = np.maximum(0, final[:, 2])
    final[:, 3] = np.maximum(0, final[:, 3])

    return final
