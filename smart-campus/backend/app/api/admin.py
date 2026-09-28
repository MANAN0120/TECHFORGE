"""Admin API router — conditions, path blockages, and administrative actions."""

from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.admin import ConditionCreate, ConditionResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _verify_admin(x_admin_secret: str | None = Header(None)):
    """Optional admin secret check."""
    settings = get_settings()
    if settings.ADMIN_SECRET != "changeme-in-production" and x_admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Invalid admin secret")


@router.get("/conditions", response_model=list[ConditionResponse])
def list_conditions(
    campus_id: str | None = Query(None, description="Campus ID"),
    active_only: bool = Query(True, description="Filter active conditions only"),
    db: Session = Depends(get_db),
):
    """List all path blockage conditions."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    return admin_service.get_conditions(db, campus_id=c_id, active_only=active_only)


@router.post("/conditions", response_model=ConditionResponse, status_code=201)
def block_path(
    data: ConditionCreate,
    db: Session = Depends(get_db),
):
    """Add a path condition (e.g. block a path for maintenance or event)."""
    return admin_service.create_condition(db, data)


@router.delete("/conditions/{condition_id}")
def unblock_path(
    condition_id: str,
    db: Session = Depends(get_db),
):
    """Deactivate or remove a path blockage condition."""
    success = admin_service.remove_condition(db, condition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Condition not found")
    return {"status": "ok", "message": f"Condition '{condition_id}' deactivated."}
