"""SQLAlchemy model for Campus Conditions / Blocked Paths."""

from datetime import datetime
from sqlalchemy import Column, String, Integer

from app.core.database import Base


class Condition(Base):
    __tablename__ = "conditions"

    id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, index=True)
    path_id = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    severity = Column(String, nullable=False, default="blocked")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    expires_at = Column(String, nullable=True)
    active = Column(Integer, default=1, nullable=False, index=True)
