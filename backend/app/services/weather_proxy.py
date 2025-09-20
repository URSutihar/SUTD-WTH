import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class WeatherService:
    def __init__(self):
        self.api_key = settings.WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Get current weather for a location"""
        if not self.api_key:
            return self._get_mock_weather()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric"
                    }
                )
                response.raise_for_status()
                
                data = response.json()
                
                return {
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"],
                    "wind_speed": data["wind"]["speed"],
                    "cloudiness": data["clouds"]["all"],
                    "visibility": data.get("visibility", 0) / 1000  # Convert to km
                }
                
        except Exception as e:
            print(f"Weather API error: {str(e)}")
            return self._get_mock_weather()
    
    async def get_forecast(self, lat: float, lon: float, days: int = 5) -> Optional[Dict[str, Any]]:
        """Get weather forecast for a location"""
        if not self.api_key:
            return self._get_mock_forecast(days)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
                    }
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Group forecasts by date
                forecasts = {}
                for item in data["list"]:
                    date = item["dt_txt"].split(" ")[0]
                    if date not in forecasts:
                        forecasts[date] = []
                    
                    forecasts[date].append({
                        "time": item["dt_txt"],
                        "temperature": item["main"]["temp"],
                        "feels_like": item["main"]["feels_like"],
                        "humidity": item["main"]["humidity"],
                        "description": item["weather"][0]["description"],
                        "icon": item["weather"][0]["icon"],
                        "wind_speed": item["wind"]["speed"],
                        "cloudiness": item["clouds"]["all"]
                    })
                
                return {
                    "location": {
                        "lat": lat,
                        "lon": lon,
                        "name": data["city"]["name"],
                        "country": data["city"]["country"]
                    },
                    "forecasts": forecasts
                }
                
        except Exception as e:
            print(f"Weather forecast API error: {str(e)}")
            return self._get_mock_forecast(days)
    
    def _get_mock_weather(self) -> Dict[str, Any]:
        """Return mock weather data when API is not available"""
        return {
            "temperature": 22.5,
            "feels_like": 24.0,
            "humidity": 65,
            "description": "partly cloudy",
            "icon": "02d",
            "wind_speed": 3.2,
            "cloudiness": 40,
            "visibility": 10.0
        }
    
    def _get_mock_forecast(self, days: int) -> Dict[str, Any]:
        """Return mock forecast data when API is not available"""
        from datetime import datetime, timedelta
        
        forecasts = {}
        for i in range(days):
            date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
            forecasts[date] = [
                {
                    "time": f"{date} 06:00:00",
                    "temperature": 18.0,
                    "feels_like": 19.0,
                    "humidity": 70,
                    "description": "clear sky",
                    "icon": "01d",
                    "wind_speed": 2.5,
                    "cloudiness": 10
                },
                {
                    "time": f"{date} 12:00:00",
                    "temperature": 25.0,
                    "feels_like": 26.0,
                    "humidity": 55,
                    "description": "partly cloudy",
                    "icon": "02d",
                    "wind_speed": 3.0,
                    "cloudiness": 30
                },
                {
                    "time": f"{date} 18:00:00",
                    "temperature": 20.0,
                    "feels_like": 21.0,
                    "humidity": 60,
                    "description": "clear sky",
                    "icon": "01d",
                    "wind_speed": 2.8,
                    "cloudiness": 5
                }
            ]
        
        return {
            "location": {
                "lat": 0.0,
                "lon": 0.0,
                "name": "Mock Location",
                "country": "Mock Country"
            },
            "forecasts": forecasts
        }
