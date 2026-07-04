from app.services.publishers.meta_facebook import MetaFacebookPublisher
from app.services.publishers.instagram import InstagramPublisher
from app.services.publishers.linkedin import LinkedInPublisher
from app.services.publishers.youtube import YouTubePublisher

def get_publisher(platform: str, access_token: str, external_account_id: str):
    p = platform.lower()
    if p == "facebook":
        return MetaFacebookPublisher(access_token, external_account_id)
    elif p == "instagram":
        return InstagramPublisher(access_token, external_account_id)
    elif p == "linkedin":
        return LinkedInPublisher(access_token, external_account_id)
    elif p == "youtube":
        return YouTubePublisher(access_token, external_account_id)
    else:
        raise ValueError(f"Unsupported social publishing platform: {platform}")
