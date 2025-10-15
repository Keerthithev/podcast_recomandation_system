from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pymongo import MongoClient
from datetime import datetime
import json
import uuid
from ..config import settings

# MongoDB connection
client = MongoClient(settings.DATABASE_URL)
db = client["podcast_recommendation"]
user_profiles_collection = db["user_profiles"]
user_history_collection = db["user_history"]
user_favorites_collection = db["user_favorites"]
user_recommendations_collection = db["user_recommendations"]

router = APIRouter()

# Test endpoint
@router.get("/test")
def test_endpoint():
    """Test endpoint to verify the router is working"""
    return {"message": "User management router is working"}

@router.get("/test-db")
def test_db_connection():
    """Test MongoDB connection"""
    try:
        # Test database connection
        result = user_profiles_collection.find_one()
        return {"message": "Database connection working", "has_data": result is not None}
    except Exception as e:
        return {"message": "Database connection failed", "error": str(e)}

@router.post("/migrate-preferences")
def migrate_user_preferences():
    """Migrate existing users to have default preferences"""
    try:
        # Find all users without preferences
        users_without_prefs = user_profiles_collection.find(
            {"preferences": {"$exists": False}},
            {"user_id": 1}
        )
        
        updated_count = 0
        for user in users_without_prefs:
            user_id = user["user_id"]
            default_preferences = {
                "user_id": user_id,
                "preferred_language": "en",
                "max_duration": 60,
                "favorite_genres": [],
                "favorite_topics": [],
                "explicit_content": False,
                "auto_play": True,
                "download_quality": "high"
            }
            
            user_profiles_collection.update_one(
                {"user_id": user_id},
                {"$set": {"preferences": default_preferences, "last_active": datetime.now().isoformat()}}
            )
            updated_count += 1
        
        return {"message": f"Migration completed. Updated {updated_count} users with default preferences."}
    except Exception as e:
        return {"message": "Migration failed", "error": str(e)}

# Data models
class UserProfile(BaseModel):
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    date_joined: Optional[str] = None
    last_active: Optional[str] = None

class UserPreferences(BaseModel):
    user_id: str
    preferred_language: Optional[str] = "en"
    max_duration: Optional[int] = 60
    favorite_genres: List[str] = []
    favorite_topics: List[str] = []
    explicit_content: Optional[bool] = False
    auto_play: Optional[bool] = True
    download_quality: Optional[str] = "high"

class SearchHistoryItem(BaseModel):
    search_id: Optional[str] = None
    user_id: str
    query: str
    timestamp: Optional[str] = None
    results_count: Optional[int] = 0
    filters_applied: Optional[Dict[str, Any]] = {}

class ListenHistoryItem(BaseModel):
    listen_id: Optional[str] = None
    user_id: str
    podcast_id: str
    episode_id: Optional[str] = None
    podcast_title: str
    episode_title: Optional[str] = None
    duration_listened: Optional[int] = 0
    total_duration: Optional[int] = 0
    completion_percentage: Optional[float] = 0.0
    timestamp: Optional[str] = None
    platform: Optional[str] = None

class FavoriteItem(BaseModel):
    favorite_id: Optional[str] = None
    user_id: str
    item_type: str  # "podcast", "episode", "genre", "topic"
    item_id: str
    item_title: str
    item_description: Optional[str] = None
    item_image: Optional[str] = None
    date_added: Optional[str] = None
    tags: List[str] = []

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

# ============= PROFILE MANAGEMENT ENDPOINTS =============

