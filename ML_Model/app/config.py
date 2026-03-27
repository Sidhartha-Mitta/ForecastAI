import os
from pathlib import Path


def load_local_env() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_local_env()

CITY_LIST = ["Chennai", "Delhi", "Hyderabad", "Lucknow", "Kolkata"]

CITY_CONTEXT = {
    "Chennai": {
        "climate": "coastal tropical",
        "notes": "Humidity is often high, even when rainfall is limited. Short rain spells can still make field and outdoor conditions sticky.",
    },
    "Delhi": {
        "climate": "inland continental",
        "notes": "Temperature swings can be sharper than in coastal cities, and hot days usually feel drier outside the monsoon period.",
    },
    "Hyderabad": {
        "climate": "semi-arid tropical inland",
        "notes": "Warm conditions are common, and rainfall often matters a lot for surface moisture and short-term farm comfort.",
    },
    "Lucknow": {
        "climate": "humid subtropical inland",
        "notes": "Warm weather with some moisture can quickly affect field comfort, irrigation timing, and crop stress.",
    },
    "Kolkata": {
        "climate": "humid tropical",
        "notes": "Moisture and humidity are often important, so even moderate rainfall can leave conditions feeling heavy and damp.",
    },
}
