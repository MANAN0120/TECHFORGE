"""Events API router."""

import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.event import EventCreate, EventResponse, EventListResponse, EventPhotoResponse
from app.services import event_service

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=EventListResponse)
def list_events(
    campus_id: str | None = Query(None, description="Campus ID"),
    status: str | None = Query(None, description="Event status (upcoming, ongoing, completed)"),
    db: Session = Depends(get_db),
):
    """List all campus events."""
    settings = get_settings()
    c_id = campus_id or settings.DEFAULT_CAMPUS_ID
    events = event_service.get_events(db, campus_id=c_id, status=status)
    return EventListResponse(campus_id=c_id, count=len(events), events=events)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
):
    """Get single event details."""
    event = event_service.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("", response_model=EventResponse, status_code=201)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
):
    """Create a new campus event."""
    return event_service.create_event(db, data)


@router.post("/{event_id}/photos", response_model=EventPhotoResponse)
async def upload_event_photo(
    event_id: str,
    file: UploadFile = File(...),
    uploaded_by: str = Form("Anonymous"),
    db: Session = Depends(get_db),
):
    """Upload a live photo for an event."""
    event = event_service.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    settings = get_settings()
    upload_dir = Path(settings.UPLOAD_DIR) / "events"
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(file.filename or "photo.jpg").suffix or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = upload_dir / unique_filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = f"/uploads/events/{unique_filename}"
    return event_service.add_event_photo(db, event_id=event_id, photo_url=photo_url, uploaded_by=uploaded_by)
