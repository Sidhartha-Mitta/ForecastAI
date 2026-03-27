def generate_trend(pred):
    if pred[3] > 5:
        return "Rainfall increasing"
    elif pred[0] > 35:
        return "Temperature rising"
    else:
        return "Stable weather pattern"