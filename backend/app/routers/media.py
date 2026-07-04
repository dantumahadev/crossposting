from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from app.database import get_session
from app.models import MediaAsset, User
from app.routers.auth import get_current_user
from app.services.storage import storage_service

router = APIRouter(prefix="/api/media", tags=["media"])

@router.post("/upload", response_model=MediaAsset)
async def upload_media(file: UploadFile = File(...), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not file:
        raise HTTPException(status_code=400, detail="No media file uploaded.")
    
    try:
        saved_info = await storage_service.save_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File storage error: {str(e)}")

    asset = MediaAsset(
        user_id=current_user.id,
        file_url=saved_info["file_url"],
        file_type=saved_info["file_type"],
        file_size=saved_info["file_size"],
        thumbnail_url=saved_info.get("thumbnail_url"),
        duration=None  # Duration could be computed via ffprobe in future
    )
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset
