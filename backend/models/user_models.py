from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class SleepBaseline(BaseModel):
    bedtime: str
    waketime: str
    typical_duration_minutes: int

class UserPreferences(BaseModel):
    max_caffeine_mg: Optional[int] = 200
    melatonin_preference_mg: Optional[float] = 1.0
    avoid_medications: bool = False

class User(BaseModel):
    id: str
    email: str
    chronotype: Optional[str] = "intermediate"
    sleep_baseline: Optional[SleepBaseline] = None

class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    timezone: str
    chronotype: str
    preferences: UserPreferences
    created_at: datetime
