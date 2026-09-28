"""SQLAlchemy model for Campus Carts."""

from datetime import datetime
from sqlalchemy import Column, String, Float, Integer

from app.core.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    route_id = Column(String, nullable=True)
    capacity = Column(Integer, default=6)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    status = Column(String, nullable=False, default="inactive")
    driver_name = Column(String, nullable=True)
    driver_phone = Column(String, nullable=True)
    last_updated = Column(String, default=lambda: datetime.utcnow().isoformat())
