
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Any
from datetime import datetime

class Action(BaseModel):
    action_id: str
    type: Literal["light", "avoid_light", "sleep", "nap", "meal", "hydrate", "melatonin", "caffeine", "activity"]
    when_local: datetime
    when_utc: datetime
    duration_minutes: Optional[int] = None
    priority: Literal["low", "medium", "high"]
    details: str
    dose_mg: Optional[float] = None
    safety_notes: Optional[str] = None

class Phase(BaseModel):
    phase_name: Literal["pre-trip", "travel", "post-arrival"]
    start_local: datetime
    end_local: datetime
    actions: List[Action]

class ScheduleMetadata(BaseModel):
    generated_at_utc: datetime
    model: str

class ScheduleResponse(BaseModel):
    schedule_version: str
    trip_id: str
    timezone: str
    phases: List[Phase]
    disclaimer: str
    metadata: ScheduleMetadata

class GeneratePlanRequest(BaseModel):
    user: Any  # Simplified to avoid circular import
    trip: Any  # Simplified to avoid circular import
    weather: Optional[dict] = None
    preferences: dict

class ChecklistUpdateRequest(BaseModel):
    action_id: str
    completed: bool
