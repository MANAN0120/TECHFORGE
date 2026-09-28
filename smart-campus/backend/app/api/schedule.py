"""FastAPI router for Class Schedule Auto-Pilot walk-time previews."""

import logging
from fastapi import APIRouter, HTTPException
from app.schemas.schedule import SchedulePreviewRequest, ClassRoutePreview
from app.schemas.routing import RouteRequest, Coordinates
from app.services.routing_service import calculate_route
from app.core.manifest_loader import campus_store
from app.core.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


@router.post("/preview", response_model=ClassRoutePreview)
async def preview_class_route(req: SchedulePreviewRequest):
    """
    Returns estimated walk time from a user's location (or default entry point) to a building.
    Used by the class schedule UI to display 'Leave in X min' alongside each class.
    """
    settings = get_settings()
    manifest = campus_store.get(req.campus_id)
    if manifest is None:
        manifest = campus_store.load(settings.CAMPUS_DATA_DIR, req.campus_id)

    # Check if building exists in manifest
    building_data = manifest.buildings.get(req.building_id)
    building_name = building_data.get("name", req.building_id) if building_data else req.building_id

    # If building is completely unknown and not in manifest or POIs
    if not building_data and req.building_id not in manifest.pois:
        # Check by lowercase or partial match
        found_b = next((b for bid, b in manifest.buildings.items() if bid.lower() == req.building_id.lower()), None)
        if found_b:
            building_name = found_b.get("name", req.building_id)

    # Build routing request
    origin_coords = None
    if req.from_lat is not None and req.from_lng is not None:
        origin_coords = Coordinates(lat=req.from_lat, lng=req.from_lng)

    route_req = RouteRequest(
        campus_id=req.campus_id,
        origin="main-gate" if origin_coords is None else None,
        origin_coords=origin_coords,
        destination=req.building_id,
        mode="accessible" if req.accessible else "walk",
    )

    route_res = calculate_route(route_req)

    dist_m = int(route_res.total_distance_meters) if route_res.found else 350
    walk_s = int(route_res.estimated_time_minutes * 60) if route_res.found else 240
    walk_m = max(1, int(route_res.estimated_time_minutes)) if route_res.found else 4

    return ClassRoutePreview(
        building_id=req.building_id,
        building_name=building_name,
        distance_meters=dist_m,
        walk_seconds=walk_s,
        walk_minutes=walk_m,
        accessible=route_res.is_accessible,
    )
