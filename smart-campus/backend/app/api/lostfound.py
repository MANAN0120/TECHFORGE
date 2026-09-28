"""FastAPI router for Lost & Found community board."""

import json
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.schemas.lostfound import LostItemCreate, LostItemOut, LostItemListResponse
from app.services.lostfound_service import lostfound_service

router = APIRouter(prefix="/api/lostfound", tags=["lostfound"])


@router.post("", response_model=LostItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    request: Request,
    campus_id: str = Form(...),
    type: Literal["lost", "found"] = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: Literal["phone", "wallet", "id_card", "keys", "bag", "other"] = Form(...),
    contact_info: str = Form(...),
    last_seen_lat: Optional[float] = Form(None),
    last_seen_lng: Optional[float] = Form(None),
    last_seen_label: Optional[str] = Form(None),
    building_id: Optional[str] = Form(None),
    reported_by: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Report a new lost or found item with optional photo upload."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = reported_by or client_ip

    if not check_rate_limit(rate_key, max_requests=5, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 5 lost & found reports allowed per hour.",
        )

    payload = LostItemCreate(
        campus_id=campus_id,
        type=type,
        title=title,
        description=description,
        category=category,
        contact_info=contact_info,
        last_seen_lat=last_seen_lat,
        last_seen_lng=last_seen_lng,
        last_seen_label=last_seen_label,
        building_id=building_id,
        reported_by=reported_by,
    )

    return lostfound_service.create_item(db, payload, photo)


@router.get("", response_model=LostItemListResponse)
async def list_items(
    campus_id: str,
    type: Optional[str] = None,
    category: Optional[str] = None,
    status: str = "open",
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    db: Session = Depends(get_db),
):
    """List open or resolved lost and found items, sorted by distance if GPS coordinates provided."""
    return lostfound_service.list_items(db, campus_id, type, category, status, user_lat, user_lng)


@router.get("/{item_id}", response_model=LostItemOut)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single lost or found item."""
    item = lostfound_service.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Lost & Found item not found.")
    return item


@router.patch("/{item_id}/resolve", response_model=LostItemOut)
async def resolve_item(item_id: int, db: Session = Depends(get_db)):
    """Mark a lost or found item as reunited / resolved."""
    item = lostfound_service.resolve_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Lost & Found item not found.")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Remove a lost or found item posting."""
    success = lostfound_service.delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lost & Found item not found.")
    return None
