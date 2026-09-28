"""Routing API router — endpoint for calculating navigation paths."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.routing import RouteRequest, RouteResponse
from app.services import routing_service

router = APIRouter(prefix="/api/route", tags=["routing"])


@router.post("", response_model=RouteResponse)
def get_route(
    request: RouteRequest,
    db: Session = Depends(get_db),
):
    """Calculate the shortest walking or accessible route between two campus locations."""
    return routing_service.calculate_route(request, db=db)
