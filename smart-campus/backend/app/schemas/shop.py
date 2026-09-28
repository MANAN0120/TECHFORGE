"""Pydantic schemas for shops and reviews."""

from pydantic import BaseModel, Field


class ReviewPhotoResponse(BaseModel):
    id: str
    review_id: str
    url: str
    uploaded_at: str


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str | None = None
    reviewer_name: str = "Anonymous"


class ReviewResponse(BaseModel):
    id: str
    shop_id: str
    rating: int
    text: str | None = None
    reviewer_name: str
    created_at: str
    photos: list[ReviewPhotoResponse] = []


class ShopPhotoResponse(BaseModel):
    id: str
    shop_id: str
    url: str
    uploaded_by: str
    uploaded_at: str


class ShopResponse(BaseModel):
    id: str
    campus_id: str
    name: str
    category: str
    lat: float | None = None
    lng: float | None = None
    building_id: str | None = None
    floor: int | None = None
    description: str | None = None
    hours_open: str | None = None
    hours_close: str | None = None
    contact: str | None = None
    verified: bool
    average_rating: float = 0.0
    total_reviews: int = 0
    reviews: list[ReviewResponse] = []
    photos: list[ShopPhotoResponse] = []
