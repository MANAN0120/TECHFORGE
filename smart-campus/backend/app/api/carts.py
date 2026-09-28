"""Carts API router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.cart import CartResponse, NearestCartResponse
from app.services import cart_service

router = APIRouter(prefix="/api/carts", tags=["carts"])


@router.get("", response_model=list[CartResponse])
def get_carts(
    campus_id: str | None = Query(None, description="Campus ID"),
    db: Session = Depends(get_db),
):
    """List all campus carts with live locations."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    return cart_service.get_carts(db, campus_id=c_id)


@router.get("/nearest", response_model=NearestCartResponse)
def get_nearest_cart(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    campus_id: str | None = Query(None, description="Campus ID"),
    db: Session = Depends(get_db),
):
    """Find the nearest cart and calculate ETA in minutes."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    nearest = cart_service.get_nearest_cart(db, campus_id=c_id, lat=lat, lng=lng)
    if not nearest:
        raise HTTPException(status_code=404, detail="No active campus carts available")
    return nearest


@router.patch("/{cart_id}/location", response_model=CartResponse)
def update_location(
    cart_id: str,
    lat: float = Query(..., description="New latitude"),
    lng: float = Query(..., description="New longitude"),
    status: str | None = Query(None, description="Optional status update"),
    db: Session = Depends(get_db),
):
    """Update cart position (for simulation or GPS trackers)."""
    cart = cart_service.update_cart_position(db, cart_id=cart_id, lat=lat, lng=lng, status=status)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart
