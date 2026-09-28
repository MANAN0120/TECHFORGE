"""SQLAlchemy models for Events and Event Photos."""

from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False, default="other")
    venue_name = Column(String, nullable=True)
    venue_lat = Column(Float, nullable=True)
    venue_lng = Column(Float, nullable=True)
    building_id = Column(String, nullable=True)
    starts_at = Column(String, nullable=False)
    ends_at = Column(String, nullable=False)
    organizer = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)
    status = Column(String, nullable=False, default="upcoming", index=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    photos = relationship("EventPhoto", back_populates="event", cascade="all, delete-orphan")


class EventPhoto(Base):
    __tablename__ = "event_photos"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False, default="Anonymous")
    uploaded_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    event = relationship("Event", back_populates="photos")
