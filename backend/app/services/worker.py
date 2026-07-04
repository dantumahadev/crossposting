import asyncio
import json
import traceback
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.database import engine
from app.models import PublishJob, PostTarget, ConnectedAccount, PostDraft, MediaAsset, AuditLog
from app.security import decrypt_token
from app.services.publishers import get_publisher

def utcnow():
    return datetime.now(timezone.utc)

async def execute_publish_job_async(job_id: int):
    with Session(engine) as session:
        job = session.get(PublishJob, job_id)
        if not job:
            print(f"[Worker] Job {job_id} not found.")
            return

        target = session.get(PostTarget, job.post_target_id)
        if not target:
            job.job_status = "failed"
            job.last_error = "Associated PostTarget not found."
            session.add(job)
            session.commit()
            return

        draft = session.get(PostDraft, target.post_draft_id)
        account = session.get(ConnectedAccount, target.account_id) if target.account_id else None
        media = session.get(MediaAsset, draft.media_asset_id) if (draft and draft.media_asset_id) else None

        if not account:
            job.job_status = "failed"
            target.status = "failed"
            job.last_error = "No connected account linked to this target."
            session.add(job)
            session.add(target)
            session.commit()
            return

        # Start uploading state
        job.job_status = "uploading"
        job.attempts += 1
        job.updated_at = utcnow()
        target.status = "uploading"
        session.add(job)
        session.add(target)
        session.commit()

        try:
            access_token = decrypt_token(account.encrypted_access_token)
            if not access_token:
                raise Exception("Failed to decrypt access token for connected account.")

            publisher = get_publisher(account.platform, access_token, account.external_account_id)
            
            caption = target.caption or draft.master_caption
            media_url = media.file_url if media else None
            file_path = getattr(media, "file_path", None)
            if media and not file_path and media_url and media_url.startswith("http://localhost:8000/media/"):
                file_path = f"storage/media/{media_url.split('/')[-1]}"
            media_type = media.file_type if media else None

            # Execute platform specific publish call
            if account.platform.lower() == "youtube":
                res = await publisher.publish(
                    title=target.title or draft.title or "FounderLabs Video",
                    description=target.description or caption,
                    file_path=file_path,
                    privacy_status=target.privacy or "public",
                    tags=["FounderLabs", "Automation", "Social"]
                )
            elif account.platform.lower() == "linkedin":
                res = await publisher.publish(
                    caption=caption,
                    media_url=media_url,
                    file_path=file_path,
                    media_type=media_type
                )
            elif account.platform.lower() in ("facebook", "instagram"):
                res = await publisher.publish(
                    caption=caption,
                    media_url=media_url,
                    media_type=media_type
                )
            else:
                raise Exception(f"Unsupported platform: {account.platform}")

            # Mark as published
            job.job_status = "published"
            job.external_post_id = res.get("external_post_id")
            job.external_url = res.get("external_url")
            job.api_response_json = json.dumps(res.get("raw_response", {}))
            job.last_error = None
            job.updated_at = utcnow()
            target.status = "published"

            # Create AuditLog
            log = AuditLog(
                user_id=draft.user_id,
                action="PUBLISH_SUCCESS",
                platform=account.platform,
                request_id=str(job.id),
                metadata_json=json.dumps({"external_url": job.external_url, "post_id": job.external_post_id})
            )
            session.add(log)

        except Exception as e:
            err_trace = traceback.format_exc()
            print(f"[Worker Error] Job {job_id}: {e}\n{err_trace}")
            job.job_status = "failed"
            job.last_error = str(e)
            job.updated_at = utcnow()
            target.status = "failed"

            log = AuditLog(
                user_id=draft.user_id if draft else None,
                action="PUBLISH_FAILED",
                platform=account.platform if account else target.platform,
                request_id=str(job.id),
                metadata_json=json.dumps({"error": str(e)})
            )
            session.add(log)

        session.add(job)
        session.add(target)
        session.commit()

def run_publish_job(job_id: int):
    """Synchronous entry point for RQ queue worker or background threads."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    if loop.is_running():
        asyncio.create_task(execute_publish_job_async(job_id))
    else:
        loop.run_until_complete(execute_publish_job_async(job_id))

def enqueue_job(job_id: int):
    """Enqueues job to Redis RQ or executes immediately via background thread if Redis is unavailable."""
    try:
        import redis
        from rq import Queue
        from app.config import settings
        r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        r.ping()
        q = Queue(connection=r)
        q.enqueue(run_publish_job, job_id)
        print(f"[Queue] Enqueued Job {job_id} to Redis RQ.")
    except Exception as e:
        print(f"[Queue Note] Redis unavailable ({e}). Running Job {job_id} in background thread.")
        import threading
        t = threading.Thread(target=run_publish_job, args=(job_id,), daemon=True)
        t.start()

if __name__ == "__main__":
    print("Starting FounderLabs Redis Worker...")
    try:
        import redis
        from rq import Worker, Queue, Connection
        from app.config import settings
        redis_conn = redis.from_url(settings.REDIS_URL)
        with Connection(redis_conn):
            worker = Worker(list(map(Queue, ["default"])))
            worker.work()
    except Exception as e:
        print(f"Failed to start Redis RQ Worker: {e}")
