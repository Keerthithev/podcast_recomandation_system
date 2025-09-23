import httpx
import base64
from typing import Dict, List, Any, Optional
import logging
from config import settings
import asyncio

logger = logging.getLogger(__name__)

class SpotifyService:
    """Service for interacting with Spotify API"""
    
    def __init__(self):
        self.client_id = settings.spotify_client_id
        self.client_secret = settings.spotify_client_secret
        self.access_token = None
        self.token_expires_at = None
        self.base_url = "https://api.spotify.com/v1"
        self.http_client = None
    
    async def initialize(self) -> bool:
        """Initialize the Spotify service"""
        try:
            self.http_client = httpx.AsyncClient(timeout=30.0)
            await self._get_access_token()
            logger.info("Spotify service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Spotify service: {e}")
            return False
    
    async def _get_access_token(self) -> bool:
        """Get Spotify access token"""
        try:
            # Encode credentials
            credentials = f"{self.client_id}:{self.client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            # Request token
            headers = {
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            data = {"grant_type": "client_credentials"}
            
            response = await self.http_client.post(
                "https://accounts.spotify.com/api/token",
                headers=headers,
                data=data
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                expires_in = token_data.get("expires_in", 3600)
                self.token_expires_at = asyncio.get_event_loop().time() + expires_in
                return True
            else:
                logger.error(f"Failed to get Spotify token: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error getting Spotify access token: {e}")
            return False
    
    async def _ensure_valid_token(self) -> bool:
        """Ensure we have a valid access token"""
        if not self.access_token or (self.token_expires_at and asyncio.get_event_loop().time() >= self.token_expires_at):
            return await self._get_access_token()
        return True
    
    async def search_podcasts(self, query: str, limit: int = 20, market: str = "US") -> List[Dict[str, Any]]:
        """Search for podcasts on Spotify"""
        try:
            if not await self._ensure_valid_token():
                return []
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {
                "q": query,
                "type": "show",
                "limit": limit,
                "market": market
            }
            
            response = await self.http_client.get(
                f"{self.base_url}/search",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("shows", {}).get("items", [])
            else:
                logger.error(f"Spotify search failed: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching podcasts: {e}")
            return []
    
    async def get_podcast_details(self, podcast_id: str, market: str = "US") -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific podcast"""
        try:
            if not await self._ensure_valid_token():
                return None
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {"market": market}
            
            response = await self.http_client.get(
                f"{self.base_url}/shows/{podcast_id}",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get podcast details: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting podcast details: {e}")
            return None
    
    async def get_podcast_episodes(self, podcast_id: str, limit: int = 50, market: str = "US") -> List[Dict[str, Any]]:
        """Get episodes of a specific podcast"""
        try:
            if not await self._ensure_valid_token():
                return []
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {
                "market": market,
                "limit": limit
            }
            
            response = await self.http_client.get(
                f"{self.base_url}/shows/{podcast_id}/episodes",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("items", [])
            else:
                logger.error(f"Failed to get podcast episodes: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting podcast episodes: {e}")
            return []
    
    async def get_categories(self, limit: int = 50, market: str = "US") -> List[Dict[str, Any]]:
        """Get podcast categories"""
        try:
            if not await self._ensure_valid_token():
                return []
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {
                "limit": limit,
                "market": market
            }
            
            response = await self.http_client.get(
                f"{self.base_url}/browse/categories",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("categories", {}).get("items", [])
            else:
                logger.error(f"Failed to get categories: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return []
    
    async def get_featured_podcasts(self, limit: int = 20, market: str = "US") -> List[Dict[str, Any]]:
        """Get featured podcasts"""
        try:
            if not await self._ensure_valid_token():
                return []
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {
                "limit": limit,
                "market": market
            }
            
            response = await self.http_client.get(
                f"{self.base_url}/browse/featured-playlists",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                # This returns playlists, but we can use it as featured content
                return data.get("playlists", {}).get("items", [])
            else:
                logger.error(f"Failed to get featured podcasts: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting featured podcasts: {e}")
            return []
    
    async def search_by_category(self, category: str, limit: int = 20, market: str = "US") -> List[Dict[str, Any]]:
        """Search podcasts by category"""
        try:
            # First get the category ID
            categories = await self.get_categories(market=market)
            category_id = None
            
            for cat in categories:
                if cat.get("name", "").lower() == category.lower():
                    category_id = cat.get("id")
                    break
            
            if not category_id:
                logger.warning(f"Category '{category}' not found")
                return []
            
            # Search for playlists in this category
            if not await self._ensure_valid_token():
                return []
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            params = {
                "category_id": category_id,
                "limit": limit,
                "market": market
            }
            
            response = await self.http_client.get(
                f"{self.base_url}/browse/categories/{category_id}/playlists",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("playlists", {}).get("items", [])
            else:
                logger.error(f"Failed to search by category: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching by category: {e}")
            return []
    
    async def cleanup(self) -> bool:
        """Cleanup Spotify service resources"""
        try:
            if self.http_client:
                await self.http_client.aclose()
            self.access_token = None
            self.token_expires_at = None
            logger.info("Spotify service cleaned up")
            return True
        except Exception as e:
            logger.error(f"Error during Spotify cleanup: {e}")
            return False
