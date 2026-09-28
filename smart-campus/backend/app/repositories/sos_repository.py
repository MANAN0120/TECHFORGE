"""Repository for Emergency SOS Alerts database logging."""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.sos import SOSAlert
from app.schemas.sos import SOSRequest


class SOSRepository:
    """Database repository for emergency SOS alerts."""

    def create_alert(self, db: Session, req: SOSRequest) -> SOSAlert:
        alert = SOSAlert(
            campus_id=req.campus_id,
            device_id=req.device_id,
            lat=req.lat,
            lng=req.lng,
            accuracy=req.accuracy,
            message=req.message,
            status="received",
            created_at=datetime.utcnow(),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    def get_alert(self, db: Session, alert_id: int) -> Optional[SOSAlert]:
        return db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()


sos_repo = SOSRepository()
