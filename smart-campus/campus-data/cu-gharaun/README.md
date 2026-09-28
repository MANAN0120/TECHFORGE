# CU Gharaun Campus Data — Provenance & Verification

## Campus: Chandigarh University, Gharuan, Punjab, India

### Data Sources

| Source | Used For | Reliability |
|--------|----------|-------------|
| OpenStreetMap | Campus center coordinates, general layout | High |
| CU Official Website (cuchd.in) | Building names, department assignments | Medium |
| Google Maps / Satellite | Building positions (satellite estimation) | Medium |
| Student Reports | Shop names, cart routes, D6 layout | Low - Estimated |

### Verification Status

All entities are marked with `verified: true` or `verified: false`.

- **verified: false** — Coordinates are satellite-estimated or based on general campus knowledge. Names may be approximate.
- **verified: true** — Confirmed through multiple sources or on-ground verification.

### Current Status (MVP)

- **Buildings**: 17 buildings, all `verified: false` (coordinates are satellite estimates)
- **Nodes**: 48 nodes (gates, intersections, entrances, cart stops, D6 indoor)
- **Paths**: 54 paths (outdoor walking + D6 indoor with stairs/lifts)
- **POIs**: 16 POIs covering food, ATMs, washrooms, libraries, medical, parking, sports, shops
- **Carts**: 5 carts with route geometries and stops
- **Shops**: 12 shops across food, stationery, printing, salon, grocery, electronics, pharmacy
- **Events**: 8 seed events for demo
- **Departments**: 15 departments mapped to buildings

### Indoor Mapping

- **D6 Student Centre**: Full 4-floor indoor graph (Ground, Floor 1, Floor 2, Floor 3) with stairs and lift connections
- **A Block**: Outdoor entrance only (indoor is stretch goal)

### Notes

1. Coordinates are NOT fabricated but are satellite-estimated from Google Maps/OSM. All marked `verified: false`.
2. Cart routes are plausible campus routes, not verified on-ground.
3. Shop names like "Maggi Point", "Chai Adda" are common campus shop types — actual names may differ.
4. D6 indoor graph is structurally correct (lobby → rooms, stairs/lift between floors) but physical positions are not GPS-mapped.
5. Events are fictional seed data for demo purposes.
