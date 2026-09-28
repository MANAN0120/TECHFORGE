# Campus Data Format

All campus-specific data lives in `campus-data/{campus_id}/` as JSON files.

## Files

| File | Description |
|------|------------|
| `campus.json` | Campus metadata (name, center, zoom) |
| `buildings.json` | Building definitions with coordinates |
| `nodes.json` | Graph nodes (gates, intersections, entrances) |
| `paths.json` | Graph edges connecting nodes |
| `pois.json` | Points of interest |
| `departments.json` | Academic departments mapped to buildings |
| `carts.json` | Campus cart definitions and routes |
| `shops.json` | On-campus shops and outlets |
| `events.sample.json` | Seed events for demo |

## Adding a New Campus

1. Create `campus-data/{new-campus-id}/` directory
2. Create all JSON files following the schema
3. Update `DEFAULT_CAMPUS_ID` in `.env` or load via API

No code changes required — the architecture is campus-agnostic.
