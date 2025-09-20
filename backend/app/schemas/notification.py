from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.notification import NotificationStatus


class NotificationCreate(BaseModel):
    trip_id: Optional[str] = None
    scheduled_at_utc: datetime
    payload: Dict[str, Any]


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    trip_id: Optional[str]
    scheduled_at_utc: datetime
    payload: Dict[str, Any]
    status: NotificationStatus
    created_at: datetime

    class Config:
        from_attributes = True


class PushSubscriptionSchema(BaseModel):
    endpoint: str
    keys: Dict[str, str]
