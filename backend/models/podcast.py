from pydantic import BaseModel, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> Any:
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: Any, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

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
    id: PyObjectId = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    nlp_analysis: Dict[str, Any] = {}
    embedding: List[float] = []
    popularity_score: float = 0.0
    content_quality_score: float = 0.0

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Podcast(PodcastBase):
    id: PyObjectId = None
    created_at: datetime
    updated_at: datetime
    nlp_analysis: Dict[str, Any]
    popularity_score: float
    content_quality_score: float

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

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
    id: PyObjectId = None
    podcast_id: PyObjectId
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    nlp_analysis: Dict[str, Any] = {}
    embedding: List[float] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

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
