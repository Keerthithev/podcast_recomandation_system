from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
import hashlib
import jwt
from ..config import settings
from ..models import AdminUser, AdminLogin, UserRecommendation, AdminDashboardStats

# MongoDB connection
client = MongoClient(settings.DATABASE_URL)
db = client["podcast_recommendation"]
admin_users_collection = db["admin_users"]
user_recommendations_collection = db["user_recommendations"]
user_profiles_collection = db["user_profiles"]

router = APIRouter()
security = HTTPBearer()

# Admin credentials (in production, these should be in environment variables)
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123",  # In production, use a strong password
    "email": "admin@podcastapp.com"
}

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_admin_token(admin_id: str) -> str:
    """Create JWT token for admin"""
    payload = {
        "admin_id": admin_id,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "type": "admin"
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def verify_admin_token(token: str) -> str:
    """Verify admin JWT token and return admin_id"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload["admin_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current admin from JWT token"""
    token = credentials.credentials
    admin_id = verify_admin_token(token)
    
    # Verify admin still exists and is active
    admin = admin_users_collection.find_one({"admin_id": admin_id, "is_active": True})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found or inactive")
    
    return admin_id

def initialize_admin_user():
    """Initialize admin user if not exists"""
    existing_admin = admin_users_collection.find_one({"username": ADMIN_CREDENTIALS["username"]})
    if not existing_admin:
        admin_data = {
            "admin_id": str(uuid.uuid4()),
            "username": ADMIN_CREDENTIALS["username"],
            "email": ADMIN_CREDENTIALS["email"],
            "password_hash": hash_password(ADMIN_CREDENTIALS["password"]),
            "created_at": datetime.now(),
            "last_login": None,
            "is_active": True
        }
        admin_users_collection.insert_one(admin_data)
        print(f"Admin user created: {ADMIN_CREDENTIALS['username']}")

# Initialize admin user on startup
initialize_admin_user()

@router.post("/login")
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    admin = admin_users_collection.find_one({"username": login_data.username})
    
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not admin["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive"
        )
    
    # Update last login
    admin_users_collection.update_one(
        {"admin_id": admin["admin_id"]},
        {"$set": {"last_login": datetime.now()}}
    )
    
    token = create_admin_token(admin["admin_id"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin_id": admin["admin_id"],
        "username": admin["username"]
    }

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_admin: str = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    try:
        # Total users
        total_users = user_profiles_collection.count_documents({})
        
        # Total recommendations
        total_recommendations = user_recommendations_collection.count_documents({})
        
        # Recommendations today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        recommendations_today = user_recommendations_collection.count_documents({
            "created_at": {"$gte": today}
        })
        
        # Most recommended podcast
        most_recommended = list(user_recommendations_collection.aggregate([
            {"$group": {"_id": "$podcast_title", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]))
        most_recommended_podcast = most_recommended[0]["_id"] if most_recommended else None
        
        # Most active user
        most_active = list(user_recommendations_collection.aggregate([
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]))
        most_active_user = most_active[0]["_id"] if most_active else None
        
        # Recommendation sources
        sources = list(user_recommendations_collection.aggregate([
            {"$group": {"_id": "$podcast_source", "count": {"$sum": 1}}}
        ]))
        recommendation_sources = {source["_id"]: source["count"] for source in sources if source["_id"]}
        
        return AdminDashboardStats(
            total_users=total_users,
            total_recommendations=total_recommendations,
            recommendations_today=recommendations_today,
            most_recommended_podcast=most_recommended_podcast,
            most_active_user=most_active_user,
            recommendation_sources=recommendation_sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/recommendations/all")
async def get_all_recommendations(
    current_admin: str = Depends(get_current_admin),
    limit: int = 100,
    offset: int = 0,
    user_id: Optional[str] = None,
    source: Optional[str] = None
):
    """Get all user recommendations with filtering"""
    try:
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        if source:
            query["podcast_source"] = source
        
        # Get recommendations with user info
        pipeline = [
            {"$match": query},
            {"$lookup": {
                "from": "user_profiles",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "user_info"
            }},
            {"$addFields": {
                "user_email": {"$arrayElemAt": ["$user_info.email", 0]},
                "user_name": {"$arrayElemAt": ["$user_info.full_name", 0]}
            }},
            {"$project": {
                "_id": 0,
                "user_info": 0
            }},
            {"$sort": {"created_at": -1}},
            {"$skip": offset},
            {"$limit": limit}
        ]
        
        recommendations = list(user_recommendations_collection.aggregate(pipeline))
        
        # Get total count for pagination
        total_count = user_recommendations_collection.count_documents(query)
        
        return {
            "recommendations": recommendations,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendations: {str(e)}")

@router.get("/recommendations/user/{user_id}")
async def get_user_recommendations(
    user_id: str,
    current_admin: str = Depends(get_current_admin),
    limit: int = 50,
    offset: int = 0
):
    """Get recommendations for a specific user"""
    try:
        recommendations = list(user_recommendations_collection.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).skip(offset).limit(limit))
        
        total_count = user_recommendations_collection.count_documents({"user_id": user_id})
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user recommendations: {str(e)}")

@router.post("/recommendations/add")
async def add_recommendation(
    recommendation: UserRecommendation,
    current_admin: str = Depends(get_current_admin)
):
    """Add a new recommendation (for testing or manual addition)"""
    try:
        recommendation_data = recommendation.dict()
        recommendation_data["recommendation_id"] = str(uuid.uuid4())
        recommendation_data["created_at"] = datetime.now()
        
        result = user_recommendations_collection.insert_one(recommendation_data)
        
        return {
            "message": "Recommendation added successfully",
            "recommendation_id": recommendation_data["recommendation_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding recommendation: {str(e)}")

@router.delete("/recommendations/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: str,
    current_admin: str = Depends(get_current_admin)
):
    """Delete a recommendation"""
    try:
        result = user_recommendations_collection.delete_one({"recommendation_id": recommendation_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return {"message": "Recommendation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting recommendation: {str(e)}")

@router.get("/users/list")
async def get_all_users(
    current_admin: str = Depends(get_current_admin),
    limit: int = 100,
    offset: int = 0
):
    """Get list of all users"""
    try:
        users = list(user_profiles_collection.find(
            {},
            {"_id": 0, "password_hash": 0}  # Exclude sensitive data
        ).sort("date_joined", -1).skip(offset).limit(limit))
        
        total_count = user_profiles_collection.count_documents({})
        
        return {
            "users": users,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/test")
async def test_admin_endpoint():
    """Test endpoint to verify admin router is working"""
    return {"message": "Admin router is working", "timestamp": datetime.now().isoformat()}

