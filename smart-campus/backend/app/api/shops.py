"""Shops API router."""

import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.shop import ShopResponse, ReviewCreate, ReviewResponse, ShopPhotoResponse
from app.services import shop_service

router = APIRouter(prefix="/api/shops", tags=["shops"])


@router.get("", response_model=list[ShopResponse])
def get_shops(
    campus_id: str | None = Query(None, description="Campus ID"),
    category: str | None = Query(None, description="Category filter (food, stationary, salon, etc.)"),
    db: Session = Depends(get_db),
):
    """List all campus shops with ratings, reviews, and photo galleries."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    return shop_service.get_shops(db, campus_id=c_id, category=category)


@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(
    shop_id: str,
    db: Session = Depends(get_db),
):
    """Get single shop details, reviews, and photos."""
    shop = shop_service.get_shop(db, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop


@router.post("/{shop_id}/reviews", response_model=ReviewResponse, status_code=201)
def add_review(
    shop_id: str,
    review: ReviewCreate,
    db: Session = Depends(get_db),
):
    """Submit a review and rating for a shop."""
    shop = shop_service.get_shop(db, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop_service.add_review(db, shop_id, review)


@router.post("/{shop_id}/photos", response_model=ShopPhotoResponse)
async def upload_shop_photo(
    shop_id: str,
    file: UploadFile = File(...),
    uploaded_by: str = Form("Anonymous"),
    db: Session = Depends(get_db),
):
    """Upload a showcase photo to a campus shop."""
    shop = shop_service.get_shop(db, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    settings = get_settings()
    upload_dir = Path(settings.UPLOAD_DIR) / "shops"
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(file.filename or "photo.jpg").suffix or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = upload_dir / unique_filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = f"/uploads/shops/{unique_filename}"
    return shop_service.add_shop_photo(db, shop_id=shop_id, url=photo_url, uploaded_by=uploaded_by)
