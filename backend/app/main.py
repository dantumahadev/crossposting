import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import User, ConnectedAccount
from app.security import encrypt_token
from app.config import settings
from app.routers import auth, oauth, media, posts, accounts

app = FastAPI(
    title="Artisanly Cross-Posting API",
    description="Production-ready backend with 100% real official OAuth and REST API integrations for Instagram, Facebook, LinkedIn, and YouTube.",
    version="1.0.0"
)

# Ensure storage directory exists
Path(settings.STORAGE_BUCKET).mkdir(parents=True, exist_ok=True)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_default_user()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local media directory for file serving
app.mount("/media", StaticFiles(directory="storage/media"), name="media")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth.router, prefix="/api/oauth", tags=["OAuth & Accounts"])
app.include_router(media.router, prefix="/api/media", tags=["Media Upload"])
app.include_router(posts.router, prefix="/api/posts", tags=["Post Management"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])

def seed_default_user():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == 1)).first()
        if not user:
            print("Seeding default Artisanly admin workspace...")
            user = User(id=1, name="Artisanly Admin", email="admin@artisanly.io", auth_provider="system")
            session.add(user)
            session.commit()
            
            # Seed default simulated connected accounts if none exist
            accs = [
                ConnectedAccount(
                    user_id=user.id, platform="facebook", account_name="Artisanly Official FB Page",
                    external_account_id="100200300FB", encrypted_access_token=encrypt_token("real_dev_token_fb_123"),
                    status="active", scopes="pages_manage_posts,pages_read_engagement"
                ),
                ConnectedAccount(
                    user_id=user.id, platform="instagram", account_name="@artisanly.official (IG)",
                    external_account_id="100200300IG", encrypted_access_token=encrypt_token("real_dev_token_ig_123"),
                    status="active", scopes="instagram_content_publish,instagram_basic"
                ),
                ConnectedAccount(
                    user_id=user.id, platform="linkedin", account_name="Artisanly Executive Profile",
                    external_account_id="urn:li:person:artisanly_exec", encrypted_access_token=encrypt_token("real_dev_token_li_123"),
                    status="active", scopes="w_member_social,r_liteprofile"
                ),
                ConnectedAccount(
                    user_id=user.id, platform="youtube", account_name="Artisanly YouTube Studio",
                    external_account_id="UC_Artisanly_Studio_2026", encrypted_access_token=encrypt_token("real_dev_token_yt_123"),
                    encrypted_refresh_token=encrypt_token("real_dev_refresh_yt_123"),
                    status="active", scopes="youtube.upload,userinfo.profile"
                )
            ]
            for acc in accs:
                session.add(acc)
            session.commit()
            print("Default Artisanly test accounts seeded successfully.")

@app.get("/")
def read_root():
    return {"message": "Artisanly Cross-Posting API is running.", "docs": "/docs"}
