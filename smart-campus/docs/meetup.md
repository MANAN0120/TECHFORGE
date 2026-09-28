# Smart Meetup Point Feature Documentation

## Overview

The **Smart Meetup Point** feature calculates an optimal, equidistant campus landmark for two users who wish to meet up on campus. Rather than suggesting a arbitrary coordinate, the engine analyzes official campus landmarks (cafes, libraries, student hubs, food courts) and returns the top 3 best locations with walk times, distances, and human-readable justifications.

---

## Architectural & Scoring Algorithm

### 1. Midpoint Calculation
Computes the geometric center coordinate between Person A and Person B:
$$ \text{mid\_lat} = \frac{\text{lat}_A + \text{lat}_B}{2}, \quad \text{mid\_lng} = \frac{\text{lng}_A + \text{lng}_B}{2} $$

### 2. Candidate Landmark Filtering
Extracts candidate POIs and buildings from the campus manifest (`campus-data/cu-gharaun/`):
- Filtered within `max_radius_meters` (default 400m) from the midpoint.
- **Excluded Categories**: `washroom`, `atm`, `parking`, `medical`.
- **Preferred Categories**: `food`, `cafeteria`, `library`, `sports`, `shop`, `student hub`, `plaza`.

### 3. Dual Route Pathfinding
For each candidate landmark $C$, the system calculates:
- $\text{route}_A$: shortest walking path from Person A to $C$
- $\text{route}_B$: shortest walking path from Person B to $C$

Using the NetworkX Dijkstra routing engine (`routing_service.py`), respecting wheelchair accessibility constraints if requested.

### 4. Weighted Ranking Formula
$$ \text{Score} = w_1 \cdot S_{\text{equidistance}} + w_2 \cdot S_{\text{accessibility}} + w_3 \cdot S_{\text{popularity}} + w_4 \cdot S_{\text{landmark}} $$

Where:
- $S_{\text{equidistance}} = 1.0 - \frac{|d_A - d_B|}{\max(d_A, d_B, 1)}$
- $S_{\text{accessibility}} = 1.0$ if accessible else $0.5$
- $S_{\text{popularity}} = 0.5$ (default baseline)
- $S_{\text{landmark}} = 1.0$ if food/library/sports else $0.7$

**Configurable Weights** (configured in `config.py` / `.env`):
- `MEETUP_WEIGHT_EQUIDISTANCE = 0.4`
- `MEETUP_WEIGHT_ACCESSIBILITY = 0.2`
- `MEETUP_WEIGHT_POPULARITY = 0.2`
- `MEETUP_WEIGHT_LANDMARK = 0.2`
- `MEETUP_DEFAULT_RADIUS_METERS = 400`

### 5. Reason Text Generation
Generates clear human justifications:
- `"Equidistant for both of you"` (if $S_{\text{equidistance}} > 0.85$)
- `"has seating"` (for food/cafes)
- `"quiet indoor space"` (for libraries)
- `"spacious meeting area"` (for sports/plazas)

---

## API Endpoint Specification

### `POST /api/meetup/suggest`

**Request Body**:
```json
{
  "campus_id": "cu-gharaun",
  "person_a": { "lat": 30.7695, "lng": 76.5748, "label": "Academic Block 1" },
  "person_b": { "lat": 30.7674, "lng": 76.5740, "label": "D6 Food Court" },
  "accessible": false,
  "max_radius_meters": 400,
  "limit": 3
}
```

**Response Body**:
```json
{
  "midpoint": { "lat": 30.76845, "lng": 76.5744 },
  "suggestions": [
    {
      "poi_id": "poi-central-library",
      "name": "Central Library (Knowledge Resource Centre)",
      "category": "library",
      "lat": 30.7689,
      "lng": 76.5736,
      "walk_time_a": 438,
      "walk_time_b": 162,
      "distance_a": 512,
      "distance_b": 190,
      "equidistance_delta": 322,
      "score": 0.6084,
      "reason": "quiet indoor space",
      "accessible": true
    }
  ],
  "warnings": []
}
```

---

## Testing & Verification

1. **Backend Unit Tests**:
   Run `pytest tests/meetup/test_meetup_service.py` to test equidistant scoring, accessibility filtering, empty radius warnings, and midpoint calculations.

2. **Frontend Build Verification**:
   Run `npm run build` in `frontend/` to verify TypeScript and Tailwind compilation.
