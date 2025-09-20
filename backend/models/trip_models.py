from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Layover(BaseModel):
    airport: str
    arrival_utc: datetime
    departure_utc: datetime

class TripCreate(BaseModel):
    user_id: str
    origin: str
    origin_timezone: str
    destination: str
    destination_timezone: str
    departure_utc: datetime
    arrival_utc: datetime
    flight_duration_minutes: int
    layovers: List[Layover] = []

class TripResponse(BaseModel):
    id: str
    user_id: str
    origin: str
    origin_timezone: str
    destination: str
    destination_timezone: str
    departure_utc: datetime
    arrival_utc: datetime
    flight_duration_minutes: int
    layovers: List[Layover] = []
    created_at: datetime
    schedule: Optional[dict] = None

class TripListResponse(BaseModel):
    trips: List[TripResponse]
    total: int
