from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid

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
	"""Generate recommendations based on user search history and save them to database."""
	db = await get_database()
	logs = db.get_collection("search_logs")
	user_recommendations = db.get_collection("user_recommendations")
	
	# Get user's top search queries
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
	
	# If no search history, return empty
	if not top_queries:
		return []
	
	# Generate recommendations based on search queries
	results: List[Dict[str, Any]] = []
	recommendation_records = []
	
	for query in top_queries:
		items = await spotify_search(query, limit=6)
		for p in items:
			podcast_data = p.model_dump(exclude_none=True)
			results.append(podcast_data)
			
			# Create recommendation record for admin dashboard
			recommendation_record = {
				"recommendation_id": str(uuid.uuid4()),
				"user_id": email.lower(),  # Using email as user_id for now
				"user_email": email.lower(),
				"podcast_id": podcast_data.get("id", ""),
				"podcast_title": podcast_data.get("title", ""),
				"podcast_description": podcast_data.get("description", ""),
				"podcast_thumbnail": podcast_data.get("thumbnail", ""),
				"podcast_duration": podcast_data.get("duration", 0),
				"podcast_source": podcast_data.get("source", "Spotify"),
				"recommendation_reason": f"Based on your frequent searches for '{query}' - you searched this {len([q for q in top_queries if q == query])} times recently",
				"confidence_score": 0.85,  # High confidence based on search frequency
				"created_at": datetime.utcnow().isoformat(),
				"user_preferences_used": {
					"search_queries": top_queries,
					"days_analyzed": days,
					"query_frequency": {q: len([x for x in top_queries if x == q]) for q in set(top_queries)}
				}
			}
			recommendation_records.append(recommendation_record)
	
	# Save recommendations to database for admin dashboard
	if recommendation_records:
		try:
			# Remove old recommendations for this user first
			await user_recommendations.delete_many({"user_id": email.lower()})
			# Insert new recommendations
			await user_recommendations.insert_many(recommendation_records)
		except Exception as e:
			print(f"Error saving recommendations: {e}")
	
	return results


