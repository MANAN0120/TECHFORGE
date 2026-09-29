# Map Layer Control & Declutter System

## Overview

The **Map Layer Control System** provides dynamic, category-based marker filtering for the Smart Campus Map. It eliminates visual clutter by keeping 60%+ of non-essential markers hidden by default, while allowing users to toggle specific marker layers on demand.

---

## Default Layer Configuration

By default, the map displays minimum noise to avoid overwhelming users on first load:

| Layer ID | Category | Icon | Default State |
|----------|----------|------|---------------|
| `buildings` | Academic & Admin Buildings | `Building2` | ✅ **ON** |
| `gates` | Entry & Exit Gates | `DoorOpen` | ✅ **ON** |
| `food` | Food & Cafes | `UtensilsCrossed` | ❌ OFF |
| `banks` | ATMs & Banks | `CreditCard` | ❌ OFF |
| `washrooms` | Washrooms | `Bath` | ❌ OFF |
| `medical` | Health & Medical | `HeartPulse` | ❌ OFF |
| `hostels` | Student Hostels | `BedDouble` | ❌ OFF |
| `sports` | Sports Arenas | `Dumbbell` | ❌ OFF |
| `shops` | Campus Stores | `Store` | ❌ OFF |
| `carts` | Live Carts | `Truck` | ❌ OFF |
| `events` | Campus Events | `CalendarHeart` | ❌ OFF |
| `parking` | Parking Lots | `CircleParking` | ❌ OFF |

---

## Architectural Principles

1. **Local State & Persistence**: State is stored in `localStorage` under `smartcampus.map.layers.v1`. Preferences persist across reloads.
2. **Campus Manifest Agnostic**: Layer categories with 0 items in the active campus manifest are hidden automatically from the control panel.
3. **Routing Priority**: Active turn-by-turn routes, origin/destination markers, and polylines ALWAYS render regardless of layer toggles.
4. **Search Auto-Discovery**: Searching for an item (e.g., `"cafeteria"` or selecting the `"Food"` filter chip) automatically enables the relevant layer (`food`).

---

## Component Architecture

- `frontend/src/features/map/layers/types.ts`: TypeScript interfaces for `LayerId`, `LayerDefinition`, and `LayerState`.
- `frontend/src/features/map/layers/layerDefinitions.ts`: Catalog of all supported map layer definitions and defaults.
- `frontend/src/features/map/layers/storage.ts`: Persistence helper reading and writing state to `localStorage`.
- `frontend/src/features/map/layers/useLayerCounts.ts`: Dynamically calculates marker counts per layer category.
- `frontend/src/features/map/layers/useMapLayers.ts`: React Context provider and hook (`useMapLayers()`).
- `frontend/src/features/map/layers/LayerToggleRow.tsx`: Reusable row item with checkbox, category icon, label, and live count badge.
- `frontend/src/features/map/layers/LayerControlPanel.tsx`: Desktop floating panel anchored at `bottom-left` (`left-6 bottom-6`).
- `frontend/src/features/map/layers/MobileLayerButton.tsx`: Mobile trigger button (`left-4 bottom-24`) and slide-up bottom sheet drawer.

---

## How to Add a New Map Layer

To register a new layer category (e.g., `libraries`):

1. **Add to `LayerId` type** in `frontend/src/features/map/layers/types.ts`:
   ```typescript
   export type LayerId = ... | "libraries";
   ```

2. **Register in `layerDefinitions.ts`**:
   ```typescript
   {
     id: "libraries",
     label: "Libraries & Study Lounges",
     icon: "BookOpen",
     source: "pois",
     filter: { field: "category", value: "library" },
     defaultEnabled: false,
   }
   ```

3. **Update count computation** in `useLayerCounts.ts`:
   ```typescript
   libraries: pois.filter((p) => p.category.toLowerCase() === 'library').length,
   ```

4. **Update render condition** in `CampusMap.tsx`:
   ```tsx
   {isEnabled("libraries") && <LibraryMarkers />}
   ```
