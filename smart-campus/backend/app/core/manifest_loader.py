"""Campus data manifest loader.

Reads JSON files from campus-data/{campus_id}/ and builds in-memory
data structures including a NetworkX graph for routing.
"""

import json
import logging
from pathlib import Path
from typing import Any

import networkx as nx

logger = logging.getLogger(__name__)


class CampusManifest:
    """Holds all loaded campus data for a single campus."""

    def __init__(self, campus_id: str):
        self.campus_id = campus_id
        self.campus_info: dict[str, Any] = {}
        self.buildings: dict[str, dict] = {}
        self.nodes: dict[str, dict] = {}
        self.paths: list[dict] = []
        self.pois: dict[str, dict] = {}
        self.departments: dict[str, dict] = {}
        self.carts: list[dict] = []
        self.shops: list[dict] = []
        self.events: list[dict] = []
        self.graph: nx.Graph = nx.Graph()

    def get_building(self, building_id: str) -> dict | None:
        return self.buildings.get(building_id)

    def get_node(self, node_id: str) -> dict | None:
        return self.nodes.get(node_id)

    def get_poi(self, poi_id: str) -> dict | None:
        return self.pois.get(poi_id)


def _load_json(filepath: Path) -> Any:
    """Load and parse a JSON file."""
    if not filepath.exists():
        logger.warning("File not found: %s", filepath)
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_graph(nodes: dict[str, dict], paths: list[dict]) -> nx.Graph:
    """Build a NetworkX graph from nodes and paths."""
    graph = nx.Graph()

    # Add nodes
    for node_id, node_data in nodes.items():
        graph.add_node(
            node_id,
            lat=node_data.get("lat"),
            lng=node_data.get("lng"),
            type=node_data.get("type"),
            building_id=node_data.get("building_id"),
            floor=node_data.get("floor"),
            label=node_data.get("label"),
            wheelchair_accessible=node_data.get("wheelchair_accessible", False),
        )

    # Add edges
    for path in paths:
        from_node = path["from_node"]
        to_node = path["to_node"]

        if from_node not in nodes:
            logger.warning("Path %s references unknown from_node: %s", path["id"], from_node)
            continue
        if to_node not in nodes:
            logger.warning("Path %s references unknown to_node: %s", path["id"], to_node)
            continue

        edge_data = {
            "path_id": path["id"],
            "distance": path.get("distance", 0),
            "estimated_time": path.get("estimated_time", 0),
            "mode": path.get("mode", "walk"),
            "accessible": path.get("accessible", True),
            "bidirectional": path.get("bidirectional", True),
            "indoor": path.get("indoor", False),
            "geometry": path.get("geometry"),
            "restrictions": path.get("restrictions", []),
        }

        graph.add_edge(from_node, to_node, **edge_data)

        # If not bidirectional, add as directed (we use undirected graph for simplicity,
        # but track directionality in metadata for future use)

    return graph


def load_campus_manifest(data_dir: str, campus_id: str) -> CampusManifest:
    """Load all campus data files and build the graph.

    Args:
        data_dir: Root campus-data directory path.
        campus_id: Campus identifier (subdirectory name).

    Returns:
        Populated CampusManifest instance.
    """
    campus_path = Path(data_dir) / campus_id
    if not campus_path.exists():
        raise FileNotFoundError(f"Campus data directory not found: {campus_path}")

    manifest = CampusManifest(campus_id)

    # Load campus info
    campus_info = _load_json(campus_path / "campus.json")
    if campus_info:
        manifest.campus_info = campus_info

    # Load buildings
    buildings_data = _load_json(campus_path / "buildings.json")
    if buildings_data:
        manifest.buildings = {b["id"]: b for b in buildings_data}
        logger.info("Loaded %d buildings for %s", len(manifest.buildings), campus_id)

    # Load nodes
    nodes_data = _load_json(campus_path / "nodes.json")
    if nodes_data:
        manifest.nodes = {n["id"]: n for n in nodes_data}
        logger.info("Loaded %d nodes for %s", len(manifest.nodes), campus_id)

    # Load paths
    paths_data = _load_json(campus_path / "paths.json")
    if paths_data:
        manifest.paths = paths_data
        logger.info("Loaded %d paths for %s", len(manifest.paths), campus_id)

    # Load POIs
    pois_data = _load_json(campus_path / "pois.json")
    if pois_data:
        manifest.pois = {p["id"]: p for p in pois_data}
        logger.info("Loaded %d POIs for %s", len(manifest.pois), campus_id)

    # Load departments
    departments_data = _load_json(campus_path / "departments.json")
    if departments_data:
        manifest.departments = {d["id"]: d for d in departments_data}
        logger.info("Loaded %d departments for %s", len(manifest.departments), campus_id)

    # Load carts
    carts_data = _load_json(campus_path / "carts.json")
    if carts_data:
        manifest.carts = carts_data
        logger.info("Loaded %d carts for %s", len(manifest.carts), campus_id)

    # Load shops
    shops_data = _load_json(campus_path / "shops.json")
    if shops_data:
        manifest.shops = shops_data
        logger.info("Loaded %d shops for %s", len(manifest.shops), campus_id)

    # Load events
    events_data = _load_json(campus_path / "events.sample.json")
    if events_data:
        manifest.events = events_data
        logger.info("Loaded %d seed events for %s", len(manifest.events), campus_id)

    # Build graph
    manifest.graph = _build_graph(manifest.nodes, manifest.paths)
    logger.info(
        "Built graph for %s: %d nodes, %d edges",
        campus_id,
        manifest.graph.number_of_nodes(),
        manifest.graph.number_of_edges(),
    )

    return manifest


class CampusDataStore:
    """Singleton-like store for loaded campus manifests."""

    def __init__(self):
        self._manifests: dict[str, CampusManifest] = {}

    def load(self, data_dir: str, campus_id: str) -> CampusManifest:
        """Load a campus manifest (cached after first load)."""
        if campus_id not in self._manifests:
            self._manifests[campus_id] = load_campus_manifest(data_dir, campus_id)
        return self._manifests[campus_id]

    def get(self, campus_id: str) -> CampusManifest | None:
        """Get a previously loaded campus manifest."""
        return self._manifests.get(campus_id)

    def list_campuses(self) -> list[str]:
        """List all loaded campus IDs."""
        return list(self._manifests.keys())


# Global instance
campus_store = CampusDataStore()
