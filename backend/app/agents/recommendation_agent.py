# recommendation_agent.py

from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
import requests
from pymongo import MongoClient

# MongoDB connection (for storing recommendations history if needed)
client = MongoClient("mongodb+srv://<username>:<password>@<cluster_url>/")
db = client["podcast_recommendation"]
recommendations_collection = db["recommendations"]

# FastAPI app
app = FastAPI(title="Recommendation Agent")

# URL of User Preference Agent (make sure this is running)
USER_PREF_AGENT_URL = "http://localhost:8000/preferences/"  # change if deployed


# Function to fetch user preferences
def get_user_preferences(user_id: str) -> Dict[str, Any]:
    try:
        response = requests.get(USER_PREF_AGENT_URL + user_id)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=500, detail="Error fetching user preferences")


# Recommendation endpoint
@app.post("/recommend/")
def recommend(user_id: str, podcasts: List[Dict[str, Any]]):
    """
    podcasts input format:
    [
        {
            "title": "AI Trends 2025",
            "description": "Latest discussions on Artificial Intelligence",
            "genre": "Technology",
            "duration": 40,
            "language": "English"
        },
        ...
    ]
    """

    # 1. Get user preferences
    preferences = get_user_preferences(user_id)

    # 2. Apply filtering
    filtered = []
    for podcast in podcasts:
        if preferences["language"].lower() != podcast["language"].lower():
            continue
        if podcast["genre"] not in preferences["genres"]:
            continue
        if podcast["duration"] > preferences["max_duration"]:
            continue

        # Simple topic match in description/title
        if not any(topic.lower() in (podcast["title"] + podcast["description"]).lower()
                   for topic in preferences["topics"]):
            continue

        filtered.append(podcast)

    # 3. Save recommendation history
    recommendations_collection.insert_one({
        "user_id": user_id,
        "recommended": filtered
    })

    return {
        "user_id": user_id,
        "count": len(filtered),
        "recommendations": filtered
    }
