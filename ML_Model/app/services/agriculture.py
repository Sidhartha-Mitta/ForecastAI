def generate_advice(pred):
    if pred[3] > 5:
        return "Good conditions for crop sowing"
    elif pred[0] > 35:
        return "Irrigation recommended due to heat"
    else:
        return "Normal farming conditions"