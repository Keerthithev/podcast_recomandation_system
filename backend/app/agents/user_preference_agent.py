# user_preference_agent.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pymongo import MongoClient
from datetime import datetime
import uuid

# MongoDB connection
client = MongoClient("mongodb+srv://<username>:<password>@<cluster_url>/")
db = client["podcast_recommendation"]
user_profiles_collection = db["user_profiles"]
user_history_collection = db["user_history"]
user_favorites_collection = db["user_favorites"]

# FastAPI app
app = FastAPI(title="User Profile & Preference Management")

# Data models
class UserProfile(BaseModel):
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    date_joined: Optional[datetime] = None
    last_active: Optional[datetime] = None

class UserPreference(BaseModel):
    user_id: str
    genres: List[str] = []
    topics: List[str] = []
    language: Optional[str] = "English"
    max_duration: Optional[int] = 60   # in minutes
    preferred_time_slots: List[str] = []  # e.g., ["morning", "evening"]
    content_type: List[str] = []  # e.g., ["educational", "entertainment", "news"]

class SearchHistoryItem(BaseModel):
    search_id: Optional[str] = None
    user_id: str
    query: str
    timestamp: Optional[datetime] = None
    results_count: Optional[int] = 0
    filters_applied: Optional[Dict[str, Any]] = {}

class ListenHistoryItem(BaseModel):
    listen_id: Optional[str] = None
    user_id: str
    podcast_id: str
    episode_id: Optional[str] = None
    podcast_title: str
    episode_title: Optional[str] = None
    duration_listened: Optional[int] = 0  # in seconds
    total_duration: Optional[int] = 0
    completion_percentage: Optional[float] = 0.0
    timestamp: Optional[datetime] = None
    platform: Optional[str] = None  # spotify, listennotes, etc.

class FavoriteItem(BaseModel):
    favorite_id: Optional[str] = None
    user_id: str
    item_type: str  # "podcast", "episode", "genre", "topic"
    item_id: str
    item_title: str
    item_description: Optional[str] = None
    item_image: Optional[str] = None
    date_added: Optional[datetime] = None
    tags: List[str] = []

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


# ============= PROFILE MANAGEMENT ENDPOINTS =============

@app.post("/profile/create")
def create_user_profile(profile: UserProfile):
    """Create a new user profile"""
    # Check if profile already exists
    existing_profile = user_profiles_collection.find_one({"user_id": profile.user_id})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile_data = profile.dict()
    profile_data["date_joined"] = datetime.now()
    profile_data["last_active"] = datetime.now()
    
    user_profiles_collection.insert_one(profile_data)
    return {"message": "Profile created successfully", "data": profile_data}

@app.get("/profile/{user_id}")
def get_user_profile(user_id: str):
    """Get user profile with preferences"""
    profile = user_profiles_collection.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Also get preferences
    preferences = user_profiles_collection.find_one(
        {"user_id": user_id, "preferences": {"$exists": True}}, 
        {"_id": 0, "preferences": 1}
    )
    
    if preferences and "preferences" in preferences:
        profile["preferences"] = preferences["preferences"]
    
    return profile

@app.put("/profile/{user_id}")
def update_user_profile(user_id: str, profile_update: UserProfileUpdate):
    """Update user profile"""
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data["last_active"] = datetime.now()
    
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated successfully", "updated_fields": list(update_data.keys())}

@app.delete("/profile/{user_id}")
def delete_user_profile(user_id: str):
    """Delete user profile and all associated data"""
    # Delete profile
    profile_result = user_profiles_collection.delete_one({"user_id": user_id})
    # Delete history
    user_history_collection.delete_many({"user_id": user_id})
    # Delete favorites
    user_favorites_collection.delete_many({"user_id": user_id})
    
    if profile_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile and all associated data deleted successfully"}

# ============= PREFERENCES MANAGEMENT =============

@app.post("/preferences/")
def save_preferences(pref: UserPreference):
    """Save or update user preferences"""
    pref_data = pref.dict()
    
    result = user_profiles_collection.update_one(
        {"user_id": pref.user_id},
        {"$set": {"preferences": pref_data, "last_active": datetime.now()}},
        upsert=True
    )
    
    return {"message": "Preferences saved successfully", "data": pref_data}

@app.get("/preferences/{user_id}")
def get_preferences(user_id: str):
    """Get user preferences"""
    profile = user_profiles_collection.find_one({"user_id": user_id}, {"_id": 0, "preferences": 1})
    if not profile or "preferences" not in profile:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return profile["preferences"]

