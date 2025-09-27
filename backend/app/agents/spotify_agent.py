import base64
import time
from typing import Any, Dict, List, Optional, Set
import httpx
from ..models import Podcast
from ..utils.sanitize import sanitize_query
from ..config import settings

TOKEN_URL = "https://accounts.spotify.com/api/token"
SEARCH_URL = "https://api.spotify.com/v1/search"

_auth_cache: Dict[str, Any] = {"token": None, "expires_at": 0}

async def _get_access_token() -> Optional[str]:
	client_id = settings.SPOTIFY_CLIENT_ID
	client_secret = settings.SPOTIFY_CLIENT_SECRET
	if not client_id or not client_secret:
		return None
	if _auth_cache["token"] and time.time() < _auth_cache["expires_at"] - 30:
		return _auth_cache["token"]
	basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
	headers = {"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"}
	data = {"grant_type": "client_credentials"}
	try:
		async with httpx.AsyncClient(timeout=15.0) as client:
			resp = await client.post(TOKEN_URL, data=data, headers=headers)
			resp.raise_for_status()
			payload = resp.json()
			access_token = payload.get("access_token")
			expires_in = int(payload.get("expires_in", 3600))
			_auth_cache["token"] = access_token
			_auth_cache["expires_at"] = time.time() + expires_in
			return access_token
	except Exception:
		return None

async def search_episodes(query: str, limit: int = 12) -> List[Podcast]:
	q = sanitize_query(query)
	if not q:
		return []
	token = await _get_access_token()
	if not token:
		return []
	headers = {"Authorization": f"Bearer {token}"}
	params = {"q": q, "type": "episode", "limit": limit}
	try:
		async with httpx.AsyncClient(timeout=15.0) as client:
			resp = await client.get(SEARCH_URL, params=params, headers=headers)
			resp.raise_for_status()
			data = resp.json()
			items = data.get("episodes", {}).get("items", [])
			podcasts: List[Podcast] = []
			for item in items:
				pid = item.get("id")
				podcasts.append(
					Podcast(
						id=pid,
						title=item.get("name") or "Untitled",
						description=item.get("description"),
						audio_url=None,
						thumbnail=(item.get("images", [{}])[0].get("url") if item.get("images") else None),
						duration=int(item.get("duration_ms", 0) / 1000) if item.get("duration_ms") else None,
						source="Spotify",
						publisher=(item.get("show", {}).get("publisher")),
						language=None,
						external_url=(f"https://open.spotify.com/episode/{pid}" if pid else None),
					)
				)
			return podcasts
	except Exception:
		return []

async def trending_episodes() -> List[Podcast]:
	queries = ["top podcast", "trending", "news", "daily"]
	seen: Set[str] = set()
	results: List[Podcast] = []
	for q in queries:
		batch = await search_episodes(q, limit=8)
		for p in batch:
			pid = p.id or f"{p.title}:{p.publisher}"
			if pid and pid not in seen:
				seen.add(pid)
				results.append(p)
				if len(results) >= 18:
					return results
	return results


