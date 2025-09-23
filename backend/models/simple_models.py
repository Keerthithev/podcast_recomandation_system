from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: Optional[str] = None
    hashed_password: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    preferences: dict = {}
    listening_history: List[str] = []
    favorite_podcasts: List[str] = []

class User(UserBase):
    id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    preferences: dict
    listening_history: List[str]
    favorite_podcasts: List[str]

class PodcastBase(BaseModel):
    title: str
    description: str
    author: str
    category: str
    language: str = "en"
    explicit: bool = False
    spotify_id: Optional[str] = None
    spotify_url: Optional[str] = None
    image_url: Optional[str] = None
    total_episodes: int = 0
    average_rating: float = 0.0
    tags: List[str] = []

class PodcastCreate(PodcastBase):
    pass

class PodcastUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    explicit: Optional[bool] = None
    spotify_id: Optional[str] = None
    spotify_url: Optional[str] = None
    image_url: Optional[str] = None
    total_episodes: Optional[int] = None
    average_rating: Optional[float] = None
    tags: Optional[List[str]] = None

class PodcastInDB(PodcastBase):
    id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    nlp_analysis: Dict[str, Any] = {}
    embedding: List[float] = []
    popularity_score: float = 0.0
    content_quality_score: float = 0.0

class Podcast(PodcastBase):
    id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    nlp_analysis: Dict[str, Any]
    popularity_score: float
    content_quality_score: float

class EpisodeBase(BaseModel):
    title: str
    description: str
    duration: int  # in seconds
    publish_date: datetime
    audio_url: Optional[str] = None
    spotify_id: Optional[str] = None
    spotify_url: Optional[str] = None
    transcript: Optional[str] = None

class EpisodeCreate(EpisodeBase):
    podcast_id: str

class EpisodeInDB(EpisodeBase):
    id: Optional[str] = None
    podcast_id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    nlp_analysis: Dict[str, Any] = {}
    embedding: List[float] = []

class Episode(EpisodeBase):
    id: Optional[str] = None
    podcast_id: str
    created_at: datetime
    updated_at: datetime
    nlp_analysis: Dict[str, Any]

class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 10
    categories: Optional[List[str]] = None
    exclude_listened: bool = True
    use_ai: bool = True

class RecommendationResponse(BaseModel):
    recommendations: List[Podcast]
    reasoning: str
    confidence_score: float
    agent_used: str