@app.delete("/preferences/{user_id}")
def delete_preferences(user_id: str):
    """Delete user preferences"""
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$unset": {"preferences": ""}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Preferences deleted successfully"}

# ============= SEARCH HISTORY MANAGEMENT =============

@app.post("/history/search")
def add_search_history(search_item: SearchHistoryItem):
    """Add a search query to user's search history"""
    search_data = search_item.dict()
    search_data["search_id"] = str(uuid.uuid4())
    search_data["timestamp"] = datetime.now()
    
    user_history_collection.insert_one({
        **search_data,
        "history_type": "search"
    })
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": search_item.user_id},
        {"$set": {"last_active": datetime.now()}}
    )
    
    return {"message": "Search history added", "search_id": search_data["search_id"]}

@app.get("/history/search/{user_id}")
def get_search_history(user_id: str, limit: int = 50, offset: int = 0):
    """Get user's search history"""
    history = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "search"},
        {"_id": 0}
    ).sort("timestamp", -1).skip(offset).limit(limit))
    
    return {"search_history": history, "count": len(history)}

@app.delete("/history/search/{user_id}")
def clear_search_history(user_id: str):
    """Clear all search history for a user"""
    result = user_history_collection.delete_many({
        "user_id": user_id, 
        "history_type": "search"
    })
    return {"message": f"Deleted {result.deleted_count} search history items"}

@app.delete("/history/search/{user_id}/{search_id}")
def delete_search_item(user_id: str, search_id: str):
    """Delete a specific search history item"""
    result = user_history_collection.delete_one({
        "user_id": user_id,
        "search_id": search_id,
        "history_type": "search"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Search history item not found")
    
    return {"message": "Search history item deleted"}

# ============= LISTEN HISTORY MANAGEMENT =============

@app.post("/history/listen")
def add_listen_history(listen_item: ListenHistoryItem):
    """Add a podcast/episode to user's listen history"""
    listen_data = listen_item.dict()
    listen_data["listen_id"] = str(uuid.uuid4())
    listen_data["timestamp"] = datetime.now()
    
    # Calculate completion percentage
    if listen_data["total_duration"] and listen_data["total_duration"] > 0:
        listen_data["completion_percentage"] = (
            listen_data["duration_listened"] / listen_data["total_duration"]
        ) * 100
    
    user_history_collection.insert_one({
        **listen_data,
        "history_type": "listen"
    })
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": listen_item.user_id},
        {"$set": {"last_active": datetime.now()}}
    )
    
    return {"message": "Listen history added", "listen_id": listen_data["listen_id"]}

@app.get("/history/listen/{user_id}")
def get_listen_history(user_id: str, limit: int = 50, offset: int = 0):
    """Get user's listen history"""
    history = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "listen"},
        {"_id": 0}
    ).sort("timestamp", -1).skip(offset).limit(limit))
    
    return {"listen_history": history, "count": len(history)}

@app.get("/history/listen/{user_id}/stats")
def get_listen_stats(user_id: str):
    """Get user's listening statistics"""
    pipeline = [
        {"$match": {"user_id": user_id, "history_type": "listen"}},
        {"$group": {
            "_id": None,
            "total_episodes": {"$sum": 1},
            "total_time_listened": {"$sum": "$duration_listened"},
            "average_completion": {"$avg": "$completion_percentage"}
        }}
    ]
    
    stats = list(user_history_collection.aggregate(pipeline))
    
    if not stats:
        return {
            "total_episodes": 0,
            "total_time_listened": 0,
            "average_completion": 0,
            "total_time_hours": 0
        }
    
    result = stats[0]
    result["total_time_hours"] = result["total_time_listened"] / 3600 if result["total_time_listened"] else 0
    del result["_id"]
    
    return result

@app.delete("/history/listen/{user_id}")
def clear_listen_history(user_id: str):
    """Clear all listen history for a user"""
    result = user_history_collection.delete_many({
        "user_id": user_id, 
        "history_type": "listen"
    })
    return {"message": f"Deleted {result.deleted_count} listen history items"}

