"""SQLAlchemy model for Campus Notifications."""

from datetime import datetime
from sqlalchemy import Column, String, Integer

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    body = Column(String, nullable=True)
    category = Column(String, nullable=False, default="general")
    target = Column(String, nullable=False, default="all")
    read = Column(Integer, default=0, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
