"""Admin service — managing path blockage conditions and system administration."""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.condition import Condition
from app.schemas.admin import ConditionCreate, ConditionResponse


def get_conditions(db: Session, campus_id: str, active_only: bool = True) -> list[ConditionResponse]:
    """Get conditions/path blockages for a campus."""
    query = db.query(Condition).filter(Condition.campus_id == campus_id)
    if active_only:
        query = query.filter(Condition.active == 1)
    
    conditions = query.order_by(Condition.created_at.desc()).all()
    return [
        ConditionResponse(
            id=c.id,
            campus_id=c.campus_id,
            path_id=c.path_id,
            reason=c.reason,
            severity=c.severity,
            created_at=c.created_at,
            expires_at=c.expires_at,
            active=c.active,
        )
        for c in conditions
    ]


def create_condition(db: Session, data: ConditionCreate) -> ConditionResponse:
    """Create a new path condition (e.g. block a path)."""
    cond_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    condition = Condition(
        id=cond_id,
        campus_id=data.campus_id,
        path_id=data.path_id,
        reason=data.reason,
        severity=data.severity,
        created_at=now,
        expires_at=data.expires_at,
        active=1,
    )
    db.add(condition)
    db.commit()
    db.refresh(condition)

    return ConditionResponse(
        id=condition.id,
        campus_id=condition.campus_id,
        path_id=condition.path_id,
        reason=condition.reason,
        severity=condition.severity,
        created_at=condition.created_at,
        expires_at=condition.expires_at,
        active=condition.active,
    )


def remove_condition(db: Session, condition_id: str) -> bool:
    """Deactivate or remove a condition."""
    condition = db.query(Condition).filter(Condition.id == condition_id).first()
    if not condition:
        return False
    condition.active = 0
    db.commit()
    return True
