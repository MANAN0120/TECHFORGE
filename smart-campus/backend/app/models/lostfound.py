"""SQLAlchemy model for Lost & Found items."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campus_id = Column(String, index=True)
    type = Column(String)               # "lost" | "found"
    title = Column(String)
    description = Column(Text)
    category = Column(String)           # "phone" | "wallet" | "id_card" | "keys" | "bag" | "other"
    photo_url = Column(String, nullable=True)
    last_seen_lat = Column(Float, nullable=True)
    last_seen_lng = Column(Float, nullable=True)
    last_seen_label = Column(String, nullable=True)   # "Near Central Cafe", free text
    building_id = Column(String, nullable=True)       # optional link to campus building
    contact_info = Column(String)                      # free text (phone, email, or nickname)
    reported_by = Column(String, nullable=True)        # nickname or device_id
    status = Column(String, default="open")            # "open" | "resolved"
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
