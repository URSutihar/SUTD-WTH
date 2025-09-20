from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.user import Chronotype, Sensitivity


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    timezone: str = "UTC"
    chronotype: Chronotype = Chronotype.NEUTRAL
    sensitivity: Sensitivity = Sensitivity.MEDIUM
    google_id: Optional[str] = None


class UserUpdate(BaseModel):
    timezone: Optional[str] = None
    chronotype: Optional[Chronotype] = None
    sensitivity: Optional[Sensitivity] = None
    settings: Optional[Dict[str, Any]] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    timezone: str
    chronotype: Chronotype
    sensitivity: Sensitivity
    created_at: datetime
    settings: Dict[str, Any]

    class Config:
        from_attributes = True
