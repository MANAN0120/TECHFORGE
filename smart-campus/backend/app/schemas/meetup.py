from typing import Optional, List, Dict
from pydantic import BaseModel


class PersonLocation(BaseModel):
    lat: float
    lng: float
    label: Optional[str] = None   # "Hostel", "A Block", or None for GPS


class MeetupRequest(BaseModel):
    campus_id: str
    person_a: PersonLocation
    person_b: PersonLocation
    accessible: bool = False
    max_radius_meters: int = 400      # search radius around midpoint
    limit: int = 3                    # number of suggestions to return


class MeetupSuggestion(BaseModel):
    poi_id: str
    name: str
    category: str
    lat: float
    lng: float
    walk_time_a: int                  # seconds
    walk_time_b: int                  # seconds
    distance_a: int                   # meters
    distance_b: int                   # meters
    equidistance_delta: int           # |dist_a - dist_b| in meters
    score: float                      # final ranking score
    reason: str                       # human-readable explanation
    accessible: bool


class MeetupResponse(BaseModel):
    midpoint: Dict[str, float]        # { "lat": ..., "lng": ... }
    suggestions: List[MeetupSuggestion]
    warnings: List[str] = []          # e.g., "No accessible route to top suggestion"
