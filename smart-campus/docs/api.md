# API Reference

## Base URL
`http://localhost:8000`

## Endpoints

### Health
- `GET /health` — Health check

### Campus
- `GET /api/campus/{campus_id}` — Campus metadata
- `GET /api/campus/{campus_id}/buildings` — All buildings
- `GET /api/campus/{campus_id}/buildings/{building_id}` — Single building
- `GET /api/campus/{campus_id}/pois` — Points of interest
- `GET /api/campus/{campus_id}/geojson` — GeoJSON feature collection
- `GET /api/campus/{campus_id}/departments` — Departments
- `GET /api/campus/{campus_id}/nodes` — Graph nodes
- `GET /api/campus/{campus_id}/paths` — Graph paths
- `GET /api/campus/{campus_id}/carts` — Campus carts
- `GET /api/campus/{campus_id}/shops` — Campus shops
- `GET /api/campus/{campus_id}/events` — Campus events

### Search (Milestone 3)
- `GET /api/search?q={query}&campus_id={id}` — Search

### Navigation (Milestone 4)
- `POST /api/route` — Calculate route

### Assistant (Milestone 7)
- `POST /api/assistant/chat` — AI chat

### Events (Milestone 8)
- `GET /api/events` — List events
- `POST /api/events/{id}/photos` — Upload photo

### Carts (Milestone 9)
- `GET /api/carts` — List carts
- `GET /api/carts/nearest` — Nearest cart

### Shops (Milestone 10)
- `GET /api/shops` — List shops
- `POST /api/shops/{id}/reviews` — Add review

### Admin (Milestone 11-12)
- `POST /api/admin/conditions` — Block path
- `DELETE /api/admin/conditions/{id}` — Unblock path
