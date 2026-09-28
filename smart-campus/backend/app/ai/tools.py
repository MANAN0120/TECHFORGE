"""Campus AI Assistant Tool Registry and Execution Wrappers."""

import json
from typing import Any
from sqlalchemy.orm import Session

from app.core.manifest_loader import campus_store
from app.services import search_service, routing_service, cart_service, event_service, shop_service
from app.schemas.routing import RouteRequest


def tool_search_campus(campus_id: str, query: str, category: str | None = None) -> dict[str, Any]:
    """Search for buildings, departments, POIs, shops, or facilities."""
    res = search_service.search_campus(campus_id=campus_id, query=query, category=category, limit=5)
    return {
        "total": res.total,
        "results": [
            {
                "id": r.id,
                "type": r.type,
                "title": r.title,
                "subtitle": r.subtitle,
                "category": r.category,
                "building_id": r.building_id,
                "floor": r.floor,
            }
            for r in res.results
        ],
    }


def tool_calculate_route(campus_id: str, origin: str, destination: str, mode: str = "walk", db: Session | None = None) -> dict[str, Any]:
    """Calculate walking or accessible route between two campus points."""
    req = RouteRequest(campus_id=campus_id, origin=origin, destination=destination, mode=mode)
    res = routing_service.calculate_route(req, db=db)
    if not res.found:
        return {"found": False, "message": res.message}
    return {
        "found": True,
        "mode": res.mode,
        "total_distance_meters": res.total_distance_meters,
        "estimated_time_minutes": res.estimated_time_minutes,
        "steps_count": len(res.steps),
        "steps": [s.instruction for s in res.steps[:5]] + (["..."] if len(res.steps) > 5 else []),
        "is_accessible": res.is_accessible,
    }


def tool_find_nearby(campus_id: str, category: str, building_id: str | None = None) -> dict[str, Any]:
    """Find nearby facilities (e.g. food, atm, washroom, library)."""
    manifest = campus_store.get(campus_id)
    if not manifest:
        return {"results": []}
    
    pois = list(manifest.pois.values())
    filtered = [p for p in pois if category.lower() in p.get("category", "").lower() or category.lower() in p.get("name", "").lower()]
    if building_id:
        filtered = [p for p in filtered if p.get("building_id") == building_id]
        
    return {
        "count": len(filtered),
        "pois": [{"id": p["id"], "name": p["name"], "category": p.get("category"), "building": p.get("building_id"), "floor": p.get("floor")} for p in filtered[:6]]
    }


def tool_list_active_events(campus_id: str, db: Session | None = None) -> dict[str, Any]:
    """List current and upcoming campus events."""
    if db is not None:
        events = event_service.get_events(db, campus_id=campus_id)
        return {
            "count": len(events),
            "events": [{"title": e.title, "venue": e.venue_name, "starts_at": e.starts_at, "status": e.status} for e in events[:5]]
        }
    manifest = campus_store.get(campus_id)
    events = manifest.events if manifest else []
    return {
        "count": len(events),
        "events": [{"title": e.get("title"), "venue": e.get("venue_name"), "starts_at": e.get("starts_at"), "status": e.get("status")} for e in events[:5]]
    }


def tool_find_nearest_cart(campus_id: str, lat: float, lng: float, db: Session | None = None) -> dict[str, Any]:
    """Find the closest campus cart given GPS coordinates."""
    if db is not None:
        nearest = cart_service.get_nearest_cart(db, campus_id=campus_id, lat=lat, lng=lng)
        if nearest:
            return {
                "cart_name": nearest.cart.name,
                "distance_meters": nearest.distance_meters,
                "eta_minutes": nearest.estimated_arrival_minutes,
                "driver": nearest.cart.driver_name,
                "driver_phone": nearest.cart.driver_phone,
            }
    return {"message": "No active cart found nearby."}


def tool_get_shop_reviews(campus_id: str, query: str, db: Session | None = None) -> dict[str, Any]:
    """Get shop details, rating, and recent reviews."""
    if db is not None:
        shops = shop_service.get_shops(db, campus_id=campus_id)
        match = next((s for s in shops if query.lower() in s.name.lower() or query.lower() in s.id.lower()), None)
        if match:
            return {
                "name": match.name,
                "category": match.category,
                "average_rating": match.average_rating,
                "total_reviews": match.total_reviews,
                "hours": f"{match.hours_open} - {match.hours_close}",
                "recent_reviews": [r.text for r in match.reviews[:3] if r.text],
            }
    return {"message": f"No shop information found matching '{query}'."}
