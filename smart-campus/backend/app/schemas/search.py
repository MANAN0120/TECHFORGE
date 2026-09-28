"""Pydantic schemas for search functionality."""

from typing import Any
from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: str
    type: str  # building, poi, department, shop, event, node
    title: str
    subtitle: str | None = None
    category: str | None = None
    building_id: str | None = None
    lat: float | None = None
    lng: float | None = None
    floor: int | None = None
    score: float = 1.0
    metadata: dict[str, Any] = {}


class SearchResponse(BaseModel):
    campus_id: str
    query: str
    total: int
    results: list[SearchResultItem]
