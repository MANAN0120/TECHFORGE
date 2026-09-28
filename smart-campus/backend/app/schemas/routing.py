"""Pydantic schemas for routing and navigation."""

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float
    lng: float


class RouteRequest(BaseModel):
    campus_id: str = "cu-gharaun"
    origin: str | None = Field(None, description="Origin node ID, building ID, or POI ID")
    destination: str | None = Field(None, description="Destination node ID, building ID, or POI ID")
    origin_coords: Coordinates | None = None
    destination_coords: Coordinates | None = None
    mode: str = Field("walk", description="Routing mode: 'walk' or 'accessible'")


class TurnStep(BaseModel):
    step_index: int
    instruction: str
    distance_meters: float
    duration_seconds: float
    from_node: str
    to_node: str
    lat: float | None = None
    lng: float | None = None
    action: str = "straight"  # depart, straight, turn_left, turn_right, enter_building, change_floor, arrive
    floor_change: str | None = None  # None, lift, stairs, ramp


class RouteResponse(BaseModel):
    campus_id: str
    found: bool
    mode: str
    total_distance_meters: float
    estimated_time_minutes: float
    node_ids: list[str]
    path_coordinates: list[list[float]]  # list of [lat, lng]
    steps: list[TurnStep]
    is_accessible: bool
    avoided_blocked_paths: list[str] = []
    message: str | None = None
