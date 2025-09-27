from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any
from datetime import datetime, timedelta

from ..db import get_database
from ..agents.spotify_agent import search_episodes as spotify_search

router = APIRouter()

class SearchLogRequest(BaseModel):
	email: EmailStr
	query: str

@router.post("/search_log")
async def log_search(req: SearchLogRequest):
	db = await get_database()
	logs = db.get_collection("search_logs")
	doc = {"email": req.email.lower(), "query": req.query.strip()[:200], "ts": datetime.utcnow()}
	await logs.insert_one(doc)
	return {"ok": True}

@router.get("/recommendations")
async def recommendations(email: EmailStr, days: int = 14) -> List[Dict[str, Any]]:
	"""Naive recommendations: take top recent queries for the user and fetch Spotify results."""
	db = await get_database()
	logs = db.get_collection("search_logs")
	since = datetime.utcnow() - timedelta(days=days)
	cursor = logs.aggregate([
		{"$match": {"email": email.lower(), "ts": {"$gte": since}}},
		{"$group": {"_id": "$query", "count": {"$sum": 1}}},
		{"$sort": {"count": -1}},
		{"$limit": 3},
	])
	top_queries: List[str] = []
	async for row in cursor:
		q = row.get("_id")
		if q:
			top_queries.append(q)
	results: List[Dict[str, Any]] = []
	for q in top_queries:
		items = await spotify_search(q, limit=6)
		for p in items:
			results.append(p.model_dump(exclude_none=True))
	return results


