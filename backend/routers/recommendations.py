from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from models.simple_models import RecommendationRequest, RecommendationResponse, Podcast
from services.agents.recommendation_agent import RecommendationAgent
from services.agents.nlp_agent import NLPAgent
from routers.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize agents
recommendation_agent = RecommendationAgent()
nlp_agent = NLPAgent()

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(
    request: RecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate podcast recommendations using AI agents"""
    try:
        # Ensure agents are initialized
        if not recommendation_agent.initialized:
            await recommendation_agent.initialize()
        
        # Process recommendation request
        result = await recommendation_agent.process_request(request.dict())
        
        if "error" in result:
            raise HTTPException(
                status_code=500,
                detail=result["error"]
            )
        
        return RecommendationResponse(**result)
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error generating recommendations"
        )

@router.get("/quick", response_model=List[Podcast])
async def get_quick_recommendations(
    categories: Optional[List[str]] = Query(None, description="Preferred categories"),
    limit: int = Query(10, description="Number of recommendations"),
    current_user: dict = Depends(get_current_user)
):
    """Get quick recommendations based on user preferences"""
    try:
        # Create a quick recommendation request
        request = RecommendationRequest(
            user_id=current_user["sub"],
            limit=limit,
            categories=categories,
            exclude_listened=True,
            use_ai=True
        )
        
        # Generate recommendations
        response = await generate_recommendations(request, current_user)
        
        return response.recommendations
        
    except Exception as e:
        logger.error(f"Error getting quick recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting quick recommendations"
        )

@router.get("/trending", response_model=List[Podcast])
async def get_trending_podcasts(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(10, description="Number of trending podcasts"),
    current_user: dict = Depends(get_current_user)
):
    """Get trending podcasts"""
    try:
        # This would typically analyze listening patterns and popularity
        # For now, return featured podcasts as trending
        from services.spotify_service import SpotifyService
        
        spotify_service = SpotifyService()
        await spotify_service.initialize()
        
        if category:
            featured = await spotify_service.search_by_category(category, limit)
        else:
            featured = await spotify_service.get_featured_podcasts(limit)
        
        # Convert to our format
        podcasts = []
        for item in featured:
            podcast = Podcast(
                title=item.get("name", ""),
                description=item.get("description", ""),
                author=item.get("owner", {}).get("display_name", ""),
                category=category or "Trending",
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
        logger.error(f"Error getting trending podcasts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting trending podcasts"
        )

@router.get("/similar/{podcast_id}", response_model=List[Podcast])
async def get_similar_podcasts(
    podcast_id: str,
    limit: int = Query(10, description="Number of similar podcasts"),
    current_user: dict = Depends(get_current_user)
):
    """Get podcasts similar to a specific podcast"""
    try:
        # This would use content-based filtering and NLP analysis
        # For now, return a mock response
        return []
        
    except Exception as e:
        logger.error(f"Error getting similar podcasts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting similar podcasts"
        )

@router.post("/feedback", response_model=Dict[str, Any])
async def submit_recommendation_feedback(
    recommendation_id: str,
    rating: int = Query(..., ge=1, le=5, description="Rating from 1 to 5"),
    feedback: Optional[str] = Query(None, description="Optional feedback text"),
    current_user: dict = Depends(get_current_user)
):
    """Submit feedback on a recommendation"""
    try:
        # Store feedback in database
        from services.database import get_database
        from datetime import datetime
        
        db = await get_database()
        
        feedback_data = {
            "user_id": current_user["sub"],
            "recommendation_id": recommendation_id,
            "rating": rating,
            "feedback": feedback,
            "timestamp": datetime.utcnow()
        }
        
        await db.recommendation_feedback.insert_one(feedback_data)
        
        return {"message": "Feedback submitted successfully"}
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error submitting feedback"
        )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_recommendation_history(
    limit: int = Query(20, description="Number of history items to return"),
    current_user: dict = Depends(get_current_user)
):
    """Get user's recommendation history"""
    try:
        from services.database import get_database
        
        db = await get_database()
        
        # Get recommendation history for user
        history = await db.recommendations.find(
            {"user_id": current_user["sub"]}
        ).sort("created_at", -1).limit(limit).to_list(length=limit)
        
        # Format history
        formatted_history = []
        for item in history:
            formatted_history.append({
                "id": str(item["_id"]),
                "timestamp": item.get("created_at"),
                "recommendations_count": item.get("recommendations_count", 0),
                "confidence_score": item.get("confidence_score", 0.0),
                "agent_used": item.get("agent_used", "unknown")
            })
        
        return formatted_history
        
    except Exception as e:
        logger.error(f"Error getting recommendation history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting recommendation history"
        )

@router.get("/analytics", response_model=Dict[str, Any])
async def get_recommendation_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Get recommendation analytics for the user"""
    try:
        from services.database import get_database
        from datetime import datetime, timedelta
        
        db = await get_database()
        
        # Get analytics data
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Count recommendations in last 30 days
        recent_recommendations = await db.recommendations.count_documents({
            "user_id": current_user["sub"],
            "created_at": {"$gte": thirty_days_ago}
        })
        
        # Get average confidence score
        pipeline = [
            {"$match": {"user_id": current_user["sub"]}},
            {"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence_score"}}}
        ]
        confidence_result = await db.recommendations.aggregate(pipeline).to_list(1)
        avg_confidence = confidence_result[0]["avg_confidence"] if confidence_result else 0.0
        
        # Get most used agent
        agent_pipeline = [
            {"$match": {"user_id": current_user["sub"]}},
            {"$group": {"_id": "$agent_used", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        agent_result = await db.recommendations.aggregate(agent_pipeline).to_list(1)
        most_used_agent = agent_result[0]["_id"] if agent_result else "unknown"
        
        return {
            "recent_recommendations": recent_recommendations,
            "average_confidence": round(avg_confidence, 2),
            "most_used_agent": most_used_agent,
            "period": "30 days"
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting analytics"
        )
