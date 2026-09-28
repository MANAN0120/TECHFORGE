# Smart Meetup Point Feature Documentation (Group & Multi-Person Support)

## Overview

The **Smart Meetup Point** feature calculates an optimal, equidistant campus landmark for groups of two or more users (friends, study groups, teams) wishing to meet up on campus.

Rather than suggesting an arbitrary coordinate, the engine analyzes official campus landmarks (plazas, open food courts, quiet spaces, libraries, student hubs) and returns top recommendations with:
- Per-participant walk times and distances
- Low-crowd / spacious open public area filtering (for group gathering)
- Visual multi-user route polylines converging at the common meetup spot

---

## Architectural & Scoring Algorithm

### 1. Multi-User Group Centroid
Computes the geometric centroid across all $N$ group participants ($p_1, p_2, \dots, p_N$):
$$ \text{cent\_lat} = \frac{1}{N} \sum_{i=1}^N \text{lat}_i, \quad \text{cent\_lng} = \frac{1}{N} \sum_{i=1}^N \text{lng}_i $$

### 2. Candidate Landmark Filtering & Crowd Preference
Extracts candidate POIs and buildings from the campus manifest (`campus-data/cu-gharaun/`) within `max_radius_meters` from the group centroid:
- **Excluded Categories**: `washroom`, `atm`, `parking`, `medical`.
- **Low-Crowd / Open Spacious Categories**: `plaza`, `sports`, `park`, `garden`, `student hub`, `open food court`.

### 3. Multi-Path Dijkstra Routing
For each candidate landmark $C$, the system calculates shortest walking paths for all $N$ group members to $C$.

### 4. Group Fairness & Ranking Formula
$$ \text{Score} = w_1 \cdot S_{\text{equidistance}} + w_2 \cdot S_{\text{accessibility}} + w_3 \cdot S_{\text{popularity}} + w_4 \cdot S_{\text{crowd}} $$

Where:
- $S_{\text{equidistance}} = 1.0 - \frac{\max(d_i) - \min(d_i)}{\max(d_i, 1)}$

---

## API Endpoint Specification

### `POST /api/meetup/suggest`

**Request Body**:
```json
{
  "campus_id": "cu-gharaun",
  "participants": [
    { "lat": 30.7695, "lng": 76.5748, "label": "You (Block A1)" },
    { "lat": 30.7674, "lng": 76.5740, "label": "Alex (D6 Hub)" },
    { "lat": 30.7685, "lng": 76.5738, "label": "Sam (Library)" }
  ],
  "accessible": false,
  "prefer_low_crowd": true,
  "max_radius_meters": 600,
  "limit": 3
}
```
