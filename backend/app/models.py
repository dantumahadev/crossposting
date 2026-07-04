from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel

def utcnow():
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: Optional[str] = None
    auth_provider: str = Field(default="email")
    created_at: datetime = Field(default_factory=utcnow)

    connected_accounts: List["ConnectedAccount"] = Relationship(back_populates="user")
    media_assets: List["MediaAsset"] = Relationship(back_populates="user")
    post_drafts: List["PostDraft"] = Relationship(back_populates="user")

class ConnectedAccount(SQLModel, table=True):
    __tablename__ = "connected_accounts"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    platform: str = Field(index=True)  # facebook, instagram, linkedin, youtube
    account_name: str
    external_account_id: str = Field(index=True)
    encrypted_access_token: str
    encrypted_refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    scopes: Optional[str] = None
    status: str = Field(default="active")  # active, expired, revoked

    user: Optional[User] = Relationship(back_populates="connected_accounts")
    post_targets: List["PostTarget"] = Relationship(back_populates="account")

class MediaAsset(SQLModel, table=True):
    __tablename__ = "media_assets"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    file_url: str
    file_type: str  # image/jpeg, image/png, video/mp4
    file_size: int
    duration: Optional[float] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)

    user: Optional[User] = Relationship(back_populates="media_assets")

class PostDraft(SQLModel, table=True):
    __tablename__ = "post_drafts"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: Optional[str] = None
    master_caption: str
    media_asset_id: Optional[int] = Field(default=None, foreign_key="media_assets.id")
    status: str = Field(default="draft")  # draft, scheduled, published, failed, partial
    scheduled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utcnow)

    user: Optional[User] = Relationship(back_populates="post_drafts")
    targets: List["PostTarget"] = Relationship(back_populates="draft")

class PostTarget(SQLModel, table=True):
    __tablename__ = "post_targets"
    id: Optional[int] = Field(default=None, primary_key=True)
    post_draft_id: int = Field(foreign_key="post_drafts.id", index=True)
    platform: str = Field(index=True)  # facebook, instagram, linkedin, youtube
    account_id: Optional[int] = Field(default=None, foreign_key="connected_accounts.id")
    caption: str
    title: Optional[str] = None
    description: Optional[str] = None
    privacy: str = Field(default="public")  # public, unlisted, private, connections_only
    status: str = Field(default="pending")  # pending, uploading, published, failed, retry

    draft: Optional[PostDraft] = Relationship(back_populates="targets")
    account: Optional[ConnectedAccount] = Relationship(back_populates="post_targets")
    publish_jobs: List["PublishJob"] = Relationship(back_populates="target")

class PublishJob(SQLModel, table=True):
    __tablename__ = "publish_jobs"
    id: Optional[int] = Field(default=None, primary_key=True)
    post_target_id: int = Field(foreign_key="post_targets.id", index=True)
    job_status: str = Field(default="pending")  # pending, uploading, published, failed, retry
    attempts: int = Field(default=0)
    last_error: Optional[str] = None
    external_post_id: Optional[str] = None
    external_url: Optional[str] = None
    api_response_json: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    target: Optional[PostTarget] = Relationship(back_populates="publish_jobs")

class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    action: str
    platform: Optional[str] = None
    request_id: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)

# Pydantic Schemas for API Requests/Responses
class CreateDraftRequest(BaseModel):
    title: Optional[str] = None
    master_caption: str
    media_asset_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    platforms: List[str]  # e.g., ["facebook", "instagram", "linkedin", "youtube"]

class UpdateTargetRequest(BaseModel):
    caption: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    privacy: Optional[str] = None

class AICaptionRequest(BaseModel):
    master_caption: str
    platforms: List[str]
    brand_tone: Optional[str] = "Professional"
    default_hashtags: Optional[str] = ""
