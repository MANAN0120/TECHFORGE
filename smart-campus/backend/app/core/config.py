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
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

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

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
