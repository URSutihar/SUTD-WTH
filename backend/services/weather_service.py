import os
import httpx
from typing import Dict, Any, Optional

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("WEATHERAPI_KEY")
        if not self.api_key:
            raise ValueError("Missing WEATHERAPI_KEY")
        
        self.base_url = "http://api.weatherapi.com/v1"

    async def get_weather_by_city(self, city: str) -> Dict[str, Any]:
        """Get weather data by city name"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/current.json",
                    params={
                        "key": self.api_key,
                        "q": city,
                        "aqi": "no"
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"WeatherAPI error: {response.status_code} - {response.text}")
                
                data = response.json()
                return self._format_weather_data(data)
                
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            raise

    async def get_weather_by_coordinates(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get weather data by coordinates"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/current.json",
                    params={
                        "key": self.api_key,
                        "q": f"{lat},{lon}",
                        "aqi": "no"
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"WeatherAPI error: {response.status_code} - {response.text}")
                
                data = response.json()
                return self._format_weather_data(data)
                
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            raise

    async def get_sunrise_sunset(self, city: str, date: str) -> Dict[str, Any]:
        """Get sunrise/sunset times for a specific date"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/astronomy.json",
                    params={
                        "key": self.api_key,
                        "q": city,
                        "dt": date
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"WeatherAPI error: {response.status_code} - {response.text}")
                
                data = response.json()
                return self._format_astronomy_data(data)
                
        except Exception as e:
            print(f"Error fetching astronomy data: {e}")
            raise

    def _format_weather_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format weather data for our API"""
        current = data.get("current", {})
        location = data.get("location", {})
        
        return {
            "temperature": current.get("temp_c"),
            "temperature_unit": "C",
            "condition": current.get("condition", {}).get("text", "Unknown"),
            "humidity": current.get("humidity"),
            "wind_speed": current.get("wind_kph"),
            "wind_unit": "km/h",
            "cloud_cover": current.get("cloud"),
            "uv_index": current.get("uv"),
            "location": {
                "name": location.get("name"),
                "country": location.get("country"),
                "timezone": location.get("tz_id")
            }
        }

    def _format_astronomy_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format astronomy data for sunrise/sunset"""
        astronomy = data.get("astronomy", {}).get("astro", {})
        
        return {
            "sunrise": astronomy.get("sunrise"),
            "sunset": astronomy.get("sunset"),
            "moonrise": astronomy.get("moonrise"),
            "moonset": astronomy.get("moonset"),
            "moon_phase": astronomy.get("moon_phase"),
            "moon_illumination": astronomy.get("moon_illumination")
        }
