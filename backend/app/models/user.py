from sqlalchemy import Column, String, DateTime, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base


class Chronotype(str, enum.Enum):
    MORNING = "morning"
    EVENING = "evening"
    NEUTRAL = "neutral"


class Sensitivity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    timezone = Column(String, default="UTC")
    chronotype = Column(Enum(Chronotype), default=Chronotype.NEUTRAL)
    sensitivity = Column(Enum(Sensitivity), default=Sensitivity.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    settings = Column(JSON, default={})
    google_id = Column(String, unique=True, index=True)
    
    # Relationships
    trips = relationship("Trip", back_populates="user")
    notifications = relationship("Notification")
    wearable_data = relationship("WearableData")
