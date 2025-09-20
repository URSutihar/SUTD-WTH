from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.user import Chronotype, Sensitivity


class LocationSchema(BaseModel):
    lat: float
    lon: float
    name: str
    iata: Optional[str] = None


class LayoverSchema(BaseModel):
    arrival_utc: datetime
    departure_utc: datetime
    timezone: str
    location: LocationSchema


class UserPreferencesSchema(BaseModel):
    chronotype: Chronotype
    sensitivity: Sensitivity
    preferred_bedtime_local: str  # HH:MM format


class TripCreate(BaseModel):
    origin: LocationSchema
    destination: LocationSchema
    departure_utc: datetime
    arrival_utc: datetime
    layovers: List[LayoverSchema] = []
    user_preferences: UserPreferencesSchema


class TripUpdate(BaseModel):
    origin: Optional[LocationSchema] = None
    destination: Optional[LocationSchema] = None
    departure_utc: Optional[datetime] = None
    arrival_utc: Optional[datetime] = None
    layovers: Optional[List[LayoverSchema]] = None
    user_preferences: Optional[UserPreferencesSchema] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    origin_timezone: str
    origin_location: Dict[str, Any]
    destination_timezone: str
    destination_location: Dict[str, Any]
    departure_utc: datetime
    arrival_utc: datetime
    layovers: List[Dict[str, Any]]
    flight_duration_minutes: int
    created_at: datetime

    class Config:
        from_attributes = True
