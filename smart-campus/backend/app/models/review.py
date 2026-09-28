"""SQLAlchemy models for Reviews and Review Photos."""

from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    shop_id = Column(String, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    text = Column(String, nullable=True)
    reviewer_name = Column(String, nullable=False, default="Anonymous")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    shop = relationship("Shop", back_populates="reviews")
    photos = relationship("ReviewPhoto", back_populates="review", cascade="all, delete-orphan")


class ReviewPhoto(Base):
    __tablename__ = "review_photos"

    id = Column(String, primary_key=True, index=True)
    review_id = Column(String, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    uploaded_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    review = relationship("Review", back_populates="photos")
