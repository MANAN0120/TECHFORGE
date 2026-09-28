"""SQLAlchemy models for Shops and Shop Photos."""

from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Shop(Base):
    __tablename__ = "shops"

    id = Column(String, primary_key=True, index=True)
    campus_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="other")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    building_id = Column(String, nullable=True)
    floor = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    hours_open = Column(String, nullable=True)
    hours_close = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    verified = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    reviews = relationship("Review", back_populates="shop", cascade="all, delete-orphan")
    photos = relationship("ShopPhoto", back_populates="shop", cascade="all, delete-orphan")


class ShopPhoto(Base):
    __tablename__ = "shop_photos"

    id = Column(String, primary_key=True, index=True)
    shop_id = Column(String, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False, default="Anonymous")
    uploaded_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    shop = relationship("Shop", back_populates="photos")
