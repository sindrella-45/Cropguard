# backend/tools/weather.py
"""
Weather tool for CropGuard AI — registered as a proper LangChain tool.



The tool enriches commercial crop disease diagnosis by factoring in
current weather conditions that affect disease risk.
"""

import httpx
import logging
from typing import Optional
from langchain_core.tools import tool
from config import get_settings
from utils.retry import with_retry

logger = logging.getLogger(__name__)

WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"


@tool
async def get_crop_weather_conditions(location: str) -> dict:
    """
    Fetch current weather conditions for a farm location.

    Retrieves temperature, humidity, rainfall, and wind data
    from OpenWeatherMap API. This data enriches commercial crop
    disease diagnosis because many fungal and bacterial diseases
    are directly triggered or worsened by specific weather patterns.

    Key disease-weather relationships:
    - Humidity above 80% → high fungal disease risk (blight, mildew)
    - Temperature 20-30°C + high humidity → optimal fungal growth
    - Heavy rainfall → bacterial disease and root rot risk
    - Temperature above 35°C → heat stress symptoms mimic disease

    Args:
        location: City or region name e.g. 'Kampala, Uganda'
                  or 'Mbarara' or 'Kisumu, Kenya'

    Returns:
        dict: Weather data containing:
              - temperature: float in Celsius
              - humidity: int percentage
              - rainfall: float mm in last hour
              - wind_speed: float km/h
              - description: str e.g. 'light rain'
              - disease_risk: str assessment (Low/Moderate/High/Very High)
              Returns empty dict if API key not configured or call fails.

    Example:
        weather = await get_crop_weather_conditions.ainvoke({
            "location": "Kampala, Uganda"
        })
        print(weather["temperature"])   # 24.5
        print(weather["disease_risk"])  # "High"
    """
    settings = get_settings()

    if not settings.weather_api_key:
        logger.warning(
            "Weather API key not configured — skipping weather enrichment."
        )
        return {}

    @with_retry(max_attempts=2)
    async def _fetch():
        async with httpx.AsyncClient() as client:
            response = await client.get(
                WEATHER_API_URL,
                params={
                    "q":     location,
                    "appid": settings.weather_api_key,
                    "units": "metric",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    try:
        data = await _fetch()

        temperature = data["main"]["temp"]
        humidity    = data["main"]["humidity"]
        rainfall    = data.get("rain", {}).get("1h", 0.0)
        wind_speed  = data["wind"]["speed"] * 3.6  # m/s → km/h

        result = {
            "temperature":  round(temperature, 1),
            "humidity":     humidity,
            "rainfall":     round(rainfall, 1),
            "wind_speed":   round(wind_speed, 1),
            "description":  data["weather"][0]["description"],
            "disease_risk": _assess_disease_risk(
                temperature, humidity, rainfall
            ),
        }

        logger.info(
            f"Weather fetched for {location}: "
            f"{temperature}°C, {humidity}% humidity, "
            f"risk={result['disease_risk']}"
        )
        return result

    except httpx.HTTPStatusError as e:
        logger.error(f"Weather API HTTP error: {e.response.status_code}")
        return {}
    except Exception as e:
        logger.error(f"Failed to fetch weather: {e}")
        return {}


def _assess_disease_risk(
    temperature: float,
    humidity: int,
    rainfall: float,
) -> str:
    """Map weather conditions to a crop disease risk level."""
    score = 0

    if humidity > 90:   score += 3
    elif humidity > 80: score += 2
    elif humidity > 70: score += 1

    if rainfall > 10:   score += 2
    elif rainfall > 2:  score += 1

    if 20 <= temperature <= 30:
        score += 1  # Optimal range for most fungal pathogens

    if score >= 5: return "Very High"
    if score >= 3: return "High"
    if score >= 1: return "Moderate"
    return "Low"


# ── Backwards-compatible alias ─────────────────────────────────
async def get_weather(location: str) -> Optional[dict]:
    """
    Backwards-compatible wrapper around get_crop_weather_conditions.
    Used by agent/nodes.py which calls this function directly.
    Returns None instead of empty dict when weather unavailable,
    preserving the original API contract.
    """
    result = await get_crop_weather_conditions.ainvoke({"location": location})
    return result if result else None