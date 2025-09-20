from fastapi import APIRouter, HTTPException, Query
from services.weather_service import WeatherService
from typing import Optional

router = APIRouter()

@router.get("/weather")
async def get_weather(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    q: Optional[str] = Query(None, description="City name or location")
):
    """Get weather data for a location"""
    try:
        weather = WeatherService()
        
        if lat is not None and lon is not None:
            # Get weather by coordinates
            weather_data = await weather.get_weather_by_coordinates(lat, lon)
        elif q:
            # Get weather by city name
            weather_data = await weather.get_weather_by_city(q)
        else:
            raise HTTPException(
                status_code=400, 
                detail="Either lat/lon coordinates or city name (q) must be provided"
            )
        
        return weather_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather/sunrise-sunset")
async def get_sunrise_sunset(
    city: str = Query(..., description="City name"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")
):
    """Get sunrise and sunset times for a city"""
    try:
        weather = WeatherService()
        
        if not date:
            from datetime import datetime
            date = datetime.now().strftime("%Y-%m-%d")
        
        astronomy_data = await weather.get_sunrise_sunset(city, date)
        
        return astronomy_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
