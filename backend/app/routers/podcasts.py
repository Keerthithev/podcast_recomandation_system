from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..models import Podcast
from ..agents.listennotes_agent import fetch_trending as ln_trending, search_podcasts as ln_search
from ..agents.spotify_agent import search_episodes as spotify_search, trending_episodes as spotify_trending
from ..db import get_podcasts_collection

router = APIRouter()

async def _save_podcasts(podcasts: List[Podcast]) -> None:
	collection = await get_podcasts_collection()
	if not podcasts:
		return
	docs = []
	for p in podcasts:
		doc = p.model_dump(exclude_none=True)
		if doc.get("id"):
			doc["_id"] = doc.pop("id")
		docs.append(doc)
	if docs:
		for doc in docs:
			if "_id" in doc:
				await collection.update_one({"_id": doc["_id"]}, {"$set": doc}, upsert=True)
			else:
				await collection.insert_one(doc)

@router.get("/trending", response_model=List[Podcast])
async def get_trending(provider: str = Query("listen_notes", pattern="^(listen_notes|spotify)$")):
	if provider == "spotify":
		podcasts = await spotify_trending()
	else:
		podcasts = await ln_trending()
	await _save_podcasts(podcasts)
	return podcasts

@router.get("/search", response_model=List[Podcast])
async def search(query: str = Query(..., min_length=1, max_length=200), provider: str = Query("listen_notes", pattern="^(listen_notes|spotify)$")):
	if provider == "spotify":
		podcasts = await spotify_search(query)
	else:
		podcasts = await ln_search(query)
	await _save_podcasts(podcasts)
	return podcasts

@router.get("/saved", response_model=List[Podcast])
async def get_saved():
	collection = await get_podcasts_collection()
	cursor = collection.find({}).limit(100)
	results: List[Podcast] = []
	async for doc in cursor:
		pid = str(doc.get("_id")) if doc.get("_id") else None
		results.append(Podcast(id=pid, **{k: v for k, v in doc.items() if k != "_id"}))
	return results
