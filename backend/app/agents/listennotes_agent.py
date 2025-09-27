import httpx
from typing import Any, Dict, List
from ..models import Podcast
from ..utils.sanitize import sanitize_query
from ..config import settings

LISTEN_NOTES_BASE = "https://listen-api.listennotes.com/api/v2"

headers = {}
if settings.LISTEN_NOTES_API_KEY:
	headers["X-ListenAPI-Key"] = settings.LISTEN_NOTES_API_KEY

async def _map_episode_to_podcast(item: Dict[str, Any]) -> Podcast:
	return Podcast(
		id=str(item.get("id")),
		title=item.get("title") or item.get("podcast", {}).get("title", "Untitled"),
		description=item.get("description") or item.get("podcast", {}).get("description"),
		audio_url=item.get("audio"),
		thumbnail=(item.get("thumbnail") or item.get("image") or item.get("podcast", {}).get("thumbnail")),
		duration=item.get("audio_length_sec"),
		source="ListenNotes",
		publisher=item.get("podcast", {}).get("publisher"),
		language=item.get("podcast", {}).get("language"),
	)

async def fetch_trending() -> List[Podcast]:
	url = f"{LISTEN_NOTES_BASE}/curated_podcasts"
	try:
		async with httpx.AsyncClient(timeout=15.0) as client:
			resp = await client.get(url, headers=headers)
			resp.raise_for_status()
			data = resp.json()
			podcasts: List[Podcast] = []
			for list_item in data.get("curated_lists", []):
				for p in list_item.get("podcasts", []):
					podcasts.append(
						Podcast(
							id=str(p.get("id")),
							title=p.get("title") or "Untitled",
							description=p.get("description"),
							audio_url=None,
							thumbnail=p.get("thumbnail") or p.get("image"),
							duration=None,
							source="ListenNotes",
							publisher=p.get("publisher"),
							language=p.get("language"),
						)
					)
			return podcasts
	except Exception:
		return []

async def search_podcasts(query: str) -> List[Podcast]:
	q = sanitize_query(query)
	if not q:
		return []
	url = f"{LISTEN_NOTES_BASE}/search"
	params = {"q": q, "type": "episode", "offset": 0, "len_min": 1, "len_max": 300}
	try:
		async with httpx.AsyncClient(timeout=15.0) as client:
			resp = await client.get(url, params=params, headers=headers)
			resp.raise_for_status()
			data = resp.json()
			results = data.get("results", [])
			podcasts = [await _map_episode_to_podcast(item) for item in results]
			return podcasts
	except Exception:
		return []


