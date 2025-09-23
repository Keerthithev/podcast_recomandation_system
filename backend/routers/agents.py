from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any, Optional
from services.agents.recommendation_agent import RecommendationAgent
from services.agents.nlp_agent import NLPAgent
from routers.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize agents
recommendation_agent = RecommendationAgent()
nlp_agent = NLPAgent()

@router.get("/status", response_model=Dict[str, Any])
async def get_agents_status(current_user: dict = Depends(get_current_user)):
    """Get status of all AI agents"""
    try:
        return {
            "recommendation_agent": recommendation_agent.get_agent_info(),
            "nlp_agent": nlp_agent.get_agent_info(),
            "total_agents": 2,
            "active_agents": 2 if recommendation_agent.status == "ready" and nlp_agent.status == "ready" else 0
        }
    except Exception as e:
        logger.error(f"Error getting agents status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting agents status"
        )

@router.post("/recommendation/initialize", response_model=Dict[str, Any])
async def initialize_recommendation_agent(current_user: dict = Depends(get_current_user)):
    """Initialize the recommendation agent"""
    try:
        success = await recommendation_agent.initialize()
        if success:
            return {"message": "Recommendation agent initialized successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to initialize recommendation agent"
            )
    except Exception as e:
        logger.error(f"Error initializing recommendation agent: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error initializing recommendation agent"
        )

@router.post("/nlp/initialize", response_model=Dict[str, Any])
async def initialize_nlp_agent(current_user: dict = Depends(get_current_user)):
    """Initialize the NLP agent"""
    try:
        success = await nlp_agent.initialize()
        if success:
            return {"message": "NLP agent initialized successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to initialize NLP agent"
            )
    except Exception as e:
        logger.error(f"Error initializing NLP agent: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error initializing NLP agent"
        )

@router.post("/nlp/process", response_model=Dict[str, Any])
async def process_nlp_request(
    task_type: str,
    content: str,
    current_user: dict = Depends(get_current_user)
):
    """Process an NLP request"""
    try:
        if not nlp_agent.initialized:
            await nlp_agent.initialize()
        
        request = {
            "task_type": task_type,
            "content": content
        }
        
        result = await nlp_agent.process_request(request)
        
        if "error" in result:
            raise HTTPException(
                status_code=500,
                detail=result["error"]
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing NLP request: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing NLP request"
        )

@router.get("/communication/protocols", response_model=Dict[str, Any])
async def get_communication_protocols(current_user: dict = Depends(get_current_user)):
    """Get information about agent communication protocols"""
    try:
        return {
            "protocols": [
                {
                    "name": "HTTP REST API",
                    "description": "Primary communication method for agent interactions",
                    "endpoints": [
                        "/api/v1/agents/status",
                        "/api/v1/agents/nlp/process",
                        "/api/v1/recommendations/generate"
                    ],
                    "status": "active"
                },
                {
                    "name": "Message Queue",
                    "description": "Asynchronous message passing between agents",
                    "implementation": "asyncio.Queue",
                    "status": "active"
                },
                {
                    "name": "MCP (Model Context Protocol)",
                    "description": "Standardized protocol for AI agent communication",
                    "status": "planned",
                    "note": "Future implementation for enhanced agent interoperability"
                }
            ],
            "agent_communication_flow": {
                "1": "User request received by API",
                "2": "Request routed to appropriate agent",
                "3": "Agent processes request using specialized capabilities",
                "4": "Agent may communicate with other agents if needed",
                "5": "Response returned to user",
                "6": "Communication logged for monitoring"
            }
        }
    except Exception as e:
        logger.error(f"Error getting communication protocols: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting communication protocols"
        )

@router.post("/cleanup", response_model=Dict[str, Any])
async def cleanup_agents(current_user: dict = Depends(get_current_user)):
    """Cleanup all agents"""
    try:
        rec_cleanup = await recommendation_agent.cleanup()
        nlp_cleanup = await nlp_agent.cleanup()
        
        if rec_cleanup and nlp_cleanup:
            return {"message": "All agents cleaned up successfully"}
        else:
            return {"message": "Some agents failed to cleanup properly"}
            
    except Exception as e:
        logger.error(f"Error cleaning up agents: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error cleaning up agents"
        )

@router.get("/performance", response_model=Dict[str, Any])
async def get_agents_performance(current_user: dict = Depends(get_current_user)):
    """Get performance metrics for all agents"""
    try:
        return {
            "recommendation_agent": {
                "status": recommendation_agent.status,
                "total_requests": len(recommendation_agent.recommendation_history),
                "last_activity": recommendation_agent.last_activity.isoformat(),
                "uptime": "N/A"  # Would calculate actual uptime
            },
            "nlp_agent": {
                "status": nlp_agent.status,
                "total_requests": "N/A",  # Would track actual requests
                "last_activity": nlp_agent.last_activity.isoformat(),
                "uptime": "N/A"
            },
            "system_health": "healthy" if recommendation_agent.status == "ready" and nlp_agent.status == "ready" else "degraded"
        }
    except Exception as e:
        logger.error(f"Error getting agents performance: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting agents performance"
        )
