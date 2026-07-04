#!/usr/bin/env python3
"""
FounderLabs Social Auto Poster - Database Initializer
Creates database tables and initializes default workspace with demo accounts.
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session
from app.database import engine, create_db_and_tables
from app.models import User, ConnectedAccount
from app.security import encrypt_token

def init():
    print("Creating database and tables...")
    create_db_and_tables()
    print("Database tables created successfully!")

    with Session(engine) as session:
        user = session.get(User, 1)
        if not user:
            print("Seeding default FounderLabs admin user and test connected accounts...")
            user = User(id=1, name="FounderLabs Admin", email="admin@founderlabs.com", auth_provider="system")
            session.add(user)
            session.commit()
            session.refresh(user)

            fb = ConnectedAccount(
                user_id=user.id, platform="facebook", account_name="FounderLabs Official FB Page",
                external_account_id="100200300FB", encrypted_access_token=encrypt_token("real_dev_token_fb_123"),
                scopes="pages_manage_posts,pages_read_engagement", status="active"
            )
            ig = ConnectedAccount(
                user_id=user.id, platform="instagram", account_name="@founderlabs.official (IG)",
                external_account_id="100200300IG", encrypted_access_token=encrypt_token("real_dev_token_ig_123"),
                scopes="instagram_content_publish,instagram_basic", status="active"
            )
            li = ConnectedAccount(
                user_id=user.id, platform="linkedin", account_name="FounderLabs Executive Profile",
                external_account_id="urn:li:person:fl_exec_2026", encrypted_access_token=encrypt_token("real_dev_token_li_123"),
                scopes="w_member_social", status="active"
            )
            yt = ConnectedAccount(
                user_id=user.id, platform="youtube", account_name="FounderLabs YouTube Studio",
                external_account_id="UC_FounderLabs_Studio_2026", encrypted_access_token=encrypt_token("real_dev_token_yt_123"),
                scopes="youtube.upload", status="active"
            )
            session.add_all([fb, ig, li, yt])
            session.commit()
            print("Seeding complete.")
        else:
            print("Database already initialized and seeded.")

if __name__ == "__main__":
    init()
