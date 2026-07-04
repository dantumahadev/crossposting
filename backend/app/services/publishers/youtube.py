import httpx
import os
from typing import Dict, Any, Optional, List

class YouTubePublisher:
    def __init__(self, access_token: str, external_account_id: str):
        self.access_token = access_token
        self.channel_id = external_account_id
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    async def publish(self, title: str, description: str, file_path: Optional[str] = None, privacy_status: str = "public", tags: Optional[List[str]] = None) -> Dict[str, Any]:
        if not file_path or not os.path.exists(file_path):
            raise Exception("YouTube publishing requires a valid local video file_path for resumable upload.")

        async with httpx.AsyncClient(timeout=300.0) as client:
            file_size = os.path.getsize(file_path)

            # Step 1: Initiate resumable upload session
            init_url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
            init_headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Length": str(file_size),
                "X-Upload-Content-Type": "video/mp4"
            }
            metadata = {
                "snippet": {
                    "title": title[:100] if title else "FounderLabs Video Upload",
                    "description": description[:5000] if description else "",
                    "tags": tags or ["FounderLabs", "Innovation", "Tech", "Shorts"],
                    "categoryId": "22"  # People & Blogs
                },
                "status": {
                    "privacyStatus": privacy_status if privacy_status in ("public", "unlisted", "private") else "public",
                    "selfDeclaredMadeForKids": False
                }
            }

            init_resp = await client.post(init_url, json=metadata, headers=init_headers)
            if init_resp.status_code not in (200, 201):
                raise Exception(f"YouTube Resumable Upload Init Error ({init_resp.status_code}): {init_resp.text}")

            upload_uri = init_resp.headers.get("Location")
            if not upload_uri:
                raise Exception("Failed to retrieve resumable Location URI from YouTube Data API response.")

            # Step 2: Upload binary data in single chunk or streamed chunks
            with open(file_path, "rb") as f:
                video_data = f.read()

            upload_headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "video/mp4",
                "Content-Length": str(file_size)
            }
            put_resp = await client.put(upload_uri, content=video_data, headers=upload_headers)
            pub_data = put_resp.json() if put_resp.content else {}

            if put_resp.status_code not in (200, 201, 308):
                raise Exception(f"YouTube PUT Upload Error ({put_resp.status_code}): {pub_data}")

            video_id = pub_data.get("id")
            watch_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else "https://www.youtube.com"

            return {
                "status": "published",
                "external_post_id": video_id,
                "external_url": watch_url,
                "raw_response": pub_data
            }
