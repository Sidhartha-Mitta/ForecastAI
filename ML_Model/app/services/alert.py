def generate_alert(pred):
    if pred[3] > 20:
        return "⚠️ Heavy Rain Warning"
    elif pred[0] > 42:
        return "🔥 Heatwave Alert"
    elif pred[0] < 10:
        return "❄️ Cold Wave Alert"
    else:
        return "Normal Conditions"