import json
from typing import Dict, List, Any
from app.config import settings

class AICaptionService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    async def generate_captions(self, master_caption: str, platforms: List[str], brand_tone: str = "Professional", default_hashtags: str = "") -> Dict[str, Any]:
        # Try OpenAI if configured
        if self.openai_key:
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=self.openai_key)
                prompt = self._build_prompt(master_caption, platforms, brand_tone, default_hashtags)
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert social media strategist. Return ONLY valid JSON with keys for each platform containing 'caption', and for youtube also include 'title' and 'description'."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                print(f"OpenAI caption generation failed: {e}. Falling back to smart rules.")

        # Try Google Gemini if configured
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = self._build_prompt(master_caption, platforms, brand_tone, default_hashtags)
                response = model.generate_content(prompt)
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                return json.loads(text)
            except Exception as e:
                print(f"Gemini caption generation failed: {e}. Falling back to smart rules.")

        # Smart rule-based high-quality copywriting generator
        return self._smart_rule_generator(master_caption, platforms, brand_tone, default_hashtags)

    def _build_prompt(self, master_caption: str, platforms: List[str], brand_tone: str, default_hashtags: str) -> str:
        return f"""
Analyze this master caption: "{master_caption}"
Brand Tone: {brand_tone}
Default Hashtags: {default_hashtags}

Generate customized social media copy for the following platforms: {', '.join(platforms)}.
Rules:
- Instagram: Highly engaging, visually descriptive, include 10-15 relevant hashtags at the bottom including default hashtags.
- Facebook: Conversational, community-focused, encourage discussion and shares, 2-3 emojis, 3-5 hashtags.
- LinkedIn: Professional, authoritative, formatted with bullet points or clear spacing, industry insights focus, 3-4 professional hashtags.
- YouTube: Provide an SEO-optimized video 'title' (under 70 chars), a detailed 'description' with chapters/links placeholder, and tags.

Return a JSON object where each key is the platform lowercase name (e.g. 'instagram', 'facebook', 'linkedin', 'youtube').
For instagram, facebook, linkedin, the value must be an object with key 'caption'.
For youtube, the value must be an object with keys 'title', 'description', and 'caption' (which combines title and description).
"""

    def _smart_rule_generator(self, master_caption: str, platforms: List[str], brand_tone: str, default_hashtags: str) -> Dict[str, Any]:
        results = {}
        tags_list = [tag.strip() for tag in default_hashtags.split() if tag.strip()] if default_hashtags else ["#FounderLabs", "#Innovation", "#Tech", "#Growth", "#Startup"]
        tags_str = " ".join(tags_list)

        for p in platforms:
            p_lower = p.lower()
            if p_lower == "instagram":
                results["instagram"] = {
                    "caption": f"✨ {master_caption}\n.\n.\n🚀 Elevate your digital presence with FounderLabs.\n\n{tags_str} #InstagramReels #CreatorEconomy #SocialMedia #Design"
                }
            elif p_lower == "facebook":
                results["facebook"] = {
                    "caption": f"📣 {master_caption}\n\nWhat are your thoughts on this approach? Let us know in the comments below! 👇\n\n{tags_str[:3]} #Community #Discussion"
                }
            elif p_lower == "linkedin":
                results["linkedin"] = {
                    "caption": f"💡 Executive Insight | {brand_tone} Tone\n\n{master_caption}\n\nKey Takeaways:\n🔹 Strategic alignment across modern digital channels\n🔹 Leveraging automation for scalable brand communication\n🔹 High-impact execution with minimal operational friction\n\nWe'd love to hear how your leadership team is tackling these opportunities.\n\n{tags_str} #Leadership #Strategy #FounderLabs #BusinessGrowth"
                }
            elif p_lower == "youtube":
                title_text = master_caption.split("\n")[0][:65] if master_caption else "FounderLabs Exclusive Preview"
                if not title_text.strip():
                    title_text = "FounderLabs Product Showcase & Tutorial"
                desc = f"{master_caption}\n\n---\n📌 Subscribe to FounderLabs for more industry insights & product breakdowns.\n🌐 Visit us at: https://founderlabs.com\n\n#YouTube #FounderLabs #TechReview"
                results["youtube"] = {
                    "title": title_text,
                    "description": desc,
                    "caption": f"{title_text}\n\n{desc}"
                }
            else:
                results[p_lower] = {"caption": master_caption}
        return results

ai_caption_service = AICaptionService()
