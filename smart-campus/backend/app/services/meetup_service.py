"""Smart Meetup Point Calculation Service."""

import logging
from typing import List, Dict, Any, Tuple
from app.core.config import get_settings
from app.core.manifest_loader import campus_store, CampusManifest
from app.schemas.meetup import (
    MeetupRequest,
    MeetupResponse,
    MeetupSuggestion,
    PersonLocation,
)
from app.schemas.routing import RouteRequest, Coordinates
from app.services.routing_service import calculate_route, _haversine_distance

logger = logging.getLogger(__name__)

EXCLUDED_CATEGORIES = {"washroom", "atm", "parking", "medical"}
PREFERRED_LANDMARK_CATEGORIES = {"food", "cafeteria", "library", "sports", "shop", "student hub", "plaza"}


class MeetupService:
    """Service to compute optimal equidistant meetup landmarks for two people on campus."""

    def _compute_midpoint(self, a: PersonLocation, b: PersonLocation) -> Tuple[float, float]:
        """Compute the geometric midpoint between Person A and Person B."""
        mid_lat = (a.lat + b.lat) / 2.0
        mid_lng = (a.lng + b.lng) / 2.0
        return (mid_lat, mid_lng)

    def _is_valid_candidate(self, category: str, radius_dist: float, max_radius: float) -> bool:
        """Filter out invalid categories or landmarks outside max radius."""
        if radius_dist > max_radius:
            return False
        cat_lower = category.lower().strip()
        if cat_lower in EXCLUDED_CATEGORIES:
            return False
        return True

    def _build_reason(self, category: str, equidistance_score: float, popularity_score: float) -> str:
        """Generate human-readable justification for the meetup spot."""
        reasons: List[str] = []
        cat_lower = category.lower().strip()

        if equidistance_score > 0.85:
            reasons.append("Equidistant for both of you")
        if popularity_score > 0.7:
            reasons.append("Popular hangout spot")
        
        if cat_lower in ["food", "cafeteria", "shop"]:
            reasons.append("has seating")
        elif cat_lower == "library":
            reasons.append("quiet indoor space")
        elif cat_lower in ["sports", "plaza", "student hub"]:
            reasons.append("spacious meeting area")

        if not reasons:
            reasons.append("Central campus landmark")

        # Combine up to 2 reason items
        return ", ".join(reasons[:2])

    def suggest_meetup(self, request: MeetupRequest) -> MeetupResponse:
        """Calculate and return top recommended meetup points for two users."""
        settings = get_settings()
        manifest = campus_store.get(request.campus_id)
        if manifest is None:
            manifest = campus_store.load(settings.CAMPUS_DATA_DIR, request.campus_id)

        # Step 1 — Compute geometric midpoint
        mid_lat, mid_lng = self._compute_midpoint(request.person_a, request.person_b)

        # Step 2 — Collect candidate POIs & buildings from manifest
        candidates: List[Dict[str, Any]] = []

        # Gather POIs
        for pid, poi in manifest.pois.items():
            plat = poi.get("lat")
            plng = poi.get("lng")
            if plat is None or plng is None:
                continue
            cat = poi.get("category", "poi")
            dist_mid = _haversine_distance(mid_lat, mid_lng, plat, plng)
            if self._is_valid_candidate(cat, dist_mid, request.max_radius_meters):
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
            dist_mid = _haversine_distance(mid_lat, mid_lng, blat, blng)
            if self._is_valid_candidate(bcat, dist_mid, request.max_radius_meters):
                # Avoid duplicate if building is already represented by a POI
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

        # Step 3 & 4 — Route computation and scoring
        route_mode = "accessible" if request.accessible else "walk"

        for cand in candidates:
            # Route for Person A
            req_a = RouteRequest(
                campus_id=request.campus_id,
                mode=route_mode,
                origin_coords=Coordinates(lat=request.person_a.lat, lng=request.person_a.lng),
                destination=cand["id"],
                destination_coords=Coordinates(lat=cand["lat"], lng=cand["lng"]),
            )
            route_a = calculate_route(req_a)

            # Route for Person B
            req_b = RouteRequest(
                campus_id=request.campus_id,
                mode=route_mode,
                origin_coords=Coordinates(lat=request.person_b.lat, lng=request.person_b.lng),
                destination=cand["id"],
                destination_coords=Coordinates(lat=cand["lat"], lng=cand["lng"]),
            )
            route_b = calculate_route(req_b)

            if not route_a.found or not route_b.found:
                continue

            dist_a = int(route_a.total_distance_meters)
            dist_b = int(route_b.total_distance_meters)
            walk_a = int(route_a.estimated_time_minutes * 60)
            walk_b = int(route_b.estimated_time_minutes * 60)
            equi_delta = abs(dist_a - dist_b)

            max_d = max(dist_a, dist_b, 1)
            equidistance_score = 1.0 - (equi_delta / float(max_d))
            accessibility_score = 1.0 if cand["accessible"] else 0.5
            popularity_score = cand.get("popularity", 0.5)
            landmark_score = 1.0 if cand["category"].lower() in PREFERRED_LANDMARK_CATEGORIES else 0.7

            total_score = (
                w1 * equidistance_score
                + w2 * accessibility_score
                + w3 * popularity_score
                + w4 * landmark_score
            )

            reason_text = self._build_reason(cand["category"], equidistance_score, popularity_score)

            suggestions.append(
                MeetupSuggestion(
                    poi_id=cand["id"],
                    name=cand["name"],
                    category=cand["category"],
                    lat=cand["lat"],
                    lng=cand["lng"],
                    walk_time_a=walk_a,
                    walk_time_b=walk_b,
                    distance_a=dist_a,
                    distance_b=dist_b,
                    equidistance_delta=equi_delta,
                    score=round(total_score, 4),
                    reason=reason_text,
                    accessible=cand["accessible"],
                )
            )

        # Step 6 — Sort by score descending
        suggestions.sort(key=lambda s: s.score, reverse=True)
        top_suggestions = suggestions[: request.limit]

        # Step 7 — Warnings check
        if not top_suggestions:
            warnings.append(
                f"No suitable meetup spots found within {request.max_radius_meters}m. Try a wider radius."
            )
        elif request.accessible and not top_suggestions[0].accessible:
            warnings.append("Top suggestions may not be fully accessible.")

        return MeetupResponse(
            midpoint={"lat": mid_lat, "lng": mid_lng},
            suggestions=top_suggestions,
            warnings=warnings,
        )


meetup_service = MeetupService()
