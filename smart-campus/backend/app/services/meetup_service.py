"""Smart Multi-Person & Low-Crowd Group Meetup Point Calculation Service."""

import logging
from typing import List, Dict, Any, Tuple
from app.core.config import get_settings
from app.core.manifest_loader import campus_store
from app.schemas.meetup import (
    MeetupRequest,
    MeetupResponse,
    MeetupSuggestion,
    PersonLocation,
    ParticipantRouteInfo,
)
from app.schemas.routing import RouteRequest, Coordinates
from app.services.routing_service import calculate_route, _haversine_distance

logger = logging.getLogger(__name__)

EXCLUDED_CATEGORIES = {"washroom", "atm", "parking", "medical"}
PREFERRED_LANDMARK_CATEGORIES = {"food", "cafeteria", "library", "sports", "shop", "student hub", "plaza", "park", "garden"}
LOW_CROWD_SPACIOUS_CATEGORIES = {"plaza", "sports", "park", "garden", "student hub", "open food court"}


class MeetupService:
    """Service to compute optimal equidistant & low-crowd meetup landmarks for multi-user groups."""

    def _get_participants(self, request: MeetupRequest) -> List[PersonLocation]:
        """Extract all participants from request, supporting both 2-person and multi-person payloads."""
        participants: List[PersonLocation] = []

        if request.participants and len(request.participants) >= 2:
            participants = request.participants
        elif request.person_a and request.person_b:
            participants = [request.person_a, request.person_b]

        # Ensure every participant has a distinct human label
        for idx, p in enumerate(participants):
            if not p.label:
                p.label = "You" if idx == 0 else f"Friend {idx}"

        return participants

    def _compute_centroid(self, participants: List[PersonLocation]) -> Tuple[float, float]:
        """Compute the geometric centroid of all group participants."""
        if not participants:
            return (30.76858, 76.57386)
        n = len(participants)
        avg_lat = sum(p.lat for p in participants) / float(n)
        avg_lng = sum(p.lng for p in participants) / float(n)
        return (avg_lat, avg_lng)

    def _is_valid_candidate(self, category: str, radius_dist: float, max_radius: float) -> bool:
        """Filter out invalid categories or landmarks outside max radius."""
        if radius_dist > max_radius:
            return False
        cat_lower = category.lower().strip()
        if cat_lower in EXCLUDED_CATEGORIES:
            return False
        return True

    def _build_reason(
        self,
        category: str,
        num_participants: int,
        equidistance_score: float,
        prefer_low_crowd: bool,
    ) -> str:
        """Generate human-readable justification for the group meetup spot."""
        reasons: List[str] = []
        cat_lower = category.lower().strip()

        if equidistance_score > 0.8:
            reasons.append(f"Equidistant for all {num_participants} of you")
        
        if prefer_low_crowd and cat_lower in LOW_CROWD_SPACIOUS_CATEGORIES:
            reasons.append("Less crowded open public area")
        elif cat_lower in ["food", "cafeteria", "open food court"]:
            reasons.append("has seating for groups")
        elif cat_lower == "library":
            reasons.append("quiet indoor space")
        elif cat_lower in ["sports", "plaza", "student hub", "park"]:
            reasons.append("spacious outdoor gathering spot")

        if not reasons:
            reasons.append("Central campus landmark")

        return ", ".join(reasons[:2])

    def suggest_meetup(self, request: MeetupRequest) -> MeetupResponse:
        """Calculate and return top recommended meetup points for 2 or more users."""
        settings = get_settings()
        manifest = campus_store.get(request.campus_id)
        if manifest is None:
            manifest = campus_store.load(settings.CAMPUS_DATA_DIR, request.campus_id)

        participants = self._get_participants(request)
        if len(participants) < 2:
            return MeetupResponse(
                midpoint={"lat": 30.76858, "lng": 76.57386},
                suggestions=[],
                warnings=["At least 2 participant locations are required to compute a meetup point."],
            )

        # Step 1 — Compute group centroid
        cent_lat, cent_lng = self._compute_centroid(participants)

        # Step 2 — Collect candidate POIs & buildings from manifest around centroid
        candidates: List[Dict[str, Any]] = []

        # Gather POIs
        for pid, poi in manifest.pois.items():
            plat = poi.get("lat")
            plng = poi.get("lng")
            if plat is None or plng is None:
                continue
            cat = poi.get("category", "poi")
            dist_cent = _haversine_distance(cent_lat, cent_lng, plat, plng)
            if self._is_valid_candidate(cat, dist_cent, request.max_radius_meters):
                candidates.append({
                    "id": pid,
                    "name": poi.get("name", pid),
                    "category": cat,
                    "lat": plat,
                    "lng": plng,
                    "accessible": poi.get("wheelchair_accessible", True),
                    "popularity": 0.5,
                })

        # Gather Buildings with center coords
        for bid, b in manifest.buildings.items():
            center = b.get("center", {})
            blat = center.get("lat")
            blng = center.get("lng")
            if blat is None or blng is None:
                continue
            bcat = b.get("category", "building")
            dist_cent = _haversine_distance(cent_lat, cent_lng, blat, blng)
            if self._is_valid_candidate(bcat, dist_cent, request.max_radius_meters):
                if not any(c["id"] == bid for c in candidates):
                    candidates.append({
                        "id": bid,
                        "name": b.get("name", bid),
                        "category": bcat,
                        "lat": blat,
                        "lng": blng,
                        "accessible": b.get("wheelchair_accessible", True),
                        "popularity": 0.6 if bcat in PREFERRED_LANDMARK_CATEGORIES else 0.4,
                    })

        w1 = settings.MEETUP_WEIGHT_EQUIDISTANCE
        w2 = settings.MEETUP_WEIGHT_ACCESSIBILITY
        w3 = settings.MEETUP_WEIGHT_POPULARITY
        w4 = settings.MEETUP_WEIGHT_LANDMARK

        suggestions: List[MeetupSuggestion] = []
        warnings: List[str] = []

        route_mode = "accessible" if request.accessible else "walk"

        # Step 3 & 4 — Route computation for ALL participants to candidate landmark C
        for cand in candidates:
            participant_routes: List[ParticipantRouteInfo] = []
            distances: List[int] = []
            walk_times: List[int] = []
            all_found = True

            for p in participants:
                req_p = RouteRequest(
                    campus_id=request.campus_id,
                    mode=route_mode,
                    origin_coords=Coordinates(lat=p.lat, lng=p.lng),
                    destination=cand["id"],
                    destination_coords=Coordinates(lat=cand["lat"], lng=cand["lng"]),
                )
                route_p = calculate_route(req_p)

                if not route_p.found:
                    all_found = False
                    break

                dist_m = int(route_p.total_distance_meters)
                walk_s = int(route_p.estimated_time_minutes * 60)
                distances.append(dist_m)
                walk_times.append(walk_s)

                participant_routes.append(
                    ParticipantRouteInfo(
                        label=p.label or "Friend",
                        walk_time_seconds=walk_s,
                        distance_meters=dist_m,
                    )
                )

            if not all_found or not distances:
                continue

            # Group Fairness & Distance Metrics
            max_d = max(distances)
            min_d = min(distances)
            equi_delta = max_d - min_d

            equidistance_score = 1.0 - (equi_delta / float(max(max_d, 1)))
            accessibility_score = 1.0 if cand["accessible"] else 0.5
            popularity_score = cand.get("popularity", 0.5)

            # Low crowd boost for open spacious public spots
            cat_lower = cand["category"].lower()
            if request.prefer_low_crowd:
                crowd_score = 1.0 if cat_lower in LOW_CROWD_SPACIOUS_CATEGORIES else 0.4
            else:
                crowd_score = 1.0 if cat_lower in PREFERRED_LANDMARK_CATEGORIES else 0.7

            total_score = (
                w1 * equidistance_score
                + w2 * accessibility_score
                + w3 * popularity_score
                + w4 * crowd_score
            )

            reason_text = self._build_reason(
                cand["category"],
                len(participants),
                equidistance_score,
                request.prefer_low_crowd,
            )

            max_walk_min = round(max(walk_times) / 60.0, 1)
            avg_walk_min = round((sum(walk_times) / len(walk_times)) / 60.0, 1)

            suggestions.append(
                MeetupSuggestion(
                    poi_id=cand["id"],
                    name=cand["name"],
                    category=cand["category"],
                    lat=cand["lat"],
                    lng=cand["lng"],
                    walk_time_a=walk_times[0],
                    walk_time_b=walk_times[1] if len(walk_times) > 1 else walk_times[0],
                    distance_a=distances[0],
                    distance_b=distances[1] if len(distances) > 1 else distances[0],
                    equidistance_delta=equi_delta,
                    score=round(total_score, 4),
                    reason=reason_text,
                    accessible=cand["accessible"],
                    participant_routes=participant_routes,
                    max_walk_time_minutes=max_walk_min,
                    avg_walk_time_minutes=avg_walk_min,
                )
            )

        # Step 5 — Sort by score descending
        suggestions.sort(key=lambda s: s.score, reverse=True)
        top_suggestions = suggestions[: request.limit]

        if not top_suggestions:
            warnings.append(
                f"No suitable meetup spots found within {request.max_radius_meters}m of the group center. Try a wider radius."
            )
        elif request.accessible and not top_suggestions[0].accessible:
            warnings.append("Top suggestions may not be fully step-free accessible.")

        return MeetupResponse(
            midpoint={"lat": cent_lat, "lng": cent_lng},
            suggestions=top_suggestions,
            warnings=warnings,
        )


meetup_service = MeetupService()
