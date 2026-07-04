import httpx
import asyncio
from typing import Dict, Any, Optional

class InstagramPublisher:
    def __init__(self, access_token: str, external_account_id: str):
        self.access_token = access_token
        self.ig_user_id = external_account_id
        self.base_url = "https://graph.facebook.com/v19.0"

    async def publish(self, caption: str, media_url: str, media_type: str) -> Dict[str, Any]:
        if not media_url:
            raise Exception("Instagram requires a valid public media_url for images or video Reels.")

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Step 1: Create media container
            create_url = f"{self.base_url}/{self.ig_user_id}/media"
            payload = {
                "access_token": self.access_token,
                "caption": caption
            }
            if media_type.startswith("video"):
                payload["video_url"] = media_url
                payload["media_type"] = "REELS"
            else:
                payload["image_url"] = media_url

            create_resp = await client.post(create_url, data=payload)
            create_data = create_resp.json()

            if create_resp.status_code >= 400 or "error" in create_data:
                err_msg = create_data.get("error", {}).get("message", "Unknown IG Container Creation Error")
                raise Exception(f"Instagram Container Error ({create_resp.status_code}): {err_msg}")

            container_id = create_data.get("id")
            if not container_id:
                raise Exception("Failed to retrieve creation_id from Instagram container response.")

            # Step 2: Poll container status for videos/Reels (up to 30 seconds)
            if media_type.startswith("video"):
                max_retries = 15
                for attempt in range(max_retries):
                    status_url = f"{self.base_url}/{container_id}"
                    status_resp = await client.get(status_url, params={"fields": "status_code", "access_token": self.access_token})
                    status_data = status_resp.json()
                    status_code = status_data.get("status_code", "").upper()

                    if status_code == "FINISHED":
                        break
                    elif status_code == "ERROR":
                        raise Exception("Instagram video processing failed on Meta servers.")
                    await asyncio.sleep(2)

            # Step 3: Publish container
            publish_url = f"{self.base_url}/{self.ig_user_id}/media_publish"
            publish_payload = {
                "access_token": self.access_token,
                "creation_id": container_id
            }
            pub_resp = await client.post(publish_url, data=publish_payload)
            pub_data = pub_resp.json()

            if pub_resp.status_code >= 400 or "error" in pub_data:
                err_msg = pub_data.get("error", {}).get("message", "Unknown IG Media Publish Error")
                raise Exception(f"Instagram Publish Error ({pub_resp.status_code}): {err_msg}")

            media_id = pub_data.get("id")
            
            # Step 4: Fetch permalink
            permalink = f"https://www.instagram.com/p/{media_id}/" if media_id else "https://www.instagram.com"
            if media_id:
                try:
                    info_resp = await client.get(f"{self.base_url}/{media_id}", params={"fields": "permalink", "access_token": self.access_token})
                    if info_resp.status_code == 200:
                        permalink = info_resp.json().get("permalink", permalink)
                except Exception:
                    pass

            return {
                "status": "published",
                "external_post_id": media_id,
                "external_url": permalink,
                "raw_response": pub_data
            }
