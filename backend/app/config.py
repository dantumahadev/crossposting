import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Core
    APP_BASE_URL: str = "http://localhost:5173"
    API_BASE_URL: str = "http://localhost:8000"
    ENCRYPTION_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    JWT_SECRET_KEY: str = "supersecretjwtkeyforfounderlabsmvp2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database & Queue
    DATABASE_URL: str = "sqlite:///./founderlabs.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_PROVIDER: str = "local"
    STORAGE_BUCKET: str = "storage/media"

    # AI Captions
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Meta (Facebook Pages + Instagram Business)
    META_APP_ID: Optional[str] = None
    META_APP_SECRET: Optional[str] = None
    META_REDIRECT_URI: str = "http://localhost:8000/api/oauth/meta/callback"

    # LinkedIn
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/oauth/linkedin/callback"

    # Google / YouTube
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/oauth/google/callback"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
