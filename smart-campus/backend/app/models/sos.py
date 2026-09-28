"""SQLAlchemy model for Emergency SOS Alerts."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campus_id = Column(String, index=True)
    device_id = Column(String, nullable=True)
    lat = Column(Float)
    lng = Column(Float)
    accuracy = Column(Float, nullable=True)
    message = Column(String, nullable=True)      # optional user message
    status = Column(String, default="received")  # "received" | "acknowledged" | "resolved"
    created_at = Column(DateTime, default=datetime.utcnow)
