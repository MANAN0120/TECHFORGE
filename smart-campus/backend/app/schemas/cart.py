"""Pydantic schemas for campus carts."""

from pydantic import BaseModel


class CartResponse(BaseModel):
    id: str
    campus_id: str
    name: str
    route_id: str | None = None
    capacity: int = 6
    current_lat: float | None = None
    current_lng: float | None = None
    status: str  # active, inactive, maintenance
    driver_name: str | None = None
    driver_phone: str | None = None
    last_updated: str


class NearestCartResponse(BaseModel):
    cart: CartResponse
    distance_meters: float
    estimated_arrival_minutes: float
    user_lat: float
    user_lng: float
