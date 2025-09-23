from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # MongoDB Configuration
    database_url: str = "mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/podcast_recommendation?retryWrites=true&w=majority"
    
    # Spotify API Credentials
    spotify_client_id: str = "82713377103d4540823ab7eeef098bfa"
    spotify_client_secret: str = "bd434fc651ea4b57b6cd204da21050e3"
    
    # API Configuration
    api_v1_str: str = "/api/v1"
    project_name: str = "Podcast Recommendation System"
    backend_cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OpenAI API
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
    
    # Agent Communication
    agent_communication_url: str = "http://localhost:8000/api/v1/agents"
    
    class Config:
        env_file = ".env"

settings = Settings()
