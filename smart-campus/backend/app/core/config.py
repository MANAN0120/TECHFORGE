"""Application configuration loaded from environment variables."""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with env var support."""

    # Application
    APP_NAME: str = "Smart Campus Navigator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = int(os.environ.get("PORT", "8000"))

    # CORS — includes Railway domain automatically
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./smart_campus.db"

    # Campus Data
    CAMPUS_DATA_DIR: str = str(
        Path(__file__).resolve().parent.parent.parent.parent / "campus-data"
    )
    DEFAULT_CAMPUS_ID: str = "cu-gharaun"

    # AI Provider
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-1.5-flash"

    # Admin
    ADMIN_SECRET: str = "changeme-in-production"

    # Uploads
    UPLOAD_DIR: str = str(
        Path(__file__).resolve().parent.parent.parent.parent / "uploads"
    )

    # Smart Meetup Point Weights & Radius
    MEETUP_WEIGHT_EQUIDISTANCE: float = float(os.getenv("MEETUP_WEIGHT_EQUIDISTANCE", "0.4"))
    MEETUP_WEIGHT_ACCESSIBILITY: float = float(os.getenv("MEETUP_WEIGHT_ACCESSIBILITY", "0.2"))
    MEETUP_WEIGHT_POPULARITY: float = float(os.getenv("MEETUP_WEIGHT_POPULARITY", "0.2"))
    MEETUP_WEIGHT_LANDMARK: float = float(os.getenv("MEETUP_WEIGHT_LANDMARK", "0.2"))
    MEETUP_DEFAULT_RADIUS_METERS: int = int(os.getenv("MEETUP_DEFAULT_RADIUS_METERS", "400"))

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    settings = Settings()

    # Auto-add Railway's public domain to CORS origins
    railway_domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN")
    if railway_domain:
        railway_url = f"https://{railway_domain}"
        if railway_url not in settings.CORS_ORIGINS:
            settings.CORS_ORIGINS.append(railway_url)

    return settings

