"""Business logic service for Lost & Found items."""

import uuid
import logging
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.lostfound import LostItem
from app.schemas.lostfound import LostItemCreate, LostItemOut, LostItemListResponse
from app.repositories.lostfound_repository import lostfound_repo
from app.services.routing_service import _haversine_distance

logger = logging.getLogger(__name__)


class LostFoundService:
    """Service handling Lost & Found items and photo uploads."""

    def _save_photo(self, photo: UploadFile) -> str:
        """Save uploaded photo file to uploads/lostfound/ directory."""
        settings = get_settings()
        target_dir = Path(settings.UPLOAD_DIR) / "lostfound"
        target_dir.mkdir(parents=True, exist_ok=True)

        ext = Path(photo.filename or "").suffix.lower()
        if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"

        filename = f"{uuid.uuid4()}{ext}"
        dest_path = target_dir / filename

        with open(dest_path, "wb") as f:
            f.write(photo.file.read())

        return f"/uploads/lostfound/{filename}"

    def create_item(self, db: Session, payload: LostItemCreate, photo: Optional[UploadFile] = None) -> LostItemOut:
        photo_url = None
        if photo and photo.filename:
            try:
                photo_url = self._save_photo(photo)
            except Exception as e:
                logger.error("Failed to save photo for lost & found item: %s", e)

        db_item = lostfound_repo.create(db, payload, photo_url)
        return LostItemOut.model_validate(db_item)

    def list_items(
        self,
        db: Session,
        campus_id: str,
        type_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        status_filter: str = "open",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
    ) -> LostItemListResponse:
        db_items = lostfound_repo.list(db, campus_id, type_filter, category_filter, status_filter)
        out_items: List[LostItemOut] = []

        for item in db_items:
            item_out = LostItemOut.model_validate(item)
            if user_lat is not None and user_lng is not None and item.last_seen_lat is not None and item.last_seen_lng is not None:
                dist = int(_haversine_distance(user_lat, user_lng, item.last_seen_lat, item.last_seen_lng))
                item_out.distance_from_user_meters = dist
            out_items.append(item_out)

        # Sort by distance if user location is available
        if user_lat is not None and user_lng is not None:
            out_items.sort(key=lambda i: i.distance_from_user_meters if i.distance_from_user_meters is not None else 999999)

        return LostItemListResponse(items=out_items, total=len(out_items))

    def get_item(self, db: Session, item_id: int) -> Optional[LostItemOut]:
        item = lostfound_repo.get(db, item_id)
        return LostItemOut.model_validate(item) if item else None

    def resolve_item(self, db: Session, item_id: int) -> Optional[LostItemOut]:
        item = lostfound_repo.resolve(db, item_id)
        return LostItemOut.model_validate(item) if item else None

    def delete_item(self, db: Session, item_id: int) -> bool:
        return lostfound_repo.delete(db, item_id)


lostfound_service = LostFoundService()
