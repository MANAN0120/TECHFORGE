"""Campus API router — endpoints for campus data queries."""

from fastapi import APIRouter, HTTPException

from app.services import campus_service

router = APIRouter(prefix="/api/campus", tags=["campus"])


@router.get("/{campus_id}")
def get_campus(campus_id: str):
    """Get campus metadata."""
    try:
        info = campus_service.get_campus_info(campus_id)
        if not info:
            raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")
        return info
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/buildings")
def get_buildings(campus_id: str):
    """Get all buildings for a campus."""
    try:
        buildings = campus_service.get_buildings(campus_id)
        return {"campus_id": campus_id, "count": len(buildings), "buildings": buildings}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/buildings/{building_id}")
def get_building(campus_id: str, building_id: str):
    """Get a single building by ID."""
    try:
        building = campus_service.get_building(campus_id, building_id)
        if building is None:
            raise HTTPException(
                status_code=404, detail=f"Building '{building_id}' not found"
            )
        return building
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/pois")
def get_pois(campus_id: str, category: str | None = None):
    """Get all POIs, optionally filtered by category."""
    try:
        pois = campus_service.get_pois(campus_id, category)
        return {"campus_id": campus_id, "count": len(pois), "pois": pois}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/geojson")
def get_geojson(campus_id: str):
    """Get campus data as GeoJSON FeatureCollection."""
    try:
        return campus_service.get_geojson(campus_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/departments")
def get_departments(campus_id: str):
    """Get all departments."""
    try:
        departments = campus_service.get_departments(campus_id)
        return {"campus_id": campus_id, "count": len(departments), "departments": departments}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/nodes")
def get_nodes(campus_id: str):
    """Get all graph nodes."""
    try:
        nodes = campus_service.get_nodes(campus_id)
        return {"campus_id": campus_id, "count": len(nodes), "nodes": nodes}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/paths")
def get_paths(campus_id: str):
    """Get all graph paths."""
    try:
        paths = campus_service.get_paths(campus_id)
        return {"campus_id": campus_id, "count": len(paths), "paths": paths}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/carts")
def get_carts(campus_id: str):
    """Get all campus carts."""
    try:
        carts = campus_service.get_carts(campus_id)
        return {"campus_id": campus_id, "count": len(carts), "carts": carts}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/shops")
def get_shops(campus_id: str):
    """Get all campus shops."""
    try:
        shops = campus_service.get_shops(campus_id)
        return {"campus_id": campus_id, "count": len(shops), "shops": shops}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")


@router.get("/{campus_id}/events")
def get_events(campus_id: str):
    """Get seed events."""
    try:
        events = campus_service.get_events(campus_id)
        return {"campus_id": campus_id, "count": len(events), "events": events}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{campus_id}' not found")