@router.post("/profile/create-simple")
def create_user_profile_simple(data: dict):
    """Create a new user profile - simplified version"""
    try:
        user_id = data.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
            
        # Check if profile already exists
        existing_profile = user_profiles_collection.find_one({"user_id": user_id})
        if existing_profile:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        now = datetime.now().isoformat()
        profile_data = {
            "user_id": user_id,
            "username": data.get("username"),
            "email": data.get("email"),
            "full_name": data.get("full_name"),
            "bio": data.get("bio"),
            "profile_picture": data.get("profile_picture"),
            "date_joined": now,
            "last_active": now,
            "preferences": {
                "user_id": user_id,
                "preferred_language": "en",
                "max_duration": 60,
                "favorite_genres": [],
                "favorite_topics": [],
                "explicit_content": False,
                "auto_play": True,
                "download_quality": "high"
            }
        }
        
        # Insert into MongoDB
        result = user_profiles_collection.insert_one(profile_data)
        
        # Return data without MongoDB ObjectId
        return_data = profile_data.copy()
        return {"message": "Profile created successfully", "data": return_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {e}")  # For debugging
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.post("/profile/create")
def create_user_profile(profile: UserProfile):
    """Create a new user profile"""
    try:
        # Check if profile already exists
        existing_profile = user_profiles_collection.find_one({"user_id": profile.user_id})
        if existing_profile:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        profile_data = profile.dict()
        now = datetime.now().isoformat()
        profile_data["date_joined"] = now
        profile_data["last_active"] = now
        
        # Add default preferences
        profile_data["preferences"] = {
            "user_id": profile.user_id,
            "preferred_language": "en",
            "max_duration": 60,
            "favorite_genres": [],
            "favorite_topics": [],
            "explicit_content": False,
            "auto_play": True,
            "download_quality": "high"
        }
        
        # Insert into MongoDB
        result = user_profiles_collection.insert_one(profile_data)
        
        # Return data without MongoDB ObjectId
        return_data = profile_data.copy()
        return {"message": "Profile created successfully", "data": return_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {e}")  # For debugging
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.get("/profile/{user_id}")
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

@router.put("/profile/{user_id}")
def update_user_profile(user_id: str, profile_update: UserProfileUpdate):
    """Update user profile"""
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data["last_active"] = datetime.now().isoformat()
    
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated successfully", "updated_fields": list(update_data.keys())}

@router.delete("/profile/{user_id}")
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

@router.post("/preferences/")
def save_preferences(pref: UserPreferences):
    """Save or update user preferences"""
    pref_data = pref.dict()
    
    result = user_profiles_collection.update_one(
        {"user_id": pref.user_id},
        {"$set": {"preferences": pref_data, "last_active": datetime.now().isoformat()}},
        upsert=True
    )
    
    return {"message": "Preferences saved successfully", "data": pref_data}

@router.get("/preferences/{user_id}")
def get_preferences(user_id: str):
    """Get user preferences, create default if not found"""
    profile = user_profiles_collection.find_one({"user_id": user_id}, {"_id": 0, "preferences": 1})
    
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "preferences" not in profile:
        # Create default preferences
        default_preferences = {
            "user_id": user_id,
            "preferred_language": "en",
            "max_duration": 60,
            "favorite_genres": [],
            "favorite_topics": [],
            "explicit_content": False,
            "auto_play": True,
            "download_quality": "high"
        }
        
        # Save default preferences
        result = user_profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": {"preferences": default_preferences, "last_active": datetime.now().isoformat()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return default_preferences
    
    return profile["preferences"]

@router.put("/preferences/{user_id}")
def update_preferences(user_id: str, preferences: dict):
    """Update user preferences (partial update)"""
    # Get current preferences first
    current_prefs = get_preferences(user_id)
    
    # Merge with new preferences
    updated_prefs = {**current_prefs, **preferences}
    updated_prefs["user_id"] = user_id  # Ensure user_id is preserved
    
    # Update in database
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": {"preferences": updated_prefs, "last_active": datetime.now().isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Preferences updated successfully", "data": updated_prefs}

@router.delete("/preferences/{user_id}")
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

@router.post("/history/search")
def add_search_history(search_item: SearchHistoryItem):
    """Add a search query to user's search history"""
    search_data = search_item.dict()
    search_data["search_id"] = str(uuid.uuid4())
    search_data["timestamp"] = datetime.now().isoformat()
    
    user_history_collection.insert_one({
        **search_data,
        "history_type": "search"
    })
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": search_item.user_id},
        {"$set": {"last_active": datetime.now().isoformat()}}
    )
    
    return {"message": "Search history added", "search_id": search_data["search_id"]}

@router.get("/history/search/{user_id}")
def get_search_history(user_id: str, limit: int = 50, offset: int = 0):
    """Get user's search history"""
    history = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "search"},
        {"_id": 0}
    ).sort("timestamp", -1).skip(offset).limit(limit))
    
    return {"search_history": history, "count": len(history)}

@router.delete("/history/search/{user_id}")
def clear_search_history(user_id: str):
    """Clear all search history for a user"""
    result = user_history_collection.delete_many({
        "user_id": user_id, 
        "history_type": "search"
    })
    return {"message": f"Deleted {result.deleted_count} search history items"}

@router.delete("/history/search/{user_id}/{search_id}")
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

def generate_recommendation(user_id: str, podcast_data: dict, reason: str, confidence: float = 0.8):
    """Generate a recommendation entry for admin dashboard"""
    try:
        recommendation_data = {
            "recommendation_id": str(uuid.uuid4()),
            "user_id": user_id,
            "podcast_id": podcast_data.get("id", ""),
            "podcast_title": podcast_data.get("title", ""),
            "podcast_description": podcast_data.get("description", ""),
            "podcast_thumbnail": podcast_data.get("thumbnail", ""),
            "podcast_duration": podcast_data.get("duration", 0),
            "podcast_source": podcast_data.get("source", ""),
            "recommendation_reason": reason,
            "confidence_score": confidence,
            "created_at": datetime.now().isoformat(),
            "user_preferences_used": {}
        }
        
        # Get user preferences for context
        user_prefs = user_profiles_collection.find_one(
            {"user_id": user_id, "preferences": {"$exists": True}},
            {"preferences": 1}
        )
        if user_prefs and "preferences" in user_prefs:
            recommendation_data["user_preferences_used"] = user_prefs["preferences"]
        
        user_recommendations_collection.insert_one(recommendation_data)
    except Exception as e:
        print(f"Error generating recommendation: {e}")

