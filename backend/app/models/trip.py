from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    origin_timezone = Column(String, nullable=False)
    origin_location = Column(JSON, nullable=False)  # {lat, lon, name}
    destination_timezone = Column(String, nullable=False)
    destination_location = Column(JSON, nullable=False)  # {lat, lon, name}
    departure_utc = Column(DateTime(timezone=True), nullable=False)
    arrival_utc = Column(DateTime(timezone=True), nullable=False)
    layovers = Column(JSON, default=[])  # array of layover objects
    flight_duration_minutes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="trips")
    chrono_plans = relationship("ChronoPlan", back_populates="trip", cascade="all, delete-orphan")
