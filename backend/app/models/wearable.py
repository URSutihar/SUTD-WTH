from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class WearableData(Base):
    __tablename__ = "wearable_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    timestamp_utc = Column(DateTime(timezone=True), nullable=False)
    heart_rate = Column(Integer, nullable=True)
    hrv = Column(Float, nullable=True)
    sleep_stage = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # garmin, fitbit, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
