"""Pydantic schemas for Emergency SOS Feature."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class SOSRequest(BaseModel):
    campus_id: str
    lat: float
    lng: float
    accuracy: Optional[float] = None
    message: Optional[str] = None
    device_id: Optional[str] = None


class SafePoint(BaseModel):
    name: str
    category: str                 # "security" | "medical" | "admin" | "well_lit"
    lat: float
    lng: float
    distance_meters: int
    walk_seconds: int
    building_id: Optional[str] = None


class SOSResponse(BaseModel):
    alert_id: int
    status: str                   # "received"
    message: str                  # "Alert sent. Help is on the way. Stay where you are."
    safe_points: List[SafePoint]
    emergency_contacts: List[Dict[str, str]]  # [{"label": "Campus Security", "phone": "+91-..."}]
