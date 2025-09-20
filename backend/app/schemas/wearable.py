from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WearableDataCreate(BaseModel):
    timestamp_utc: datetime
    heart_rate: Optional[int] = None
    hrv: Optional[float] = None
    sleep_stage: Optional[str] = None
    device_type: Optional[str] = None


class WearableDataResponse(BaseModel):
    id: str
    user_id: str
    timestamp_utc: datetime
    heart_rate: Optional[int]
    hrv: Optional[float]
    sleep_stage: Optional[str]
    device_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
