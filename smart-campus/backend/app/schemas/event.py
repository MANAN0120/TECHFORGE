"""Pydantic schemas for events."""

from pydantic import BaseModel


class EventPhotoResponse(BaseModel):
    id: str
    event_id: str
    url: str
    uploaded_by: str
    uploaded_at: str


class EventCreate(BaseModel):
    campus_id: str = "cu-gharaun"
    title: str
    description: str | None = None
    category: str = "other"
    venue_name: str | None = None
    venue_lat: float | None = None
    venue_lng: float | None = None
    building_id: str | None = None
    starts_at: str
    ends_at: str
    organizer: str | None = None
    cover_image: str | None = None
    status: str = "upcoming"


class EventResponse(BaseModel):
    id: str
    campus_id: str
    title: str
    description: str | None = None
    category: str
    venue_name: str | None = None
    venue_lat: float | None = None
    venue_lng: float | None = None
    building_id: str | None = None
    starts_at: str
    ends_at: str
    organizer: str | None = None
    cover_image: str | None = None
    status: str
    created_at: str
    updated_at: str
    photos: list[EventPhotoResponse] = []


class EventListResponse(BaseModel):
    campus_id: str
    count: int
    events: list[EventResponse]
