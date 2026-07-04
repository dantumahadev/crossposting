import httpx
import os
from typing import Dict, Any, Optional

class LinkedInPublisher:
    def __init__(self, access_token: str, external_account_id: str):
        self.access_token = access_token
        # Ensure external_account_id is formatted as urn:li:person:{id} or urn:li:organization:{id}
        if not external_account_id.startswith("urn:li:"):
            self.author_urn = f"urn:li:person:{external_account_id}"
        else:
            self.author_urn = external_account_id
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }

    async def publish(self, caption: str, media_url: Optional[str] = None, file_path: Optional[str] = None, media_type: Optional[str] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            media_urn = None

            # Step 1 & 2: If media exists, register upload and PUT file
            if file_path and os.path.exists(file_path):
                recipe = "urn:li:digitalmediaRecipe:feedshare-image"
                if media_type and media_type.startswith("video"):
                    recipe = "urn:li:digitalmediaRecipe:feedshare-video"

                register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
                register_payload = {
                    "registerUploadRequest": {
                        "recipes": [recipe],
                        "owner": self.author_urn,
                        "serviceRelationships": [{
                            "relationshipType": "OWNER",
                            "identifier": "ServiceGeneric"
                        }]
                    }
                }
                reg_resp = await client.post(register_url, json=register_payload, headers=self.headers)
                reg_data = reg_resp.json()

                if reg_resp.status_code >= 400:
                    raise Exception(f"LinkedIn Register Upload Error ({reg_resp.status_code}): {reg_data}")

                upload_mechanism = reg_data.get("value", {}).get("uploadMechanism", {}).get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {})
                upload_url = upload_mechanism.get("uploadUrl")
                media_urn = reg_data.get("value", {}).get("asset")

                if upload_url and media_urn:
                    with open(file_path, "rb") as f:
                        binary_data = f.read()
                    put_headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/octet-stream"}
                    put_resp = await client.put(upload_url, content=binary_data, headers=put_headers)
                    if put_resp.status_code not in (200, 201):
                        raise Exception(f"LinkedIn Media PUT Upload Error ({put_resp.status_code})")

            # Step 3: Create UGC Post
            post_url = "https://api.linkedin.com/v2/ugcPosts"
            post_payload = {
                "author": self.author_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": caption
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }

            if media_urn:
                share_category = "VIDEO" if (media_type and media_type.startswith("video")) else "IMAGE"
                post_payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = share_category
                post_payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
                    "status": "READY",
                    "description": {"text": caption[:200]},
                    "media": media_urn,
                    "title": {"text": "FounderLabs Media Upload"}
                }]
            elif media_url and not file_path:
                post_payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
                post_payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
                    "status": "READY",
                    "description": {"text": caption[:200]},
                    "originalUrl": media_url,
                    "title": {"text": "Shared via FounderLabs"}
                }]

            pub_resp = await client.post(post_url, json=post_payload, headers=self.headers)
            pub_data = pub_resp.json() if pub_resp.content else {}

            if pub_resp.status_code >= 400:
                raise Exception(f"LinkedIn UGC Post Error ({pub_resp.status_code}): {pub_data}")

            post_urn = pub_data.get("id") or pub_resp.headers.get("x-restli-id")
            # Build public URL from URN (e.g. urn:li:share:123 or urn:li:ugcPost:123)
            post_id_str = str(post_urn).split(":")[-1] if post_urn else ""
            external_url = f"https://www.linkedin.com/feed/update/{post_urn}/" if post_urn else "https://www.linkedin.com"

            return {
                "status": "published",
                "external_post_id": str(post_urn),
                "external_url": external_url,
                "raw_response": pub_data
            }
