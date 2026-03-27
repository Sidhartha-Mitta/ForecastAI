import json
import os
from datetime import date
from urllib import error, request

def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


def get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip() or "gemini-1.5-flash"


def get_season(month: int) -> str:
    if month in [6, 7, 8, 9]:
        return "monsoon"
    if month in [3, 4, 5]:
        return "summer"
    return "winter"


def build_single_day_fallback(pred, month: int, city: str, request_date: str) -> str:
    max_temp = float(pred[0])
    min_temp = float(pred[1])
    rainfall = float(pred[3])
    season = get_season(month)

    return (
        f"For {city} on {request_date}, the forecast gives a maximum of {max_temp:.1f} C, "
        f"a minimum of {min_temp:.1f} C, and {rainfall:.1f} mm rainfall. "
        f"This reflects the expected conditions for that day in the {season} season."
    )


def build_period_fallback(city: str, aggregate: dict) -> dict:
    days = aggregate["days"]
    alerts = [day["alert"] for day in days if day["alert"] != "Normal Conditions"]

    summary = (
        f"For {city}, the forecast from {aggregate['start_date']} to {aggregate['end_date']} "
        f"shows its hottest day on {aggregate['hottest_day']} and its wettest day on {aggregate['wettest_day']}."
    )
    weather_reason = (
        f"Average maximum temperature is {aggregate['average_max']:.1f} C, average minimum temperature is "
        f"{aggregate['average_min']:.1f} C, and total predicted rainfall is {aggregate['rainfall_total']:.1f} mm "
        f"across {aggregate['total_days']} day(s)."
    )

    if aggregate["average_max"] > 35:
        agricultural_assessment = (
            "Heat stress may affect field work and crop moisture, so irrigation timing and water conservation "
            "deserve close attention."
        )
    elif aggregate["rainfall_total"] / max(aggregate["total_days"], 1) > 5:
        agricultural_assessment = (
            "Moisture conditions look supportive for many crops, but drainage and disease monitoring remain important "
            "if rainfall stays elevated."
        )
    else:
        agricultural_assessment = (
            "Conditions look broadly manageable for farm activity, with day-to-day field decisions depending on crop stage "
            "and soil moisture."
        )

    risk_note = " | ".join(alerts) if alerts else "No major weather alerts were generated for the selected period."

    return {
        "summary": summary,
        "weather_reason": weather_reason,
        "agricultural_assessment": agricultural_assessment,
        "risk_note": risk_note,
    }


def _extract_candidate_text(data: dict) -> str | None:
    candidates = data.get("candidates", [])
    if not candidates:
        return None

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(part.get("text", "").strip() for part in parts if part.get("text"))
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`").strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
    return text or None


def _call_gemini(prompt: str, response_mime_type: str | None = None, response_schema: dict | None = None) -> str | None:
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    generation_config = {
        "temperature": 0.2,
        "topP": 0.9,
        "maxOutputTokens": 420,
    }
    if response_mime_type:
        generation_config["responseMimeType"] = response_mime_type
    if response_schema:
        generation_config["responseSchema"] = response_schema

    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{get_gemini_model()}:generateContent?key={api_key}"
    )
    payload = {
        "system_instruction": {
            "parts": [
                {
                    "text": (
                        "You are a precise agricultural weather explanation assistant. "
                        "Stay grounded in the supplied forecast data and do not invent external causes."
                    )
                }
            ]
        },
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": generation_config,
    }
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (error.URLError, error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None

    return _extract_candidate_text(data)


def generate_explanation(pred, month: int, city: str, request_date: str) -> str:
    max_temp = float(pred[0])
    min_temp = float(pred[1])
    rainfall = float(pred[3])
    fallback = build_single_day_fallback(pred, month, city, request_date)
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "explanation": {"type": "STRING"},
        },
        "required": ["explanation"],
    }
    prompt = (
        "Return JSON with one key: explanation.\n"
        "Write 2 or 3 natural sentences in plain English.\n"
        "Base the explanation only on the provided prediction data.\n"
        "Mention the city and date, describe what the forecast numbers mean for that day, and keep the wording natural.\n"
        "Do not use generic lines like 'the model suggests' or 'stable weather pattern'.\n"
        "Do not invent external causes beyond the data.\n"
        f"City: {city}\n"
        f"Date: {request_date}\n"
        f"Predicted max temperature: {max_temp:.1f} C\n"
        f"Predicted min temperature: {min_temp:.1f} C\n"
        f"Predicted rainfall: {rainfall:.1f} mm\n"
        f"Season: {get_season(month)}"
    )
    raw = _call_gemini(
        prompt,
        response_mime_type="application/json",
        response_schema=response_schema,
    )
    if not raw:
        return fallback

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return fallback

    explanation = parsed.get("explanation")
    return explanation.strip() if isinstance(explanation, str) and explanation.strip() else fallback


def generate_period_explanation(city: str, aggregate: dict) -> dict:
    fallback = build_period_fallback(city, aggregate)
    aggregate_snapshot = {
        "start_date": aggregate["start_date"],
        "end_date": aggregate["end_date"],
        "total_days": aggregate["total_days"],
        "average_max": round(aggregate["average_max"], 1),
        "average_min": round(aggregate["average_min"], 1),
        "rainfall_total": round(aggregate["rainfall_total"], 1),
        "hottest_day": aggregate["hottest_day"],
        "hottest_value": round(aggregate["hottest_value"], 1),
        "wettest_day": aggregate["wettest_day"],
        "wettest_value": round(aggregate["wettest_value"], 1),
    }
    daily_snapshot = [
        {
            "date": day["date"],
            "temperature_max": round(day["temperature_max"], 1),
            "temperature_min": round(day["temperature_min"], 1),
            "rainfall": round(day["rainfall"], 1),
            "alert": day["alert"],
            "trend": day["trend"],
            "advice": day["advice"],
        }
        for day in aggregate["days"][:14]
    ]

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "summary": {"type": "STRING"},
            "weather_reason": {"type": "STRING"},
            "agricultural_assessment": {"type": "STRING"},
            "risk_note": {"type": "STRING"},
        },
        "required": ["summary", "weather_reason", "agricultural_assessment", "risk_note"],
    }

    prompt = (
        "Return a concise explanation object for the selected forecast period.\n"
        "Requirements:\n"
        "- summary: 2 sentences that describe the overall pattern for the chosen dates in plain English.\n"
        "- weather_reason: 2 sentences using the actual temperatures and rainfall totals.\n"
        "- agricultural_assessment: 2 sentences on likely farming impact, field work, irrigation, or moisture conditions.\n"
        "- risk_note: 1 or 2 sentences naming the important risk, or say clearly that no major alert stands out.\n"
        "- Keep it specific to the provided dates and city.\n"
        "- Do not say 'the model suggests' or repeat the same phrase twice.\n"
        "- Use only the forecast data below.\n"
        f"City: {city}\n"
        f"Generated on: {date.today().isoformat()}\n"
        f"Forecast aggregate: {json.dumps(aggregate_snapshot)}\n"
        f"Daily details: {json.dumps(daily_snapshot)}"
    )

    raw = _call_gemini(
        prompt,
        response_mime_type="application/json",
        response_schema=response_schema,
    )
    if not raw:
        return fallback

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return fallback

    required_keys = ["summary", "weather_reason", "agricultural_assessment", "risk_note"]
    if not all(isinstance(parsed.get(key), str) and parsed.get(key).strip() for key in required_keys):
        return fallback

    return {key: parsed[key].strip() for key in required_keys}
