"""Search service — fuzzy and category-aware search across campus entities."""

import re
import math
from typing import Any
from app.core.manifest_loader import campus_store
from app.core.config import get_settings
from app.schemas.search import SearchResultItem, SearchResponse


def _haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates in meters."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _score_match(query: str, text: str, weight: float = 1.0) -> float:
    """Calculate match score between query and target text."""
    if not text:
        return 0.0
    
    q = query.lower().strip()
    t = text.lower().strip()
    
    if q == t:
        return 1.0 * weight
    if t.startswith(q):
        return 0.85 * weight
    if f" {q}" in t or f"-{q}" in t or f"({q}" in t or f"/{q}" in t:
        return 0.75 * weight
    if q in t:
        return 0.6 * weight
    
    # Check word-level match
    q_words = [w for w in re.split(r"\W+", q) if w]
    t_words = [w for w in re.split(r"\W+", t) if w]
    matched_words = sum(1 for qw in q_words if any(qw in tw for tw in t_words))
    if matched_words > 0 and len(q_words) > 0:
        return (0.4 * (matched_words / len(q_words))) * weight
        
    return 0.0


def search_campus(
    campus_id: str,
    query: str,
    category: str | None = None,
    type_filter: str | None = None,
    user_lat: float | None = None,
    user_lng: float | None = None,
    limit: int = 20,
) -> SearchResponse:
    """Perform multi-entity search over campus data with strict category filtering."""
    manifest = campus_store.get(campus_id)
    if manifest is None:
        settings = get_settings()
        manifest = campus_store.load(settings.CAMPUS_DATA_DIR, campus_id)

    results: list[SearchResultItem] = []
    q = query.strip()
    cat = category.lower().strip() if category else None

    if not q and not cat:
        return SearchResponse(campus_id=campus_id, query="", total=0, results=[])

    # Helper to check category matching
    def matches_category(entity_cat: str | None, target_cat: str | None) -> bool:
        if not target_cat:
            return True
        if not entity_cat:
            return False
        ec = entity_cat.lower()
        tc = target_cat.lower()
        if tc in ec or ec in tc:
            return True
        if tc == "food" and ec in ["food", "cafeteria", "canteen", "cafe", "restaurant"]:
            return True
        if tc == "atm" and ec in ["atm", "bank"]:
            return True
        if tc == "academic" and ec in ["academic", "department", "admin"]:
            return True
        if tc == "event" and ec in ["event", "fest", "cultural", "workshop", "sports"]:
            return True
        return False

    # 1. Search Buildings
    if not type_filter or type_filter == "building":
        for b in manifest.buildings.values():
            b_cat = b.get("category", "")
            if cat and not matches_category(b_cat, cat):
                # When searching ATMs or Food, do not return plain buildings
                continue

            s1 = _score_match(q, b.get("name", ""), weight=1.2) if q else 0.8
            s2 = _score_match(q, b.get("short_name", ""), weight=1.3) if q else 0.8
            s3 = _score_match(q, b.get("id", ""), weight=1.1) if q else 0.7
            s4 = _score_match(q, b_cat, weight=0.8) if q else 0.7
            s5 = _score_match(q, b.get("description", ""), weight=0.6) if q else 0.5
            
            score = max(s1, s2, s3, s4, s5)
            if score > 0.3 or (not q and cat):
                center = b.get("center", {})
                results.append(
                    SearchResultItem(
                        id=b["id"],
                        type="building",
                        title=b.get("name", b["id"]),
                        subtitle=f"Block {b.get('short_name', '')} • {b_cat.title()}",
                        category=b_cat,
                        building_id=b["id"],
                        lat=center.get("lat"),
                        lng=center.get("lng"),
                        floor=None,
                        score=score,
                        metadata={
                            "floors": b.get("floors", 1),
                            "short_name": b.get("short_name"),
                            "departments": b.get("departments", []),
                            "accessibility": b.get("accessibility", {}),
                        },
                    )
                )

    # 2. Search POIs (ATMs, Cafes, Library, Washrooms, Health, Sports)
    if not type_filter or type_filter == "poi":
        for p in manifest.pois.values():
            p_cat = p.get("category", "")
            if cat and not matches_category(p_cat, cat):
                continue

            b_id = p.get("building_id") or ""
            b_obj = manifest.buildings.get(b_id, {})
            b_name = b_obj.get("name", "")
            b_short = b_obj.get("short_name", "")

            # Match against POI name, category, description, and attached building name/short_name
            s1 = _score_match(q, p.get("name", ""), weight=1.3) if q else 0.9
            s2 = _score_match(q, p_cat, weight=1.0) if q else 0.8
            s3 = _score_match(q, p.get("description", ""), weight=0.7) if q else 0.6
            s4 = _score_match(q, b_name, weight=1.1) if q else 0.7
            s5 = _score_match(q, b_short, weight=1.2) if q else 0.7

            score = max(s1, s2, s3, s4, s5)
            if score > 0.3 or (not q and cat):
                sub = f"{p_cat.title()}" + (f" • {b_name}" if b_name else " • Campus Landmark")
                if p.get("floor") is not None:
                    sub += f" (Floor {p.get('floor')})"

                results.append(
                    SearchResultItem(
                        id=p["id"],
                        type="poi",
                        title=p.get("name", p["id"]),
                        subtitle=sub,
                        category=p_cat,
                        building_id=p.get("building_id"),
                        lat=p.get("lat"),
                        lng=p.get("lng"),
                        floor=p.get("floor"),
                        score=score + 0.1,  # Boost category-specific POI matches
                        metadata={
                            "wheelchair_accessible": p.get("wheelchair_accessible", False),
                            "description": p.get("description", ""),
                        },
                    )
                )

    # 3. Search Departments (Academic Category)
    if not type_filter or type_filter == "department":
        if not cat or cat == "academic":
            for d in manifest.departments.values():
                b_id = d.get("building_id", "")
                b_obj = manifest.buildings.get(b_id, {})
                b_name = b_obj.get("name", b_id)

                s1 = _score_match(q, d.get("name", ""), weight=1.2) if q else 0.8
                s2 = _score_match(q, d.get("description", ""), weight=0.6) if q else 0.5
                s3 = _score_match(q, b_name, weight=1.0) if q else 0.5
                
                score = max(s1, s2, s3)
                if score > 0.3 or (not q and cat == "academic"):
                    center = b_obj.get("center", {})
                    results.append(
                        SearchResultItem(
                            id=d["id"],
                            type="department",
                            title=d.get("name", d["id"]),
                            subtitle=f"Building: {b_name}" + (f" (Floor {d.get('floor')})" if d.get('floor') is not None else ""),
                            category="academic",
                            building_id=d.get("building_id"),
                            lat=center.get("lat"),
                            lng=center.get("lng"),
                            floor=d.get("floor"),
                            score=score,
                            metadata={"description": d.get("description", "")},
                        )
                    )

    # 4. Search Shops (Food, Stationery, Salon, Services)
    if not type_filter or type_filter == "shop":
        for s in manifest.shops:
            s_cat = s.get("category", "")
            if cat and not matches_category(s_cat, cat):
                continue

            b_id = s.get("building_id", "")
            b_obj = manifest.buildings.get(b_id, {})
            b_name = b_obj.get("name", "")

            s1 = _score_match(q, s.get("name", ""), weight=1.2) if q else 0.9
            s2 = _score_match(q, s_cat, weight=0.9) if q else 0.7
            s3 = _score_match(q, s.get("description", ""), weight=0.6) if q else 0.5
            s4 = _score_match(q, b_name, weight=1.1) if q else 0.7
            score = max(s1, s2, s3, s4)

            if score > 0.3 or (not q and cat):
                hours = s.get("hours", {})
                h_str = f" • Open {hours.get('open', '08:00')} - {hours.get('close', '21:00')}" if hours else ""
                results.append(
                    SearchResultItem(
                        id=s["id"],
                        type="shop",
                        title=s.get("name", s["id"]),
                        subtitle=f"{s_cat.title()}" + (f" • {b_name}" if b_name else "") + h_str,
                        category=s_cat,
                        building_id=s.get("building_id"),
                        lat=s.get("lat"),
                        lng=s.get("lng"),
                        floor=s.get("floor"),
                        score=score + 0.05,
                        metadata={"contact": s.get("contact"), "hours": s.get("hours")},
                    )
                )

    # 5. Search Events
    if not type_filter or type_filter == "event":
        if not cat or cat in ["event", "cultural", "sports", "workshop", "fest"]:
            for ev in manifest.events:
                s1 = _score_match(q, ev.get("title", ""), weight=1.2) if q else 0.9
                s2 = _score_match(q, ev.get("venue_name", ""), weight=0.8) if q else 0.7
                s3 = _score_match(q, ev.get("description", ""), weight=0.6) if q else 0.5
                score = max(s1, s2, s3)
                if score > 0.3 or (not q and cat):
                    results.append(
                        SearchResultItem(
                            id=ev["id"],
                            type="event",
                            title=ev.get("title", ev["id"]),
                            subtitle=f"Event • {ev.get('venue_name', 'Campus')} • {ev.get('starts_at', '')}",
                            category=ev.get("category", "event"),
                            building_id=ev.get("building_id"),
                            lat=ev.get("venue_lat"),
                            lng=ev.get("venue_lng"),
                            floor=None,
                            score=score,
                            metadata={
                                "organizer": ev.get("organizer"),
                                "status": ev.get("status"),
                                "starts_at": ev.get("starts_at"),
                            },
                        )
                    )

    # Proximity re-ranking if user GPS coordinates provided
    if user_lat is not None and user_lng is not None:
        for item in results:
            if item.lat is not None and item.lng is not None:
                dist = _haversine_meters(user_lat, user_lng, item.lat, item.lng)
                # Boost closer items slightly
                if dist < 200:
                    item.score += 0.2
                elif dist < 500:
                    item.score += 0.1

    # Sort results by score descending
    results.sort(key=lambda item: item.score, reverse=True)
    limited = results[:limit]

    return SearchResponse(
        campus_id=campus_id,
        query=query,
        total=len(limited),
        results=limited,
    )
