import httpx
from typing import Dict, Any, Optional

class MetaFacebookPublisher:
    def __init__(self, access_token: str, external_account_id: str):
        self.access_token = access_token
        self.page_id = external_account_id
        self.base_url = "https://graph.facebook.com/v19.0"

    async def publish(self, caption: str, media_url: Optional[str] = None, media_type: Optional[str] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # 1. Video post
            if media_type and media_type.startswith("video"):
                endpoint = f"{self.base_url}/{self.page_id}/videos"
                payload = {
                    "access_token": self.access_token,
                    "description": caption,
                    "file_url": media_url
                }
            # 2. Photo post
            elif media_type and media_type.startswith("image") and media_url:
                endpoint = f"{self.base_url}/{self.page_id}/photos"
                payload = {
                    "access_token": self.access_token,
                    "caption": caption,
                    "url": media_url
                }
            # 3. Text or link feed post
            else:
                endpoint = f"{self.base_url}/{self.page_id}/feed"
                payload = {
                    "access_token": self.access_token,
                    "message": caption
                }
                if media_url and not media_type:
                    payload["link"] = media_url

            response = await client.post(endpoint, data=payload)
            data = response.json()

            if response.status_code >= 400 or "error" in data:
                err_msg = data.get("error", {}).get("message", "Unknown Meta Graph API Error")
                raise Exception(f"Facebook API Error ({response.status_code}): {err_msg}")

            post_id = data.get("id") or data.get("post_id")
            external_url = f"https://www.facebook.com/{post_id}" if post_id else "https://www.facebook.com"

            return {
                "status": "published",
                "external_post_id": post_id,
                "external_url": external_url,
                "raw_response": data
            }
