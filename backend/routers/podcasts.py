from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from models.simple_models import Podcast, PodcastCreate, PodcastUpdate, Episode, EpisodeCreate
from services.database import get_database
from services.spotify_service import SpotifyService
from services.nlp_service import NLPService
from routers.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/search", response_model=List[Podcast])
async def search_podcasts(
    query: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, description="Number of results to return"),
    current_user: dict = Depends(get_current_user)
):
    """Search for podcasts"""
    try:
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        # Search on Spotify
        spotify_results = await spotify_service.search_podcasts(query, limit)
        
        # Convert Spotify results to our format
        podcasts = []
        for item in spotify_results:
            podcast = Podcast(
                title=item.get("name", ""),
                description=item.get("description", ""),
                author=item.get("publisher", ""),
                category=item.get("categories", [{}])[0].get("name", "Unknown") if item.get("categories") else "Unknown",
                language=item.get("languages", ["en"])[0] if item.get("languages") else "en",
                explicit=item.get("explicit", False),
                spotify_id=item.get("id"),
                spotify_url=item.get("external_urls", {}).get("spotify"),
                image_url=item.get("images", [{}])[0].get("url") if item.get("images") else None,
                total_episodes=item.get("total_episodes", 0),
                average_rating=0.0,  # Spotify doesn't provide ratings
                tags=[]  # Would need to extract from description
            )
            podcasts.append(podcast)
        
        # Filter by category if specified
        if category:
            podcasts = [p for p in podcasts if p.category.lower() == category.lower()]
        
        await spotify_service.cleanup()
        return podcasts
        
    except Exception as e:
        logger.error(f"Error searching podcasts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error searching podcasts"
        )

@router.get("/categories", response_model=List[Dict[str, Any]])
async def get_categories(current_user: dict = Depends(get_current_user)):
    """Get available podcast categories"""
    try:
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        categories = await spotify_service.get_categories()
        
        # Format categories
        formatted_categories = []
        for cat in categories:
            formatted_categories.append({
                "id": cat.get("id"),
                "name": cat.get("name"),
                "description": cat.get("description", "")
            })
        
        await spotify_service.cleanup()
        return formatted_categories
        
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting categories"
        )

@router.get("/featured", response_model=List[Podcast])
async def get_featured_podcasts(
    limit: int = Query(10, description="Number of featured podcasts to return"),
    current_user: dict = Depends(get_current_user)
):
    """Get featured podcasts"""
    try:
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        featured = await spotify_service.get_featured_podcasts(limit)
        
        # Convert to our format
        podcasts = []
        for item in featured:
            podcast = Podcast(
                title=item.get("name", ""),
                description=item.get("description", ""),
                author=item.get("owner", {}).get("display_name", ""),
                category="Featured",
                language="en",
                explicit=False,
                spotify_id=item.get("id"),
                spotify_url=item.get("external_urls", {}).get("spotify"),
                image_url=item.get("images", [{}])[0].get("url") if item.get("images") else None,
                total_episodes=item.get("tracks", {}).get("total", 0),
                average_rating=0.0,
                tags=[]
            )
            podcasts.append(podcast)
        
        await spotify_service.cleanup()
        return podcasts
        
    except Exception as e:
        logger.error(f"Error getting featured podcasts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting featured podcasts"
        )

@router.get("/{podcast_id}", response_model=Podcast)
async def get_podcast_details(
    podcast_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific podcast"""
    try:
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        details = await spotify_service.get_podcast_details(podcast_id)
        
        if not details:
            raise HTTPException(
                status_code=404,
                detail="Podcast not found"
            )
        
        podcast = Podcast(
            title=details.get("name", ""),
            description=details.get("description", ""),
            author=details.get("publisher", ""),
            category=details.get("categories", [{}])[0].get("name", "Unknown") if details.get("categories") else "Unknown",
            language=details.get("languages", ["en"])[0] if details.get("languages") else "en",
            explicit=details.get("explicit", False),
            spotify_id=details.get("id"),
            spotify_url=details.get("external_urls", {}).get("spotify"),
            image_url=details.get("images", [{}])[0].get("url") if details.get("images") else None,
            total_episodes=details.get("total_episodes", 0),
            average_rating=0.0,
            tags=[]
        )
        
        await spotify_service.cleanup()
        return podcast
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting podcast details: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting podcast details"
        )

@router.get("/{podcast_id}/episodes", response_model=List[Episode])
async def get_podcast_episodes(
    podcast_id: str,
    limit: int = Query(50, description="Number of episodes to return"),
    current_user: dict = Depends(get_current_user)
):
    """Get episodes of a specific podcast"""
    try:
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        episodes_data = await spotify_service.get_podcast_episodes(podcast_id, limit)
        
        episodes = []
        for item in episodes_data:
            episode = Episode(
                title=item.get("name", ""),
                description=item.get("description", ""),
                duration=item.get("duration_ms", 0) // 1000,  # Convert to seconds
                publish_date=item.get("release_date", "2024-01-01"),
                audio_url=item.get("audio_preview_url"),
                spotify_id=item.get("id"),
                spotify_url=item.get("external_urls", {}).get("spotify"),
                transcript=None  # Would need to be fetched separately
            )
            episodes.append(episode)
        
        await spotify_service.cleanup()
        return episodes
        
    except Exception as e:
        logger.error(f"Error getting podcast episodes: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting podcast episodes"
        )

@router.post("/{podcast_id}/favorite", response_model=Dict[str, Any])
async def add_to_favorites(
    podcast_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Add a podcast to user's favorites"""
    try:
        db = await get_database()
        
        # Add to user's favorite podcasts
        result = await db.users.update_one(
            {"_id": current_user["sub"]},
            {"$addToSet": {"favorite_podcasts": podcast_id}}
        )
        
        if result.modified_count:
            return {"message": "Podcast added to favorites"}
        else:
            return {"message": "Podcast already in favorites"}
            
    except Exception as e:
        logger.error(f"Error adding to favorites: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error adding to favorites"
        )

@router.delete("/{podcast_id}/favorite", response_model=Dict[str, Any])
async def remove_from_favorites(
    podcast_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a podcast from user's favorites"""
    try:
        db = await get_database()
        
        # Remove from user's favorite podcasts
        result = await db.users.update_one(
            {"_id": current_user["sub"]},
            {"$pull": {"favorite_podcasts": podcast_id}}
        )
        
        if result.modified_count:
            return {"message": "Podcast removed from favorites"}
        else:
            return {"message": "Podcast not in favorites"}
            
    except Exception as e:
        logger.error(f"Error removing from favorites: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error removing from favorites"
        )

@router.get("/favorites/list", response_model=List[str])
async def get_favorite_podcasts(current_user: dict = Depends(get_current_user)):
    """Get user's favorite podcasts"""
    try:
        db = await get_database()
        
        user = await db.users.find_one({"_id": current_user["sub"]})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        return user.get("favorite_podcasts", [])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting favorites: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting favorites"
        )
