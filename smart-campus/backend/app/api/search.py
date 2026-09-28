"""Search API router."""

from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.schemas.search import SearchResponse
from app.services import search_service

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Search query string"),
    campus_id: str | None = Query(None, description="Campus ID, defaults to configured default"),
    category: str | None = Query(None, description="Optional category filter"),
    type: str | None = Query(None, description="Optional entity type filter (building, poi, department, shop, event)"),
    limit: int = Query(20, ge=1, le=50, description="Max results to return"),
):
    """Fuzzy search across campus buildings, POIs, departments, shops, and events."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    try:
        return search_service.search_campus(
            campus_id=c_id,
            query=q,
            category=category,
            type_filter=type,
            limit=limit,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Campus '{c_id}' not found")
