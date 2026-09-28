"""Pydantic schemas for Class Schedule Auto-Pilot."""

from typing import Optional
from pydantic import BaseModel


class SchedulePreviewRequest(BaseModel):
    campus_id: str = "cu-gharaun"
    building_id: str
    from_lat: Optional[float] = None
    from_lng: Optional[float] = None
    accessible: bool = False


class ClassRoutePreview(BaseModel):
    building_id: str
    building_name: str
    distance_meters: int
    walk_seconds: int
    walk_minutes: int
    accessible: bool
