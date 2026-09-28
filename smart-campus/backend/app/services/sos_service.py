"""Business logic service for Emergency SOS Safety Layer."""

import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.manifest_loader import campus_store
from app.schemas.sos import SOSRequest, SOSResponse, SafePoint
from app.schemas.routing import RouteRequest, Coordinates
from app.services.routing_service import calculate_route, _haversine_distance
from app.repositories.sos_repository import sos_repo

logger = logging.getLogger(__name__)

SAFE_CATEGORIES = {"medical", "admin", "security"}


class SOSService:
    """Service handling emergency SOS triggers, safe point calculations, and contacts."""

    def get_emergency_contacts(self, campus_id: str) -> List[Dict[str, str]]:
        settings = get_settings()
        manifest = campus_store.get(campus_id)
        if manifest is None:
            manifest = campus_store.load(settings.CAMPUS_DATA_DIR, campus_id)

        contacts = manifest.campus_info.get("emergency_contacts")
        if contacts and isinstance(contacts, list):
            return contacts

        # Fallback default emergency contact numbers
        return [
            {"label": "Campus Security Plaza", "phone": "+91-160-301-1234"},
            {"label": "Campus Health Centre", "phone": "+91-160-301-5678"},
            {"label": "Women's Safety Helpline", "phone": "1091"},
        ]

    def get_safe_points(self, campus_id: str, lat: float, lng: float) -> List[SafePoint]:
        settings = get_settings()
        manifest = campus_store.get(campus_id)
        if manifest is None:
            manifest = campus_store.load(settings.CAMPUS_DATA_DIR, campus_id)

        candidates: List[Dict[str, Any]] = []

        # Gather relevant safe POIs
        for pid, poi in manifest.pois.items():
            plat = poi.get("lat")
            plng = poi.get("lng")
            if plat is None or plng is None:
                continue
            cat = poi.get("category", "").lower()
            meta = poi.get("metadata") or {}
            is_safe = meta.get("safe_point", False) or cat in SAFE_CATEGORIES

            if is_safe:
                candidates.append({
                    "id": pid,
                    "name": poi.get("name", pid),
                    "category": meta.get("type", cat),
                    "lat": plat,
                    "lng": plng,
                })

        # Also check administrative/security buildings
        for bid, b in manifest.buildings.items():
            bcat = b.get("category", "").lower()
            if bcat in SAFE_CATEGORIES:
                center = b.get("center", {})
                blat = center.get("lat")
                blng = center.get("lng")
                if blat and blng and not any(c["id"] == bid for c in candidates):
                    candidates.append({
                        "id": bid,
                        "name": b.get("name", bid),
                        "category": "security" if "security" in b["name"].lower() else bcat,
                        "lat": blat,
                        "lng": blng,
                    })

        safe_points: List[SafePoint] = []

        for cand in candidates:
            route_req = RouteRequest(
                campus_id=campus_id,
                origin_coords=Coordinates(lat=lat, lng=lng),
                destination=cand["id"],
                destination_coords=Coordinates(lat=cand["lat"], lng=cand["lng"]),
                mode="walk",
            )
            route_res = calculate_route(route_req)

            dist_m = int(route_res.total_distance_meters) if route_res.found else int(_haversine_distance(lat, lng, cand["lat"], cand["lng"]))
            walk_s = int(route_res.estimated_time_minutes * 60) if route_res.found else int(dist_m / 1.4)

            safe_points.append(
                SafePoint(
                    name=cand["name"],
                    category=cand["category"],
                    lat=cand["lat"],
                    lng=cand["lng"],
                    distance_meters=dist_m,
                    walk_seconds=walk_s,
                    building_id=cand["id"],
                )
            )

        # Sort by walk time ascending and take top 3
        safe_points.sort(key=lambda sp: sp.walk_seconds)
        return safe_points[:3]

    def trigger(self, db: Session, req: SOSRequest) -> SOSResponse:
        alert = sos_repo.create_alert(db, req)

        safe_points = self.get_safe_points(req.campus_id, req.lat, req.lng)
        contacts = self.get_emergency_contacts(req.campus_id)

        return SOSResponse(
            alert_id=alert.id,
            status="received",
            message="Alert sent. Help is on the way. Stay where you are.",
            safe_points=safe_points,
            emergency_contacts=contacts,
        )


sos_service = SOSService()
