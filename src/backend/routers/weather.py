"""Live weather data backed by Open-Meteo's geocoding and forecast APIs."""

import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
logger = logging.getLogger(__name__)

DEFAULT_LOCATION = "Ahmedabad, Gujarat, India"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

WEATHER_CONDITIONS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Heavy drizzle", 56: "Freezing drizzle", 57: "Heavy freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Freezing rain",
    67: "Heavy freezing rain", 71: "Slight snow", 73: "Moderate snow",
    75: "Heavy snow", 77: "Snow grains", 80: "Rain showers",
    81: "Moderate rain showers", 82: "Violent rain showers", 85: "Snow showers",
    86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
}


def _condition_from_code(code: int | None) -> str:
    return WEATHER_CONDITIONS.get(code, "Unknown")


def _display_location(place: dict) -> str:
    """Build a concise human-readable label from Open-Meteo geocoding data."""
    parts = [place.get("name"), place.get("admin1"), place.get("country")]
    return ", ".join(str(part) for part in parts if part)


@router.get("/weather")
async def get_weather(location: str | None = Query(default=None, max_length=160)):
    """Return current conditions and a three-day forecast for a farm location.

    A blank location uses Ahmedabad, Gujarat, India as an explicit app default.
    Invalid supplied locations and upstream failures are reported to the client;
    the endpoint never substitutes invented weather conditions.
    """
    requested_location = (location or "").strip() or DEFAULT_LOCATION

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            geocode_response = await client.get(
                GEOCODING_URL,
                params={"name": requested_location, "count": 1, "language": "en", "format": "json"},
            )
            geocode_response.raise_for_status()
            places = geocode_response.json().get("results", [])
            if not places:
                raise HTTPException(
                    status_code=404,
                    detail=f"Could not find a weather location matching '{requested_location}'.",
                )

            place = places[0]
            forecast_response = await client.get(
                FORECAST_URL,
                params={
                    "latitude": place["latitude"],
                    "longitude": place["longitude"],
                    "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
                    "forecast_days": 3,
                    "timezone": "auto",
                },
            )
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()
    except HTTPException:
        raise
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.exception("Open-Meteo weather lookup failed for %r: %s", requested_location, exc)
        raise HTTPException(
            status_code=502,
            detail="Live weather data is temporarily unavailable. Please try again shortly.",
        ) from exc

    current = forecast_data["current"]
    daily = forecast_data["daily"]
    forecast = [
        {
            "date": date,
            "condition": _condition_from_code(daily["weather_code"][index]),
            "tempHigh": round(daily["temperature_2m_max"][index]),
            "tempLow": round(daily["temperature_2m_min"][index]),
            "rainfall": round(daily["precipitation_sum"][index], 1),
            "rainProbability": daily["precipitation_probability_max"][index],
        }
        for index, date in enumerate(daily["time"])
    ]

    return {
        "location": _display_location(place),
        "temperature": round(current["temperature_2m"]),
        "condition": _condition_from_code(current["weather_code"]),
        "humidity": round(current["relative_humidity_2m"]),
        "windSpeed": round(current["wind_speed_10m"]),
        "rainfall": round(current["precipitation"], 1),
        "rainProbability": forecast[0]["rainProbability"],
        "forecast": forecast,
    }


@router.get("/irrigation/recommendation")
async def get_irrigation_recommendation(
    location: str | None = Query(default=None, max_length=160),
    soil_moisture: str = Query(default="medium"),
    crop: str = Query(default="Crop"),
):
    """Rule-based irrigation recommendation derived from LIVE weather data.

    The recommendation is produced by four fixed thresholds — never by a
    trained model, and never with a confidence percentage attached.
    """
    weather = await get_weather(location)
    rain_probability = weather["rainProbability"]
    temperature = weather["temperature"]

    # Map farmer-entered text band to a numeric moisture value
    moisture_bands = {"low": 20, "medium": 40, "high": 60}
    moisture_value = moisture_bands.get((soil_moisture or "medium").strip().lower(), 40)
    
    # Adjust baseline based on crop type (mock logic for dynamic output)
    crop_factor = 1.2 if crop.lower() in ["rice", "sugarcane"] else 1.0

    if rain_probability >= 60:
        title = "Delay irrigation"
        hours, liters = 0, 0
        reason = (
            f"Rain probability is {rain_probability}% in the next 24 h; "
            f"recheck soil moisture for your {crop} after rainfall before irrigating."
        )
    elif moisture_value >= 50:
        title = "No irrigation needed now"
        hours, liters = 0, 0
        reason = (
            f"Soil moisture ({soil_moisture}) is adequate for {crop} and rain probability "
            f"is only {rain_probability}%."
        )
    elif moisture_value <= 25 or temperature >= 35:
        cause = (
            "Low soil moisture"
            if moisture_value <= 25
            else f"High temperature ({temperature}°C)"
        )
        title = "Increase irrigation"
        hours, liters = round(3.5 * crop_factor, 1), int(15000 * crop_factor)
        reason = f"{cause} increases {crop} water demand."
    else:
        title = "Moderate irrigation"
        hours, liters = round(2.0 * crop_factor, 1), int(10000 * crop_factor)
        reason = (
            f"Soil moisture entered as {soil_moisture}, "
            f"rain probability {rain_probability}% for {crop}."
        )

    return {
        "title": title,
        "durationHours": hours,
        "waterAmountLiters": liters,
        "reason": reason,
        "isHeuristic": True,
        "context": {
            "soilMoistureInput": soil_moisture,
            "temperature": temperature,
            "rainProbability": rain_probability,
            "location": weather["location"],
            "crop": crop,
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }
