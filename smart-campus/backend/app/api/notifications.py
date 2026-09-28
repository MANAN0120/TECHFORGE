"""Notifications API router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.admin import NotificationCreate, NotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def get_notifications(
    campus_id: str | None = Query(None, description="Campus ID"),
    unread_only: bool = Query(False, description="Filter unread only"),
    db: Session = Depends(get_db),
):
    """List in-app campus notifications."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    return notification_service.get_notifications(db, campus_id=c_id, unread_only=unread_only)


@router.post("", response_model=NotificationResponse, status_code=201)
def broadcast_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
):
    """Broadcast a new notification."""
    return notification_service.create_notification(db, data)


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
):
    """Mark a notification as read."""
    success = notification_service.mark_notification_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "ok", "message": "Notification marked as read"}
