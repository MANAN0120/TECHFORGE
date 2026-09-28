"""Repository for Lost & Found database CRUD operations."""

from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.lostfound import LostItem
from app.schemas.lostfound import LostItemCreate


class LostFoundRepository:
    """Database repository for lost and found items."""

    def create(self, db: Session, item_in: LostItemCreate, photo_url: Optional[str] = None) -> LostItem:
        db_item = LostItem(
            campus_id=item_in.campus_id,
            type=item_in.type,
            title=item_in.title,
            description=item_in.description,
            category=item_in.category,
            photo_url=photo_url,
            last_seen_lat=item_in.last_seen_lat,
            last_seen_lng=item_in.last_seen_lng,
            last_seen_label=item_in.last_seen_label,
            building_id=item_in.building_id,
            contact_info=item_in.contact_info,
            reported_by=item_in.reported_by,
            status="open",
            created_at=datetime.utcnow(),
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    def list(
        self,
        db: Session,
        campus_id: str,
        type_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        status_filter: str = "open",
    ) -> List[LostItem]:
        query = db.query(LostItem).filter(LostItem.campus_id == campus_id)
        if status_filter:
            query = query.filter(LostItem.status == status_filter)
        if type_filter:
            query = query.filter(LostItem.type == type_filter)
        if category_filter:
            query = query.filter(LostItem.category == category_filter)
        return query.order_by(LostItem.created_at.desc()).all()

    def get(self, db: Session, item_id: int) -> Optional[LostItem]:
        return db.query(LostItem).filter(LostItem.id == item_id).first()

    def resolve(self, db: Session, item_id: int) -> Optional[LostItem]:
        db_item = self.get(db, item_id)
        if db_item:
            db_item.status = "resolved"
            db_item.resolved_at = datetime.utcnow()
            db.commit()
            db.refresh(db_item)
        return db_item

    def delete(self, db: Session, item_id: int) -> bool:
        db_item = self.get(db, item_id)
        if db_item:
            db.delete(db_item)
            db.commit()
            return True
        return False


lostfound_repo = LostFoundRepository()
