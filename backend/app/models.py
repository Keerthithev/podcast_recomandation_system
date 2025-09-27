from pydantic import BaseModel, Field
from typing import Optional

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
