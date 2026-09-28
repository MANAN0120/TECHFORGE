"""Routing service — Official Road & Campus Walkway Pathfinding Engine."""

import math
import json
import logging
import urllib.request
import urllib.error
from typing import Any
import networkx as nx
from sqlalchemy.orm import Session

from app.core.manifest_loader import campus_store, CampusManifest
from app.core.config import get_settings
from app.schemas.routing import RouteRequest, RouteResponse, TurnStep, Coordinates

logger = logging.getLogger(__name__)


def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great circle distance between two points in meters."""
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _fetch_osrm_official_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    mode: str = "walk",
) -> dict[str, Any] | None:
    """Fetch official paved road and pedestrian path routing from OpenStreetMap/OSRM engine."""
    profile = "foot" if mode == "walk" or mode == "accessible" else "driving"
    url = (
        f"https://router.project-osrm.org/route/v1/{profile}/"
        f"{start_lng:.6f},{start_lat:.6f};{end_lng:.6f},{end_lat:.6f}"
        f"?overview=full&geometries=geojson&steps=true"
    )

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "SmartCampusNavigator/1.0 (Chandigarh University)"},
        )
        with urllib.request.urlopen(req, timeout=3.5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                if data.get("code") == "Ok" and data.get("routes"):
                    return data["routes"][0]
    except Exception as e:
        logger.warning("OSRM official road routing service unavailable, using campus graph: %s", e)
    return None


def _find_nearest_node(manifest: CampusManifest, lat: float, lng: float, wheelchair_only: bool = False) -> str | None:
    """Find the nearest graph node to given coordinates."""
    best_node = None
    min_dist = float("inf")

    for node_id, data in manifest.nodes.items():
        n_lat = data.get("lat")
        n_lng = data.get("lng")
        if n_lat is None or n_lng is None:
            continue
        if wheelchair_only and not data.get("wheelchair_accessible", True):
            continue

        dist = _haversine_distance(lat, lng, n_lat, n_lng)
        if dist < min_dist:
            min_dist = dist
            best_node = node_id

    return best_node


def _get_entity_coords(manifest: CampusManifest, identifier: str | None, coords: Coordinates | None) -> tuple[float, float] | None:
    """Extract lat/lng for any building, POI, node, or coordinate object."""
    if coords and coords.lat is not None and coords.lng is not None:
        return (coords.lat, coords.lng)
    if not identifier:
        return None
    if identifier in manifest.buildings:
        c = manifest.buildings[identifier].get("center", {})
        if c.get("lat") and c.get("lng"):
            return (c["lat"], c["lng"])
    if identifier in manifest.pois:
        p = manifest.pois[identifier]
        if p.get("lat") and p.get("lng"):
            return (p["lat"], p["lng"])
    if identifier in manifest.nodes:
        n = manifest.nodes[identifier]
        if n.get("lat") and n.get("lng"):
            return (n["lat"], n["lng"])
    return None


def _resolve_node(manifest: CampusManifest, identifier: str | None, coords: Coordinates | None, wheelchair_only: bool = False) -> str | None:
    """Resolve identifier or coordinates to the closest official campus graph node."""
    if coords and (coords.lat is not None and coords.lng is not None):
        return _find_nearest_node(manifest, coords.lat, coords.lng, wheelchair_only)

    if not identifier:
        return None

    if identifier in manifest.nodes:
        return identifier

    ident_clean = identifier.lower().strip()

    # Match by building ID, name, or short_name
    for bid, building in manifest.buildings.items():
        b_name = building.get("name", "").lower()
        b_short = building.get("short_name", "").lower()
        if bid == ident_clean or ident_clean in b_name or b_name in ident_clean or ident_clean == b_short or b_short in ident_clean:
            entrances = building.get("entrances", [])
            if entrances:
                if wheelchair_only:
                    acc_entrances = [e for e in entrances if e.get("accessible", False)]
                    if acc_entrances:
                        e = acc_entrances[0]
                        if e.get("id") in manifest.nodes:
                            return e["id"]
                        return _find_nearest_node(manifest, e["lat"], e["lng"], wheelchair_only)
                
                primary = next((e for e in entrances if e.get("is_primary")), entrances[0])
                if primary.get("id") in manifest.nodes:
                    return primary["id"]
                return _find_nearest_node(manifest, primary["lat"], primary["lng"], wheelchair_only)

            center = building.get("center", {})
            if center.get("lat") and center.get("lng"):
                return _find_nearest_node(manifest, center["lat"], center["lng"], wheelchair_only)

    # Match by POI ID or name
    for pid, poi in manifest.pois.items():
        p_name = poi.get("name", "").lower()
        if pid == ident_clean or ident_clean in p_name or p_name in ident_clean:
            if poi.get("lat") and poi.get("lng"):
                return _find_nearest_node(manifest, poi["lat"], poi["lng"], wheelchair_only)

    # Match by node label
    for nid, ndata in manifest.nodes.items():
        n_lbl = ndata.get("label", "").lower()
        if n_lbl == ident_clean or ident_clean in n_lbl:
            return nid

    return None


def _calculate_bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate bearing from point 1 to point 2 in degrees (0-360)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lng2 - lng1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    theta = math.atan2(y, x)
    return (math.degrees(theta) + 360) % 360


def _generate_turn_steps(manifest: CampusManifest, node_path: list[str]) -> list[TurnStep]:
    """Generate human-readable turn-by-turn navigation instructions."""
    steps: list[TurnStep] = []
    if not node_path:
        return steps

    if len(node_path) == 1:
        n = manifest.nodes.get(node_path[0], {})
        steps.append(
            TurnStep(
                step_index=1,
                instruction=f"You are at {n.get('label', node_path[0])}",
                distance_meters=0,
                duration_seconds=0,
                from_node=node_path[0],
                to_node=node_path[0],
                lat=n.get("lat"),
                lng=n.get("lng"),
                action="arrive",
            )
        )
        return steps

    prev_bearing = None

    for i in range(len(node_path) - 1):
        curr_id = node_path[i]
        next_id = node_path[i + 1]

        curr_data = manifest.nodes.get(curr_id, {})
        next_data = manifest.nodes.get(next_id, {})
        edge_data = manifest.graph.get_edge_data(curr_id, next_id, {})

        distance = edge_data.get("distance", 0.0)
        duration = edge_data.get("estimated_time", distance / 1.4)
        mode = edge_data.get("mode", "walk")
        action = "straight"
        floor_change = None

        lat1, lng1 = curr_data.get("lat"), curr_data.get("lng")
        lat2, lng2 = next_data.get("lat"), next_data.get("lng")

        curr_floor = curr_data.get("floor")
        next_floor = next_data.get("floor")

        if curr_floor is not None and next_floor is not None and curr_floor != next_floor:
            floor_diff = next_floor - curr_floor
            direction = "up" if floor_diff > 0 else "down"
            if mode == "lift":
                instruction = f"Take the elevator {direction} to Floor {next_floor}"
                action = "change_floor"
                floor_change = "lift"
            elif mode == "stairs":
                instruction = f"Take the stairs {direction} to Floor {next_floor}"
                action = "change_floor"
                floor_change = "stairs"
            elif mode == "ramp":
                instruction = f"Take the accessible ramp {direction} to Floor {next_floor}"
                action = "change_floor"
                floor_change = "ramp"
            else:
                instruction = f"Proceed {direction} to Floor {next_floor}"
                action = "change_floor"
        elif i == 0:
            dest_label = next_data.get("label") or next_id
            instruction = f"Start at {curr_data.get('label', curr_id)} and follow the official road toward {dest_label}"
            action = "depart"
        else:
            dest_label = next_data.get("label") or next_id
            if lat1 is not None and lng1 is not None and lat2 is not None and lng2 is not None:
                curr_bearing = _calculate_bearing(lat1, lng1, lat2, lng2)
                if prev_bearing is not None:
                    turn_angle = (curr_bearing - prev_bearing + 180) % 360 - 180
                    if turn_angle < -40:
                        instruction = f"Turn left onto the paved walkway toward {dest_label}"
                        action = "turn_left"
                    elif turn_angle > 40:
                        instruction = f"Turn right onto the paved walkway toward {dest_label}"
                        action = "turn_right"
                    else:
                        instruction = f"Continue straight along the official walkway toward {dest_label}"
                        action = "straight"
                else:
                    instruction = f"Continue along the path toward {dest_label}"
                prev_bearing = curr_bearing
            else:
                instruction = f"Proceed toward {dest_label}"

        steps.append(
            TurnStep(
                step_index=i + 1,
                instruction=instruction,
                distance_meters=round(distance, 1),
                duration_seconds=round(duration, 1),
                from_node=curr_id,
                to_node=next_id,
                lat=lat1,
                lng=lng1,
                action=action,
                floor_change=floor_change,
            )
        )

    final_node = manifest.nodes.get(node_path[-1], {})
    steps.append(
        TurnStep(
            step_index=len(node_path),
            instruction=f"Arrived at destination: {final_node.get('label', node_path[-1])}",
            distance_meters=0.0,
            duration_seconds=0.0,
            from_node=node_path[-1],
            to_node=node_path[-1],
            lat=final_node.get("lat"),
            lng=final_node.get("lng"),
            action="arrive",
        )
    )

    return steps


def calculate_route(
    request: RouteRequest,
    db: Session | None = None,
) -> RouteResponse:
    """Calculate optimal route along official roads and campus paved walkways."""
    manifest = campus_store.get(request.campus_id)
    if manifest is None:
        settings = get_settings()
        manifest = campus_store.load(settings.CAMPUS_DATA_DIR, request.campus_id)

    is_accessible = request.mode == "accessible"

    # 1. Check if direct GPS coordinates are supplied (e.g. user real-time location)
    start_coords = _get_entity_coords(manifest, request.origin, request.origin_coords)
    end_coords = _get_entity_coords(manifest, request.destination, request.destination_coords)

    # 2. Try official road routing via OpenStreetMap / OSRM engine first for real roads
    if start_coords and end_coords:
        s_lat, s_lng = start_coords
        e_lat, e_lng = end_coords
        
        # Call OSRM for official paved road network
        osrm_data = _fetch_osrm_official_route(s_lat, s_lng, e_lat, e_lng, mode=request.mode)
        if osrm_data and "geometry" in osrm_data and osrm_data["geometry"].get("coordinates"):
            raw_coords = osrm_data["geometry"]["coordinates"]  # [[lng, lat], ...]
            road_coords = [[pt[1], pt[0]] for pt in raw_coords]
            total_dist = osrm_data.get("distance", 0.0)
            total_duration = osrm_data.get("duration", total_dist / 1.4)

            # Build turn-by-turn steps from OSRM legs
            steps: list[TurnStep] = []
            legs = osrm_data.get("legs", [])
            step_idx = 1
            if legs and "steps" in legs[0]:
                for st in legs[0]["steps"]:
                    maneuver = st.get("maneuver", {})
                    m_type = maneuver.get("type", "straight")
                    m_mod = maneuver.get("modifier", "")
                    name = st.get("name") or "Campus Road"
                    m_loc = maneuver.get("location", [s_lng, s_lat])

                    if m_type == "depart":
                        instruction = f"Head on {name} toward campus"
                        action = "depart"
                    elif "left" in m_mod:
                        instruction = f"Turn left onto {name}"
                        action = "turn_left"
                    elif "right" in m_mod:
                        instruction = f"Turn right onto {name}"
                        action = "turn_right"
                    elif m_type == "arrive":
                        instruction = "Arrived at destination"
                        action = "arrive"
                    else:
                        instruction = f"Continue on {name}"
                        action = "straight"

                    steps.append(
                        TurnStep(
                            step_index=step_idx,
                            instruction=instruction,
                            distance_meters=round(st.get("distance", 0), 1),
                            duration_seconds=round(st.get("duration", 0), 1),
                            from_node=f"step-{step_idx}",
                            to_node=f"step-{step_idx+1}",
                            lat=m_loc[1] if len(m_loc) > 1 else None,
                            lng=m_loc[0] if len(m_loc) > 0 else None,
                            action=action,
                        )
                    )
                    step_idx += 1

            if not steps:
                steps = [
                    TurnStep(
                        step_index=1,
                        instruction="Follow official paved road to destination",
                        distance_meters=round(total_dist, 1),
                        duration_seconds=round(total_duration, 1),
                        from_node="origin",
                        to_node="destination",
                        lat=s_lat,
                        lng=s_lng,
                        action="depart",
                    ),
                    TurnStep(
                        step_index=2,
                        instruction="Arrived at destination",
                        distance_meters=0,
                        duration_seconds=0,
                        from_node="destination",
                        to_node="destination",
                        lat=e_lat,
                        lng=e_lng,
                        action="arrive",
                    ),
                ]

            return RouteResponse(
                campus_id=request.campus_id,
                found=True,
                mode=request.mode,
                total_distance_meters=round(total_dist, 1),
                estimated_time_minutes=round(max(1.0, total_duration / 60.0), 1),
                node_ids=["start-gps", "end-gps"],
                path_coordinates=road_coords,
                steps=steps,
                is_accessible=is_accessible,
                avoided_blocked_paths=[],
                message="Official road route calculated successfully.",
            )

    # 3. Fallback to Campus Graph NetworkX Routing
    start_node = _resolve_node(manifest, request.origin, request.origin_coords, is_accessible)
    end_node = _resolve_node(manifest, request.destination, request.destination_coords, is_accessible)

    if not start_node or not end_node:
        return RouteResponse(
            campus_id=request.campus_id,
            found=False,
            mode=request.mode,
            total_distance_meters=0,
            estimated_time_minutes=0,
            node_ids=[],
            path_coordinates=[],
            steps=[],
            is_accessible=is_accessible,
            message="Could not resolve starting point or destination on campus map.",
        )

    blocked_path_ids: set[str] = set()
    if db is not None:
        try:
            from app.models.condition import Condition
            conditions = db.query(Condition).filter(
                Condition.campus_id == request.campus_id,
                Condition.active == 1,
            ).all()
            for c in conditions:
                blocked_path_ids.add(c.path_id)
        except Exception as e:
            logger.warning("Could not query dynamic conditions: %s", e)

    G = manifest.graph.copy()
    edges_to_remove = []
    avoided_paths: list[str] = []

    for u, v, data in G.edges(data=True):
        path_id = data.get("path_id", "")
        if path_id in blocked_path_ids:
            edges_to_remove.append((u, v))
            avoided_paths.append(path_id)
            continue
        if is_accessible:
            if not data.get("accessible", True) or data.get("mode") == "stairs":
                edges_to_remove.append((u, v))

    for u, v in edges_to_remove:
        if G.has_edge(u, v):
            G.remove_edge(u, v)

    try:
        path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight="distance")
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return RouteResponse(
            campus_id=request.campus_id,
            found=False,
            mode=request.mode,
            total_distance_meters=0,
            estimated_time_minutes=0,
            node_ids=[],
            path_coordinates=[],
            steps=[],
            is_accessible=is_accessible,
            avoided_blocked_paths=avoided_paths,
            message=f"No {'wheelchair-accessible ' if is_accessible else ''}route found between {start_node} and {end_node}.",
        )

    # Reconstruct exact paved walkway geometry from paths
    total_distance = 0.0
    total_time_seconds = 0.0
    path_coords: list[list[float]] = []

    for i in range(len(path_nodes)):
        nid = path_nodes[i]
        ndata = manifest.nodes.get(nid, {})
        nlat, nlng = ndata.get("lat"), ndata.get("lng")

        if i == 0 and nlat is not None and nlng is not None:
            path_coords.append([nlat, nlng])

        if i < len(path_nodes) - 1:
            next_id = path_nodes[i + 1]
            edge_data = manifest.graph.get_edge_data(nid, next_id, {})
            dist = edge_data.get("distance", 0.0)
            etime = edge_data.get("estimated_time", dist / 1.4)
            total_distance += dist
            total_time_seconds += etime

            # Check if detailed polyline geometry exists on this edge
            geom = edge_data.get("geometry")
            if geom and isinstance(geom, list) and len(geom) > 0:
                for pt in geom:
                    if len(path_coords) == 0 or path_coords[-1] != pt:
                        path_coords.append(pt)
            else:
                next_node_data = manifest.nodes.get(next_id, {})
                nxlat, nxlng = next_node_data.get("lat"), next_node_data.get("lng")
                if nxlat is not None and nxlng is not None:
                    path_coords.append([nxlat, nxlng])

    steps = _generate_turn_steps(manifest, path_nodes)

    return RouteResponse(
        campus_id=request.campus_id,
        found=True,
        mode=request.mode,
        total_distance_meters=round(total_distance, 1),
        estimated_time_minutes=round(max(1.0, total_time_seconds / 60.0), 1),
        node_ids=path_nodes,
        path_coordinates=path_coords,
        steps=steps,
        is_accessible=is_accessible,
        avoided_blocked_paths=avoided_paths,
        message="Route calculated successfully along official campus walkways.",
    )
