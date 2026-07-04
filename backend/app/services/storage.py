import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.config import settings

class StorageService:
    def __init__(self):
        self.provider = settings.STORAGE_PROVIDER
        self.bucket = settings.STORAGE_BUCKET
        if self.provider == "local":
            Path(self.bucket).mkdir(parents=True, exist_ok=True)

    async def save_file(self, file: UploadFile) -> dict:
        ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        if self.provider == "local":
            file_path = os.path.join(self.bucket, unique_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_size = os.path.getsize(file_path)
            # Publicly accessible URL via FastAPI static mounting
            file_url = f"{settings.API_BASE_URL}/media/{unique_filename}"
            
            # Determine content type
            file_type = file.content_type or "application/octet-stream"
            
            return {
                "file_url": file_url,
                "file_path": file_path,
                "file_type": file_type,
                "file_size": file_size,
                "thumbnail_url": file_url if file_type.startswith("image") else None
            }
        else:
            # S3 / Cloudflare R2 abstraction placeholder for production
            raise NotImplementedError("Cloud storage provider not configured in this MVP build.")

storage_service = StorageService()