@app.delete("/history/listen/{user_id}/{listen_id}")
def delete_listen_item(user_id: str, listen_id: str):
    """Delete a specific listen history item"""
    result = user_history_collection.delete_one({
        "user_id": user_id,
        "listen_id": listen_id,
        "history_type": "listen"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listen history item not found")
    
    return {"message": "Listen history item deleted"}

# ============= FAVORITES MANAGEMENT =============

@app.post("/favorites")
def add_favorite(favorite_item: FavoriteItem):
    """Add an item to user's favorites"""
    # Check if already in favorites
    existing = user_favorites_collection.find_one({
        "user_id": favorite_item.user_id,
        "item_id": favorite_item.item_id,
        "item_type": favorite_item.item_type
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Item already in favorites")
    
    favorite_data = favorite_item.dict()
    favorite_data["favorite_id"] = str(uuid.uuid4())
    favorite_data["date_added"] = datetime.now()
    
    user_favorites_collection.insert_one(favorite_data)
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": favorite_item.user_id},
        {"$set": {"last_active": datetime.now()}}
    )
    
    return {"message": "Added to favorites", "favorite_id": favorite_data["favorite_id"]}

@app.get("/favorites/{user_id}")
def get_favorites(user_id: str, item_type: Optional[str] = None, limit: int = 50, offset: int = 0):
    """Get user's favorites, optionally filtered by type"""
    query = {"user_id": user_id}
    if item_type:
        query["item_type"] = item_type
    
    favorites = list(user_favorites_collection.find(
        query,
        {"_id": 0}
    ).sort("date_added", -1).skip(offset).limit(limit))
    
    return {"favorites": favorites, "count": len(favorites)}

@app.get("/favorites/{user_id}/types")
def get_favorite_types(user_id: str):
    """Get all favorite types for a user with counts"""
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$item_type",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    types = list(user_favorites_collection.aggregate(pipeline))
    return {"favorite_types": [{"type": t["_id"], "count": t["count"]} for t in types]}

@app.delete("/favorites/{user_id}/{favorite_id}")
def remove_favorite_by_id(user_id: str, favorite_id: str):
    """Remove a favorite by favorite_id"""
    result = user_favorites_collection.delete_one({
        "user_id": user_id,
        "favorite_id": favorite_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@app.delete("/favorites/{user_id}/item/{item_id}")
def remove_favorite_by_item(user_id: str, item_id: str, item_type: str):
    """Remove a favorite by item_id and type"""
    result = user_favorites_collection.delete_one({
        "user_id": user_id,
        "item_id": item_id,
        "item_type": item_type
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@app.delete("/favorites/{user_id}")
def clear_favorites(user_id: str, item_type: Optional[str] = None):
    """Clear all favorites for a user, optionally filtered by type"""
    query = {"user_id": user_id}
    if item_type:
        query["item_type"] = item_type
    
    result = user_favorites_collection.delete_many(query)
    return {"message": f"Deleted {result.deleted_count} favorites"}

@app.get("/favorites/{user_id}/check/{item_id}")
def check_favorite_status(user_id: str, item_id: str, item_type: str):
    """Check if an item is in user's favorites"""
    favorite = user_favorites_collection.find_one({
        "user_id": user_id,
        "item_id": item_id,
        "item_type": item_type
    })
    
    return {"is_favorite": favorite is not None, "favorite_id": favorite.get("favorite_id") if favorite else None}

# ============= COMPREHENSIVE USER DATA =============

@app.get("/user/{user_id}/complete")
def get_complete_user_data(user_id: str):
    """Get complete user data including profile, preferences, recent history, and favorite counts"""
    # Get profile
    profile = user_profiles_collection.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get recent search history (last 10)
    recent_searches = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "search"},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10))
    
    # Get recent listen history (last 10)
    recent_listens = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "listen"},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10))
    
    # Get favorite counts by type
    favorite_counts = list(user_favorites_collection.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$item_type", "count": {"$sum": 1}}}
    ]))
    
    # Get listening stats
    listen_stats_pipeline = [
        {"$match": {"user_id": user_id, "history_type": "listen"}},
        {"$group": {
            "_id": None,
            "total_episodes": {"$sum": 1},
            "total_time_listened": {"$sum": "$duration_listened"}
        }}
    ]
    listen_stats = list(user_history_collection.aggregate(listen_stats_pipeline))
    
    return {
        "profile": profile,
        "recent_searches": recent_searches,
        "recent_listens": recent_listens,
        "favorite_counts": {fc["_id"]: fc["count"] for fc in favorite_counts},
        "listening_stats": listen_stats[0] if listen_stats else {"total_episodes": 0, "total_time_listened": 0}
    }

@app.put("/user/{user_id}/activity")
def update_user_activity(user_id: str):
    """Update user's last active timestamp"""
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_active": datetime.now()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Activity updated", "last_active": datetime.now()}
