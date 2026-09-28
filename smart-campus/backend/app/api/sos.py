"""FastAPI router for Emergency SOS Safety Layer."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.sos import SOSRequest, SOSResponse, SafePoint
from app.services.sos_service import sos_service

router = APIRouter(prefix="/api/sos", tags=["sos"])


@router.post("/alert", response_model=SOSResponse, status_code=status.HTTP_200_OK)
async def trigger_sos(req: SOSRequest, db: Session = Depends(get_db)):
    """Trigger emergency SOS alert, log incident, and return nearest safe points and emergency contacts."""
    return sos_service.trigger(db, req)


@router.get("/safe-points", response_model=List[SafePoint])
async def safe_points(campus_id: str, lat: float, lng: float):
    """Retrieve nearest campus safe points sorted by walking time."""
    return sos_service.get_safe_points(campus_id, lat, lng)
