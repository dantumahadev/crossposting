import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import (
    PostDraft, PostTarget, PublishJob, ConnectedAccount, User, AuditLog,
    CreateDraftRequest, UpdateTargetRequest, AICaptionRequest
)
from app.routers.auth import get_current_user
from app.services.ai_caption import ai_caption_service
from app.services.worker import enqueue_job, run_publish_job

router = APIRouter(prefix="/api", tags=["posts"])

@router.post("/ai/captions")
async def generate_ai_captions(req: AICaptionRequest):
    res = await ai_caption_service.generate_captions(
        master_caption=req.master_caption,
        platforms=req.platforms,
        brand_tone=req.brand_tone or "Professional",
        default_hashtags=req.default_hashtags or ""
    )
    return res

@router.post("/posts/draft")
def create_draft(req: CreateDraftRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    draft = PostDraft(
        user_id=current_user.id,
        title=req.title,
        master_caption=req.master_caption,
        media_asset_id=req.media_asset_id,
        status="draft",
        scheduled_at=req.scheduled_at
    )
    session.add(draft)
    session.commit()
    session.refresh(draft)

    # Create targets for each platform
    for platform in req.platforms:
        # Find active account for this platform
        stmt = select(ConnectedAccount).where(
            ConnectedAccount.user_id == current_user.id,
            ConnectedAccount.platform == platform.lower(),
            ConnectedAccount.status == "active"
        )
        account = session.exec(stmt).first()
        target = PostTarget(
            post_draft_id=draft.id,
            platform=platform.lower(),
            account_id=account.id if account else None,
            caption=req.master_caption,
            status="pending"
        )
        session.add(target)
    
    session.commit()
    return get_post_status(draft.id, current_user, session)

@router.patch("/posts/targets/{target_id}")
def update_target(target_id: int, req: UpdateTargetRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    target = session.get(PostTarget, target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    if req.caption is not None:
        target.caption = req.caption
    if req.title is not None:
        target.title = req.title
    if req.description is not None:
        target.description = req.description
    if req.privacy is not None:
        target.privacy = req.privacy
    
    session.add(target)
    session.commit()
    session.refresh(target)
    return target

@router.post("/posts/{draft_id}/publish")
def publish_post(draft_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    draft = session.get(PostDraft, draft_id)
    if not draft or draft.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post draft not found")

    stmt = select(PostTarget).where(PostTarget.post_draft_id == draft.id)
    targets = session.exec(stmt).all()

    if not targets:
        raise HTTPException(status_code=400, detail="No platform targets selected for this post.")

    draft.status = "published" if not draft.scheduled_at else "scheduled"
    session.add(draft)

    jobs_created = []
    for target in targets:
        # Create PublishJob
        job = PublishJob(
            post_target_id=target.id,
            job_status="pending",
            attempts=0
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        jobs_created.append(job.id)

        target.status = "uploading" if not draft.scheduled_at else "scheduled"
        session.add(target)
        
        # Enqueue if not scheduled for later
        if not draft.scheduled_at:
            enqueue_job(job.id)

    session.commit()
    return get_post_status(draft.id, current_user, session)

@router.get("/posts/{draft_id}/status")
def get_post_status(draft_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    draft = session.get(PostDraft, draft_id)
    if not draft or draft.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post draft not found")

    stmt = select(PostTarget).where(PostTarget.post_draft_id == draft.id)
    targets = session.exec(stmt).all()

    target_details = []
    for t in targets:
        job_stmt = select(PublishJob).where(PublishJob.post_target_id == t.id).order_by(PublishJob.id.desc())
        latest_job = session.exec(job_stmt).first()
        acc = session.get(ConnectedAccount, t.account_id) if t.account_id else None

        target_details.append({
            "id": t.id,
            "platform": t.platform,
            "account_name": acc.account_name if acc else "Not Connected",
            "account_id": t.account_id,
            "caption": t.caption,
            "title": t.title,
            "description": t.description,
            "privacy": t.privacy,
            "status": t.status,
            "job": {
                "id": latest_job.id,
                "status": latest_job.job_status,
                "external_url": latest_job.external_url,
                "external_post_id": latest_job.external_post_id,
                "last_error": latest_job.last_error,
                "api_response": json.loads(latest_job.api_response_json) if latest_job.api_response_json else None,
                "updated_at": latest_job.updated_at
            } if latest_job else None
        })

    return {
        "id": draft.id,
        "title": draft.title,
        "master_caption": draft.master_caption,
        "media_asset_id": draft.media_asset_id,
        "status": draft.status,
        "scheduled_at": draft.scheduled_at,
        "created_at": draft.created_at,
        "targets": target_details
    }

@router.get("/posts")
def list_posts(platform: Optional[str] = Query(None), status: Optional[str] = Query(None), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(PostDraft).where(PostDraft.user_id == current_user.id).order_by(PostDraft.id.desc())
    drafts = session.exec(stmt).all()

    results = []
    for d in drafts:
        t_stmt = select(PostTarget).where(PostTarget.post_draft_id == d.id)
        targets = session.exec(t_stmt).all()

        # Apply filters
        if platform and not any(t.platform == platform.lower() for t in targets):
            continue
        if status and d.status != status.lower() and not any(t.status == status.lower() for t in targets):
            continue

        target_summary = []
        for t in targets:
            j_stmt = select(PublishJob).where(PublishJob.post_target_id == t.id).order_by(PublishJob.id.desc())
            job = session.exec(j_stmt).first()
            target_summary.append({
                "id": t.id,
                "platform": t.platform,
                "status": t.status,
                "external_url": job.external_url if job else None,
                "error": job.last_error if job else None,
                "raw_response": json.loads(job.api_response_json) if (job and job.api_response_json) else None
            })

        results.append({
            "id": d.id,
            "title": d.title,
            "master_caption": d.master_caption,
            "status": d.status,
            "created_at": d.created_at,
            "targets": target_summary
        })

    return results

@router.post("/jobs/{job_id}/retry")
def retry_job(job_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.get(PublishJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Publish job not found")

    target = session.get(PostTarget, job.post_target_id)
    draft = session.get(PostDraft, target.post_draft_id) if target else None
    if not draft or draft.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to retry this job.")

    job.job_status = "pending"
    job.last_error = None
    target.status = "uploading"
    session.add(job)
    session.add(target)
    session.commit()

    enqueue_job(job.id)
    return {"message": f"Job {job_id} requeued for retry.", "status": "pending"}
