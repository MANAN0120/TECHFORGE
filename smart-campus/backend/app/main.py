"""Smart Campus Navigator — FastAPI Application Entrypoint."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import uuid
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.manifest_loader import campus_store
from app.core.database import engine, Base
import app.models  # Ensure all SQLAlchemy models are registered

# Import API routers
from app.api import campus as campus_router
from app.api import search as search_router
from app.api import routing as routing_router
from app.api import events as events_router
from app.api import carts as carts_router
from app.api import shops as shops_router
from app.api import admin as admin_router
from app.api import notifications as notifications_router
from app.api import assistant as assistant_router
from app.api import meetup as meetup_router
from app.api import schedule as schedule_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — load campus data on startup and create tables."""
    settings = get_settings()
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)

    # Ensure tables exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created")
    except Exception as e:
        logger.warning("Could not auto-create tables: %s", e)

    # Load default campus data
    try:
        manifest = campus_store.load(settings.CAMPUS_DATA_DIR, settings.DEFAULT_CAMPUS_ID)
        logger.info(
            "Campus '%s' loaded: %d buildings, %d nodes, %d edges",
            settings.DEFAULT_CAMPUS_ID,
            len(manifest.buildings),
            manifest.graph.number_of_nodes(),
            manifest.graph.number_of_edges(),
        )

        # Seed events and shops into database if empty
        with Session(engine) as db:
            from app.models.event import Event
            from app.models.shop import Shop
            from app.models.review import Review

            event_count = db.query(Event).filter(Event.campus_id == settings.DEFAULT_CAMPUS_ID).count()
            if event_count == 0 and manifest.events:
                for ev in manifest.events:
                    db_event = Event(
                        id=ev.get("id") or str(uuid.uuid4()),
                        campus_id=settings.DEFAULT_CAMPUS_ID,
                        title=ev.get("title", "Campus Event"),
                        description=ev.get("description", ""),
                        category=ev.get("category", "general"),
                        venue_name=ev.get("venue_name", "Campus"),
                        venue_lat=ev.get("venue_lat"),
                        venue_lng=ev.get("venue_lng"),
                        building_id=ev.get("building_id"),
                        starts_at=ev.get("starts_at", "2026-10-01T10:00:00+05:30"),
                        ends_at=ev.get("ends_at", "2026-10-01T18:00:00+05:30"),
                        organizer=ev.get("organizer", "CU Event Desk"),
                        cover_image=ev.get("cover_image"),
                        status=ev.get("status", "upcoming"),
                    )
                    db.add(db_event)
                db.commit()
                logger.info("Auto-seeded %d events into database", len(manifest.events))

            shop_count = db.query(Shop).filter(Shop.campus_id == settings.DEFAULT_CAMPUS_ID).count()
            if shop_count == 0 and manifest.shops:
                for s in manifest.shops:
                    hours = s.get("hours", {})
                    db_shop = Shop(
                        id=s["id"],
                        campus_id=settings.DEFAULT_CAMPUS_ID,
                        name=s["name"],
                        category=s.get("category", "other"),
                        lat=s.get("lat"),
                        lng=s.get("lng"),
                        building_id=s.get("building_id"),
                        floor=s.get("floor"),
                        description=s.get("description", ""),
                        hours_open=hours.get("open", "08:00"),
                        hours_close=hours.get("close", "21:00"),
                        contact=s.get("contact"),
                        verified=1 if s.get("verified", True) else 0,
                    )
                    db.add(db_shop)
                db.commit()

                # Seed sample student reviews
                sample_reviews = [
                    ("shop-main-cafe", 5, "Best North Indian thali and fresh roti on campus. Great pricing!", "Rahul Sharma"),
                    ("shop-main-cafe", 4, "Spacious seating, quick service during lunch peak hours.", "Simran Kaur"),
                    ("shop-d6-cafe", 5, "Best cold coffee and grilled burgers in D6 Plaza!", "Aman Verma"),
                    ("shop-juice-corner", 5, "Fresh fruit seasonal smoothies are 10/10.", "Priya Singh"),
                    ("shop-maggi-point", 5, "Cheesy peri-peri maggi is unmatched during exam nights.", "Karan Patel"),
                    ("shop-stationery", 4, "Everything you need for engineering charts and files.", "Sneha Roy"),
                    ("shop-quick-print", 5, "Super fast project report spiral binding!", "Ankit Gupta"),
                    ("shop-chai-adda", 5, "Authentic masala cutting chai and hot samosas near A Block.", "Jaspreet Singh"),
                ]
                for s_id, rat, txt, rev_name in sample_reviews:
                    r_obj = Review(
                        id=str(uuid.uuid4()),
                        shop_id=s_id,
                        rating=rat,
                        text=txt,
                        reviewer_name=rev_name,
                        created_at="2026-09-28T10:00:00",
                    )
                    db.add(r_obj)
                db.commit()
                logger.info("Auto-seeded %d shops and reviews into database", len(manifest.shops))

    except FileNotFoundError as e:
        logger.error("Failed to load campus data: %s", e)
    except Exception as e:
        logger.error("Error during campus data load/seed: %s", e)

    # Ensure uploads directory exists
    uploads_path = Path(settings.UPLOAD_DIR)
    uploads_path.mkdir(parents=True, exist_ok=True)
    (uploads_path / "events").mkdir(exist_ok=True)
    (uploads_path / "shops").mkdir(exist_ok=True)

    yield

    logger.info("Shutting down %s", settings.APP_NAME)


settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Campus Navigation & Assistance System",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Include Routers
app.include_router(campus_router.router)
app.include_router(search_router.router)
app.include_router(routing_router.router)
app.include_router(events_router.router)
app.include_router(carts_router.router)
app.include_router(shops_router.router)
app.include_router(admin_router.router)
app.include_router(notifications_router.router)
app.include_router(assistant_router.router)
app.include_router(meetup_router.router)
app.include_router(schedule_router.router)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "campuses_loaded": campus_store.list_campuses(),
    }


# ---------- Serve React Frontend in Production ----------
# In production (Railway), serve the built React app as static files.
# The frontend is built to smart-campus/frontend/dist/ during the build step.

import os
from fastapi.responses import FileResponse

_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if _frontend_dist.exists() and _frontend_dist.is_dir():
    # Serve static assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="frontend_assets")

    # Serve other static files at root (favicon, manifest, etc.)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Catch-all route — serve the React SPA for any non-API path."""
        # Try to serve the exact file first
        file_path = _frontend_dist / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise serve index.html for client-side routing
        return FileResponse(str(_frontend_dist / "index.html"))

    logger.info("Frontend dist mounted from %s", _frontend_dist)
