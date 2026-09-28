# Routing Engine

The routing engine uses NetworkX's Dijkstra shortest path algorithm on an abstract graph.

## Graph Structure
- **Nodes**: Gates, intersections, building entrances, rooms, lifts, stairs, cart stops
- **Edges**: Walking paths with distance, time, mode, and accessibility metadata

## Routing Modes
- `walk` — Standard walking route (uses all accessible paths)
- `accessible` — Wheelchair-friendly route (avoids stairs, uses lifts and ramps)

## Dynamic Conditions
Active conditions (blocked paths) are loaded from the database and edges are temporarily removed from the graph before path calculation.
