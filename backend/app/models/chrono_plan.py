from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class ChronoPlan(Base):
    __tablename__ = "chrono_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(String, default="1.0.0")
    days = Column(JSON, nullable=False)  # array of DayAction objects
    raw_gemini_response = Column(JSON)  # store raw response for audit
    
    # Relationships
    trip = relationship("Trip", back_populates="chrono_plans")


class DayAction:
    """Pydantic-like structure for day actions (stored as JSON)"""
    def __init__(self, date_local: str, actions: list):
        self.date_local = date_local  # YYYY-MM-DD
        self.actions = actions  # array of action objects
