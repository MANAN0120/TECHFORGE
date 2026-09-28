from typing import Optional, List, Dict
from pydantic import BaseModel


class PersonLocation(BaseModel):
    lat: float
    lng: float
    label: Optional[str] = None   # "Hostel", "A Block", "Alex", etc.


class ParticipantRouteInfo(BaseModel):
    label: str
    walk_time_seconds: int
    distance_meters: int


class MeetupRequest(BaseModel):
    campus_id: str
    person_a: Optional[PersonLocation] = None
    person_b: Optional[PersonLocation] = None
    participants: Optional[List[PersonLocation]] = None  # List of 2 or more participants
    accessible: bool = False
    prefer_low_crowd: bool = False      # Prefer spacious, open, low-density spots for group
    max_radius_meters: int = 500        # search radius around group centroid
    limit: int = 3                      # number of suggestions to return


class MeetupSuggestion(BaseModel):
    poi_id: str
    name: str
    category: str
    lat: float
    lng: float
    walk_time_a: int                  # seconds (person 1)
    walk_time_b: int                  # seconds (person 2)
    distance_a: int                   # meters
    distance_b: int                   # meters
    equidistance_delta: int           # max distance delta across group
    score: float                      # final ranking score
    reason: str                       # human-readable explanation
    accessible: bool
    participant_routes: List[ParticipantRouteInfo] = []  # Detailed per-participant route metrics
    max_walk_time_minutes: float = 0.0
    avg_walk_time_minutes: float = 0.0


class MeetupResponse(BaseModel):
    midpoint: Dict[str, float]        # { "lat": ..., "lng": ... }
    suggestions: List[MeetupSuggestion]
    warnings: List[str] = []          # e.g., "No accessible route to top suggestion"
