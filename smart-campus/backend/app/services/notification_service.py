"""Notification service — in-app notifications and alerts."""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.admin import NotificationCreate, NotificationResponse


def get_notifications(db: Session, campus_id: str, unread_only: bool = False) -> list[NotificationResponse]:
    """Get notifications for a campus."""
    query = db.query(Notification).filter(Notification.campus_id == campus_id)
    if unread_only:
        query = query.filter(Notification.read == 0)
    
    notifications = query.order_by(Notification.created_at.desc()).all()
    return [
        NotificationResponse(
            id=n.id,
            campus_id=n.campus_id,
            title=n.title,
            body=n.body,
            category=n.category,
            target=n.target,
            read=n.read,
            created_at=n.created_at,
        )
        for n in notifications
    ]


def create_notification(db: Session, data: NotificationCreate) -> NotificationResponse:
    """Create a new notification."""
    notif_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    notif = Notification(
        id=notif_id,
        campus_id=data.campus_id,
        title=data.title,
        body=data.body,
        category=data.category,
        target=data.target,
        read=0,
        created_at=now,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return NotificationResponse(
        id=notif.id,
        campus_id=notif.campus_id,
        title=notif.title,
        body=notif.body,
        category=notif.category,
        target=notif.target,
        read=notif.read,
        created_at=notif.created_at,
    )


def mark_notification_read(db: Session, notification_id: str) -> bool:
    """Mark a notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        return False
    notif.read = 1
    db.commit()
    return True
