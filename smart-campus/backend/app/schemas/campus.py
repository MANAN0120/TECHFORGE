"""Pydantic schemas for campus data."""

from pydantic import BaseModel


class Coordinates(BaseModel):
    lat: float
    lng: float


class CampusInfo(BaseModel):
    campus_id: str
    name: str
    center: Coordinates
    bounding_box: list[float]
    default_zoom: int


class Entrance(BaseModel):
    id: str
    lat: float
    lng: float
    is_primary: bool
    accessible: bool


class AccessibilityInfo(BaseModel):
    has_ramp: bool
    has_elevator: bool
    accessible_entrance: bool


class BuildingResponse(BaseModel):
    id: str
    name: str
    short_name: str
    category: str
    center: Coordinates
    floors: int
    entrances: list[Entrance]
    departments: list[str]
    accessibility: AccessibilityInfo
    description: str
    verified: bool


class BuildingListResponse(BaseModel):
    campus_id: str
    count: int
    buildings: list[BuildingResponse]


class POIResponse(BaseModel):
    id: str
    name: str
    category: str
    lat: float
    lng: float
    building_id: str | None = None
    floor: int | None = None
    description: str
    wheelchair_accessible: bool
    verified: bool


class POIListResponse(BaseModel):
    campus_id: str
    count: int
    pois: list[POIResponse]


class DepartmentResponse(BaseModel):
    id: str
    name: str
    building_id: str
    floor: int | None = None
    description: str


class NodeResponse(BaseModel):
    id: str
    type: str
    lat: float | None = None
    lng: float | None = None
    building_id: str | None = None
    floor: int | None = None
    label: str
    wheelchair_accessible: bool


class PathResponse(BaseModel):
    id: str
    from_node: str
    to_node: str
    distance: float
    estimated_time: float
    mode: str
    accessible: bool
    bidirectional: bool
    indoor: bool


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]
