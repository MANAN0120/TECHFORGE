"""FastAPI router for Smart Meetup Point recommendations."""

from fastapi import APIRouter
from app.schemas.meetup import MeetupRequest, MeetupResponse
from app.services.meetup_service import meetup_service

router = APIRouter(prefix="/api/meetup", tags=["meetup"])


@router.post("/suggest", response_model=MeetupResponse)
async def suggest_meetup(request: MeetupRequest):
    """Compute and return top equidistant campus meetup recommendations for two users."""
    return meetup_service.suggest_meetup(request)
