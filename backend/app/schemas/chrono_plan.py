from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class ActionSchema(BaseModel):
    type: str  # light, meal, hydration, sleep, melatonin, caffeine, activity
    start_local: str  # HH:MM format
    end_local: Optional[str] = None  # HH:MM format
    instruction: str
    confidence_score: Optional[float] = None
    source: str = "gemini"  # gemini or local-rules
    metadata: Optional[Dict[str, Any]] = None


class DayActionSchema(BaseModel):
    date_local: str  # YYYY-MM-DD format
    actions: List[ActionSchema]


class ChronoPlanResponse(BaseModel):
    id: str
    trip_id: str
    generated_at: datetime
    version: str
    days: List[DayActionSchema]
    raw_gemini_response: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class PlanGenerationRequest(BaseModel):
    force_regenerate: bool = False
