from typing import Dict, List, Any, Optional
import asyncio
import logging
from datetime import datetime
from services.agents.agent_base import AgentBase
from services.llm_service import LLMService
from services.nlp_service import NLPService
from services.spotify_service import SpotifyService
from models.podcast import Podcast, RecommendationRequest, RecommendationResponse

logger = logging.getLogger(__name__)

class RecommendationAgent(AgentBase):
    """AI agent responsible for generating podcast recommendations"""
    
    def __init__(self, agent_id: str = "recommendation_agent"):
        super().__init__(agent_id, "recommendation")
        self.llm_service = LLMService()
        self.nlp_service = NLPService()
        self.spotify_service = SpotifyService()
        self.recommendation_history = []
    
    async def initialize(self) -> bool:
        """Initialize the recommendation agent"""
        try:
            await self.llm_service.initialize()
            await self.nlp_service.initialize()
            await self.spotify_service.initialize()
            self.update_status("ready")
            self.logger.info("Recommendation agent initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize recommendation agent: {e}")
            self.update_status("error")
            return False
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a recommendation request"""
        try:
            self.update_status("processing")
            
            # Parse request
            rec_request = RecommendationRequest(**request)
            
            # Get user preferences and history
            user_profile = await self._get_user_profile(rec_request.user_id)
            
            # Generate recommendations using multiple strategies
            recommendations = await self._generate_recommendations(rec_request, user_profile)
            
            # Use LLM to provide reasoning
            reasoning = await self._generate_reasoning(recommendations, user_profile)
            
            # Create response
            response = RecommendationResponse(
                recommendations=recommendations,
                reasoning=reasoning,
                confidence_score=0.85,  # This would be calculated based on various factors
                agent_used=self.agent_id
            )
            
            # Store recommendation history
            self.recommendation_history.append({
                "timestamp": datetime.utcnow(),
                "user_id": rec_request.user_id,
                "recommendations_count": len(recommendations),
                "confidence_score": response.confidence_score
            })
            
            self.update_status("ready")
            return response.dict()
            
        except Exception as e:
            self.logger.error(f"Error processing recommendation request: {e}")
            self.update_status("error")
            return {"error": str(e)}
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile and preferences"""
        # This would typically fetch from database
        # For now, return a mock profile
        return {
            "user_id": user_id,
            "preferences": {
                "categories": ["technology", "science", "business"],
                "languages": ["en"],
                "explicit_content": False
            },
            "listening_history": [],
            "favorite_podcasts": []
        }
    
    async def _generate_recommendations(self, request: RecommendationRequest, user_profile: Dict[str, Any]) -> List[Podcast]:
        """Generate podcast recommendations using multiple strategies"""
        recommendations = []
        
        # Strategy 1: Content-based filtering using NLP
        content_based = await self._content_based_filtering(request, user_profile)
        recommendations.extend(content_based)
        
        # Strategy 2: Collaborative filtering
        collaborative = await self._collaborative_filtering(request, user_profile)
        recommendations.extend(collaborative)
        
        # Strategy 3: LLM-based semantic search
        llm_based = await self._llm_based_recommendations(request, user_profile)
        recommendations.extend(llm_based)
        
        # Remove duplicates and limit results
        unique_recommendations = list({rec.id: rec for rec in recommendations}.values())
        return unique_recommendations[:request.limit]
    
    async def _content_based_filtering(self, request: RecommendationRequest, user_profile: Dict[str, Any]) -> List[Podcast]:
        """Content-based filtering using NLP analysis"""
        try:
            # This would analyze user preferences and match with podcast content
            # For now, return mock data
            return []
        except Exception as e:
            self.logger.error(f"Error in content-based filtering: {e}")
            return []
    
    async def _collaborative_filtering(self, request: RecommendationRequest, user_profile: Dict[str, Any]) -> List[Podcast]:
        """Collaborative filtering based on similar users"""
        try:
            # This would find users with similar preferences and recommend their liked podcasts
            # For now, return mock data
            return []
        except Exception as e:
            self.logger.error(f"Error in collaborative filtering: {e}")
            return []
    
    async def _llm_based_recommendations(self, request: RecommendationRequest, user_profile: Dict[str, Any]) -> List[Podcast]:
        """LLM-based semantic search for recommendations"""
        try:
            # Use LLM to understand user preferences and find relevant podcasts
            prompt = f"""
            Based on the user profile: {user_profile}
            Find podcast recommendations that match their interests.
            Consider categories: {request.categories or user_profile['preferences']['categories']}
            """
            
            # This would use the LLM service to generate recommendations
            # For now, return mock data
            return []
        except Exception as e:
            self.logger.error(f"Error in LLM-based recommendations: {e}")
            return []
    
    async def _generate_reasoning(self, recommendations: List[Podcast], user_profile: Dict[str, Any]) -> str:
        """Generate reasoning for recommendations using LLM"""
        try:
            prompt = f"""
            Explain why these podcast recommendations were made for the user:
            User profile: {user_profile}
            Recommendations: {[rec.title for rec in recommendations]}
            
            Provide a clear, personalized explanation.
            """
            
            reasoning = await self.llm_service.generate_text(prompt)
            return reasoning
        except Exception as e:
            self.logger.error(f"Error generating reasoning: {e}")
            return "Recommendations based on your preferences and listening history."
    
    async def cleanup(self) -> bool:
        """Cleanup agent resources"""
        try:
            await self.llm_service.cleanup()
            await self.nlp_service.cleanup()
            await self.spotify_service.cleanup()
            self.update_status("idle")
            return True
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")
            return False
