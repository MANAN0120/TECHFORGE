# Architecture Overview

## System Architecture

The Smart Campus Navigator follows a three-tier architecture:

```
┌─────────────────────────────────────────────┐
│                 Frontend                     │
│    React 18 + TypeScript + Vite + Tailwind  │
│    Leaflet + react-leaflet                  │
│    CartoDB Dark Matter Tiles                │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
┌──────────────────┴──────────────────────────┐
│                 Backend                      │
│    Python 3.11 + FastAPI + Uvicorn          │
│    NetworkX (graph/routing)                 │
│    Google Gemini (AI assistant)             │
├─────────────────────────────────────────────┤
│    Data Layer                               │
│    JSON Manifests (campus-data/)            │
│    SQLite (user-generated content)          │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Campus-Agnostic Architecture**: All campus data lives in JSON manifests. No hardcoded values.
2. **Graph-Based Routing**: NetworkX processes an abstract graph. No building-specific logic.
3. **Accessibility as Edge Metadata**: `accessible` and `mode` fields on edges enable filtering.
4. **AI Tool Calling**: The LLM never invents data — it calls backend tools for all facts.
5. **Separation of Concerns**: UI / Services / Data layers are strictly separated.