@router.post("/history/listen")
def add_listen_history(listen_item: ListenHistoryItem):
    """Add a podcast/episode to user's listen history"""
    listen_data = listen_item.dict()
    listen_data["listen_id"] = str(uuid.uuid4())
    listen_data["timestamp"] = datetime.now().isoformat()
    
    # Calculate completion percentage
    if listen_data["total_duration"] and listen_data["total_duration"] > 0:
        listen_data["completion_percentage"] = (
            listen_data["duration_listened"] / listen_data["total_duration"]
        ) * 100
    
    user_history_collection.insert_one({
        **listen_data,
        "history_type": "listen"
    })
    
    # Generate recommendation based on listening behavior
    if listen_data["completion_percentage"] > 50:  # If user listened to more than 50%
        podcast_data = {
            "id": listen_data["podcast_id"],
            "title": listen_data["podcast_title"],
            "description": listen_data.get("episode_title", ""),
            "duration": listen_data["total_duration"],
            "source": listen_data.get("platform", "unknown")
        }
        reason = f"User listened to {listen_data['completion_percentage']:.1f}% of this podcast"
        confidence = min(0.9, listen_data["completion_percentage"] / 100)
        generate_recommendation(listen_item.user_id, podcast_data, reason, confidence)
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": listen_item.user_id},
        {"$set": {"last_active": datetime.now().isoformat()}}
    )
    
    return {"message": "Listen history added", "listen_id": listen_data["listen_id"]}

@router.get("/history/listen/{user_id}")
def get_listen_history(user_id: str, limit: int = 50, offset: int = 0):
    """Get user's listen history"""
    history = list(user_history_collection.find(
        {"user_id": user_id, "history_type": "listen"},
        {"_id": 0}
    ).sort("timestamp", -1).skip(offset).limit(limit))
    
    return {"listen_history": history, "count": len(history)}

@router.get("/history/listen/{user_id}/stats")
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

@router.delete("/history/listen/{user_id}")
def clear_listen_history(user_id: str):
    """Clear all listen history for a user"""
    result = user_history_collection.delete_many({
        "user_id": user_id, 
        "history_type": "listen"
    })
    return {"message": f"Deleted {result.deleted_count} listen history items"}

@router.delete("/history/listen/{user_id}/{listen_id}")
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

@router.post("/favorites")
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
    favorite_data["date_added"] = datetime.now().isoformat()
    
    user_favorites_collection.insert_one(favorite_data)
    
    # Generate recommendation for podcast favorites
    if favorite_item.item_type == "podcast":
        podcast_data = {
            "id": favorite_item.item_id,
            "title": favorite_item.item_title,
            "description": favorite_item.item_description or "",
            "thumbnail": favorite_item.item_image or "",
            "source": favorite_item.tags[0] if favorite_item.tags else "unknown"
        }
        reason = "User added this podcast to favorites"
        generate_recommendation(favorite_item.user_id, podcast_data, reason, 0.95)
    
    # Update user's last active time
    user_profiles_collection.update_one(
        {"user_id": favorite_item.user_id},
        {"$set": {"last_active": datetime.now().isoformat()}}
    )
    
    return {"message": "Added to favorites", "favorite_id": favorite_data["favorite_id"]}

@router.get("/favorites/{user_id}")
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

@router.get("/favorites/{user_id}/types")
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

@router.delete("/favorites/{user_id}/{favorite_id}")
def remove_favorite_by_id(user_id: str, favorite_id: str):
    """Remove a favorite by favorite_id"""
    result = user_favorites_collection.delete_one({
        "user_id": user_id,
        "favorite_id": favorite_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@router.delete("/favorites/{user_id}/item/{item_id}")
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

@router.delete("/favorites/{user_id}")
def clear_favorites(user_id: str, item_type: Optional[str] = None):
    """Clear all favorites for a user, optionally filtered by type"""
    query = {"user_id": user_id}
    if item_type:
        query["item_type"] = item_type
    
    result = user_favorites_collection.delete_many(query)
    return {"message": f"Deleted {result.deleted_count} favorites"}

@router.get("/favorites/{user_id}/check/{item_id}")
def check_favorite_status(user_id: str, item_id: str, item_type: str):
    """Check if an item is in user's favorites"""
    favorite = user_favorites_collection.find_one({
        "user_id": user_id,
        "item_id": item_id,
        "item_type": item_type
    })
    
    return {"is_favorite": favorite is not None, "favorite_id": favorite.get("favorite_id") if favorite else None}

# ============= COMPREHENSIVE USER DATA =============

@router.get("/user/{user_id}/complete")
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

@router.put("/user/{user_id}/activity")
def update_user_activity(user_id: str):
    """Update user's last active timestamp"""
    result = user_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_active": datetime.now().isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Activity updated", "last_active": datetime.now().isoformat()}
