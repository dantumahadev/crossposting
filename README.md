# Artisanly Cross-Posting Studio (100% Real APIs)

A production-ready, full-stack web application designed for multi-network social media publishing across Meta (Facebook & Instagram), LinkedIn, and YouTube. Built with a premium **Artisan** glassmorphic theme and zero mock fallbacks.

## Features
- **Upload Once, Publish Everywhere**: Support for images and videos with automatic metadata analysis.
- **AI Caption Generation**: Powered by OpenAI (`gpt-4o-mini`) and Google Gemini to automatically craft tailored copy per platform (hashtags for Instagram, professional formatting for LinkedIn, concise titles for YouTube).
- **100% Real Official API Integrations**:
  - **Meta Facebook Pages API**: Feed text/link posts, photo posts, and video upload flows.
  - **Meta Instagram Content Publishing API**: Media container creation, background status polling (`FINISHED`), and media publishing.
  - **LinkedIn Share & UGC API**: Asset registration, binary data PUT uploads, and author URN publishing.
  - **YouTube Data API v3**: Resumable video upload sessions (`videos.insert`) with tags, categories, and privacy settings (`public`, `unlisted`, `private`).
- **Real Background Job Queue**: Powered by Redis + RQ / Celery with real-time status progression (`Pending` -> `Uploading` -> `Published`), storing real external post IDs, live clickable URLs, and raw API response logs.
- **Admin Debug Inspector**: Dedicated JSON viewer in Post History to inspect raw headers, status codes, and error tracebacks for compliance and debugging.

---

## Architecture & Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons (Minimal Apple-style monochrome design).
- **Backend**: FastAPI (Python 3.12), SQLModel, SQLAlchemy, Pydantic v2.
- **Database**: PostgreSQL via `DATABASE_URL` (defaults to local SQLite `founderlabs.db` for zero-configuration testing).
- **Queue**: Redis + RQ (Redis Queue) with real background workers.
- **Security**: AES-GCM 256-bit encryption for OAuth access and refresh tokens at rest; JWT user sessions.

---

## Step-by-Step Setup Instructions

### 1. Environment Configuration
Copy the `.env.example` file to `.env` in the project root:
```bash
cp .env.example .env
```

Open `.env` and fill in your real API credentials:
- **Meta (Facebook & Instagram)**:
  - Create an app on [Meta for Developers](https://developers.facebook.com/).
  - Required Scopes: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_content_publish`, `instagram_basic`.
  - Set `META_APP_ID`, `META_APP_SECRET`, and `META_REDIRECT_URI=http://localhost:8000/api/oauth/meta/callback`.
- **LinkedIn**:
  - Create an app on [LinkedIn Developer Portal](https://developer.linkedin.com/).
  - Required Scopes: `w_member_social`, `r_liteprofile` (or `openid`, `profile`).
  - Set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, and `LINKEDIN_REDIRECT_URI=http://localhost:8000/api/oauth/linkedin/callback`.
- **Google / YouTube**:
  - Create a project on [Google Cloud Console](https://console.cloud.google.com/) and enable **YouTube Data API v3**.
  - Required Scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/userinfo.profile`.
  - Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI=http://localhost:8000/api/oauth/google/callback`.
- **AI Captions (Optional)**:
  - Add your `OPENAI_API_KEY` or `GEMINI_API_KEY` for instant AI copywriting.

---

### 2. Backend Setup & Running

Navigate to the backend folder and install Python dependencies:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Initialize the database (creates tables and seeds default workspace):
```bash
python init_db.py
```

Start the Redis Background Worker (in a separate terminal):
```bash
# Make sure Redis is running locally (e.g. redis-server or docker run -p 6379:6379 redis)
cd backend
python -m app.services.worker
```

Start the FastAPI backend server:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend API documentation will be available at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup & Running

Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The web application will open at `http://localhost:5173`.*

---

## Production App Review Checklist
When preparing for production submissions (Section 15 of FounderLabs Guide):
1. Ensure your application is accessible over a public HTTPS domain.
2. For Instagram photo/video uploads, ensure your `STORAGE_PROVIDER` bucket URL is publicly accessible by Meta servers during container creation.
3. Provide step-by-step screencasts demonstrating OAuth login, account selection, and publishing verification.
4. All OAuth refresh tokens and access tokens are automatically stored encrypted at rest using AES-GCM.
