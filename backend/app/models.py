from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Podcast(BaseModel):
	id: Optional[str] = None
	title: str = Field(...)
	description: Optional[str] = None
	audio_url: Optional[str] = None
	thumbnail: Optional[str] = None
	duration: Optional[int] = None
	source: Optional[str] = None
	publisher: Optional[str] = None
	language: Optional[str] = None
	external_url: Optional[str] = None

class PodcastInDB(Podcast):
	mongo_id: Optional[str] = None

# Admin Models
class AdminUser(BaseModel):
	admin_id: str
	username: str
	email: str
	password_hash: str
	created_at: Optional[datetime] = None
	last_login: Optional[datetime] = None
	is_active: bool = True

class AdminLogin(BaseModel):
	username: str
	password: str

class UserRecommendation(BaseModel):
	recommendation_id: Optional[str] = None
	user_id: str
	user_email: Optional[str] = None
	user_name: Optional[str] = None
	podcast_id: str
	podcast_title: str
	podcast_description: Optional[str] = None
	podcast_thumbnail: Optional[str] = None
	podcast_duration: Optional[int] = None
	podcast_source: Optional[str] = None
	recommendation_reason: str
	confidence_score: Optional[float] = None
	created_at: Optional[datetime] = None
	user_preferences_used: Optional[Dict[str, Any]] = None

class AdminDashboardStats(BaseModel):
	total_users: int
	total_recommendations: int
	recommendations_today: int
	most_recommended_podcast: Optional[str] = None
	most_active_user: Optional[str] = None
	recommendation_sources: Dict[str, int] = {}