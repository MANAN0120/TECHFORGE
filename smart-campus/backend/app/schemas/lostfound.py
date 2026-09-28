"""Pydantic schemas for Lost & Found Feature."""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel


class LostItemCreate(BaseModel):
    campus_id: str
    type: Literal["lost", "found"]
    title: str
    description: str
    category: Literal["phone", "wallet", "id_card", "keys", "bag", "other"]
    last_seen_lat: Optional[float] = None
    last_seen_lng: Optional[float] = None
    last_seen_label: Optional[str] = None
    building_id: Optional[str] = None
    contact_info: str
    reported_by: Optional[str] = None


class LostItemOut(BaseModel):
    id: int
    campus_id: str
    type: str
    title: str
    description: str
    category: str
    photo_url: Optional[str] = None
    last_seen_lat: Optional[float] = None
    last_seen_lng: Optional[float] = None
    last_seen_label: Optional[str] = None
    building_id: Optional[str] = None
    contact_info: str
    reported_by: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    distance_from_user_meters: Optional[int] = None

    model_config = {"from_attributes": True}


class LostItemListResponse(BaseModel):
    items: List[LostItemOut]
    total: int
