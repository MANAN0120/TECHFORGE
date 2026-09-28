"""Event service — CRUD operations for campus events and photo uploads."""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.event import Event, EventPhoto
from app.schemas.event import EventCreate, EventResponse, EventPhotoResponse


def get_events(db: Session, campus_id: str, status: str | None = None) -> list[EventResponse]:
    """Get all events for a campus, optionally filtered by status."""
    query = db.query(Event).filter(Event.campus_id == campus_id)
    if status:
        query = query.filter(Event.status == status)
    
    events = query.order_by(Event.starts_at.asc()).all()
    
    result = []
    for e in events:
        photos = [
            EventPhotoResponse(
                id=p.id,
                event_id=p.event_id,
                url=p.url,
                uploaded_by=p.uploaded_by,
                uploaded_at=p.uploaded_at,
            )
            for p in e.photos
        ]
        result.append(
            EventResponse(
                id=e.id,
                campus_id=e.campus_id,
                title=e.title,
                description=e.description,
                category=e.category,
                venue_name=e.venue_name,
                venue_lat=e.venue_lat,
                venue_lng=e.venue_lng,
                building_id=e.building_id,
                starts_at=e.starts_at,
                ends_at=e.ends_at,
                organizer=e.organizer,
                cover_image=e.cover_image,
                status=e.status,
                created_at=e.created_at,
                updated_at=e.updated_at,
                photos=photos,
            )
        )
    return result


def get_event(db: Session, event_id: str) -> EventResponse | None:
    """Get a single event by ID."""
    e = db.query(Event).filter(Event.id == event_id).first()
    if not e:
        return None
    photos = [
        EventPhotoResponse(
            id=p.id,
            event_id=p.event_id,
            url=p.url,
            uploaded_by=p.uploaded_by,
            uploaded_at=p.uploaded_at,
        )
        for p in e.photos
    ]
    return EventResponse(
        id=e.id,
        campus_id=e.campus_id,
        title=e.title,
        description=e.description,
        category=e.category,
        venue_name=e.venue_name,
        venue_lat=e.venue_lat,
        venue_lng=e.venue_lng,
        building_id=e.building_id,
        starts_at=e.starts_at,
        ends_at=e.ends_at,
        organizer=e.organizer,
        cover_image=e.cover_image,
        status=e.status,
        created_at=e.created_at,
        updated_at=e.updated_at,
        photos=photos,
    )


def create_event(db: Session, data: EventCreate) -> EventResponse:
    """Create a new campus event."""
    event_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    event = Event(
        id=event_id,
        campus_id=data.campus_id,
        title=data.title,
        description=data.description,
        category=data.category,
        venue_name=data.venue_name,
        venue_lat=data.venue_lat,
        venue_lng=data.venue_lng,
        building_id=data.building_id,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        organizer=data.organizer,
        cover_image=data.cover_image,
        status=data.status,
        created_at=now,
        updated_at=now,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return get_event(db, event_id)


def add_event_photo(db: Session, event_id: str, photo_url: str, uploaded_by: str = "Anonymous") -> EventPhotoResponse:
    """Add a photo to an event."""
    photo_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    photo = EventPhoto(
        id=photo_id,
        event_id=event_id,
        url=photo_url,
        uploaded_by=uploaded_by,
        uploaded_at=now,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return EventPhotoResponse(
        id=photo.id,
        event_id=photo.event_id,
        url=photo.url,
        uploaded_by=photo.uploaded_by,
        uploaded_at=photo.uploaded_at,
    )
