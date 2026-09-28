"""Campus service — business logic for campus data queries."""

from app.core.manifest_loader import CampusManifest, campus_store
from app.core.config import get_settings


def _get_manifest(campus_id: str) -> CampusManifest:
    """Get campus manifest, loading if necessary."""
    manifest = campus_store.get(campus_id)
    if manifest is None:
        settings = get_settings()
        manifest = campus_store.load(settings.CAMPUS_DATA_DIR, campus_id)
    return manifest


def get_campus_info(campus_id: str) -> dict:
    """Return campus metadata."""
    manifest = _get_manifest(campus_id)
    return manifest.campus_info


def get_buildings(campus_id: str) -> list[dict]:
    """Return all buildings for a campus."""
    manifest = _get_manifest(campus_id)
    return list(manifest.buildings.values())


def get_building(campus_id: str, building_id: str) -> dict | None:
    """Return a single building by ID."""
    manifest = _get_manifest(campus_id)
    return manifest.get_building(building_id)


def get_pois(campus_id: str, category: str | None = None) -> list[dict]:
    """Return all POIs, optionally filtered by category."""
    manifest = _get_manifest(campus_id)
    pois = list(manifest.pois.values())
    if category:
        pois = [p for p in pois if p.get("category") == category]
    return pois


def get_departments(campus_id: str) -> list[dict]:
    """Return all departments."""
    manifest = _get_manifest(campus_id)
    return list(manifest.departments.values())


def get_geojson(campus_id: str) -> dict:
    """Return campus data as GeoJSON FeatureCollection.

    Includes buildings and POIs as features.
    """
    manifest = _get_manifest(campus_id)
    features = []

    # Buildings as features
    for building in manifest.buildings.values():
        center = building.get("center", {})
        if center.get("lat") and center.get("lng"):
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [center["lng"], center["lat"]],
                },
                "properties": {
                    "id": building["id"],
                    "name": building["name"],
                    "short_name": building.get("short_name", ""),
                    "category": building.get("category", ""),
                    "type": "building",
                    "floors": building.get("floors", 1),
                    "description": building.get("description", ""),
                    "verified": building.get("verified", False),
                },
            }

            # Use polygon geometry if available
            if building.get("geometry"):
                feature["geometry"] = building["geometry"]

            features.append(feature)

    # POIs as features
    for poi in manifest.pois.values():
        if poi.get("lat") and poi.get("lng"):
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [poi["lng"], poi["lat"]],
                    },
                    "properties": {
                        "id": poi["id"],
                        "name": poi["name"],
                        "category": poi.get("category", ""),
                        "type": "poi",
                        "building_id": poi.get("building_id"),
                        "floor": poi.get("floor"),
                        "description": poi.get("description", ""),
                        "wheelchair_accessible": poi.get("wheelchair_accessible", False),
                        "verified": poi.get("verified", False),
                    },
                }
            )

    return {"type": "FeatureCollection", "features": features}


def get_nodes(campus_id: str) -> list[dict]:
    """Return all graph nodes."""
    manifest = _get_manifest(campus_id)
    return list(manifest.nodes.values())


def get_paths(campus_id: str) -> list[dict]:
    """Return all graph paths/edges."""
    manifest = _get_manifest(campus_id)
    return manifest.paths


def get_carts(campus_id: str) -> list[dict]:
    """Return all carts."""
    manifest = _get_manifest(campus_id)
    return manifest.carts


def get_shops(campus_id: str) -> list[dict]:
    """Return all shops."""
    manifest = _get_manifest(campus_id)
    return manifest.shops


def get_events(campus_id: str) -> list[dict]:
    """Return all seed events."""
    manifest = _get_manifest(campus_id)
    return manifest.events
