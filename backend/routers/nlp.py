from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, List, Any, Optional
from services.nlp_service import NLPService
from routers.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_content(
    content: str,
    analysis_type: str = Query("comprehensive", description="Type of analysis: ner, sentiment, topics, keywords, or comprehensive"),
    current_user: dict = Depends(get_current_user)
):
    """Analyze content using NLP techniques"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        if analysis_type == "ner":
            result = await nlp_service.extract_entities(content)
            return {
                "analysis_type": "ner",
                "entities": result,
                "content_length": len(content)
            }
        elif analysis_type == "sentiment":
            result = await nlp_service.analyze_sentiment(content)
            return {
                "analysis_type": "sentiment",
                "sentiment": result,
                "content_length": len(content)
            }
        elif analysis_type == "topics":
            result = await nlp_service.extract_topics(content)
            return {
                "analysis_type": "topics",
                "topics": result,
                "content_length": len(content)
            }
        elif analysis_type == "keywords":
            result = await nlp_service.extract_keywords(content)
            return {
                "analysis_type": "keywords",
                "keywords": result,
                "content_length": len(content)
            }
        elif analysis_type == "comprehensive":
            # Run all analyses
            entities = await nlp_service.extract_entities(content)
            sentiment = await nlp_service.analyze_sentiment(content)
            topics = await nlp_service.extract_topics(content)
            keywords = await nlp_service.extract_keywords(content)
            
            return {
                "analysis_type": "comprehensive",
                "entities": entities,
                "sentiment": sentiment,
                "topics": topics,
                "keywords": keywords,
                "content_length": len(content)
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid analysis type. Use: ner, sentiment, topics, keywords, or comprehensive"
            )
        
    except Exception as e:
        logger.error(f"Error analyzing content: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error analyzing content"
        )

@router.post("/summarize", response_model=Dict[str, Any])
async def summarize_text(
    content: str,
    max_sentences: int = Query(3, description="Maximum number of sentences in summary"),
    current_user: dict = Depends(get_current_user)
):
    """Summarize text content"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        summary = await nlp_service.summarize_text(content, max_sentences)
        
        return {
            "summary": summary,
            "original_length": len(content),
            "summary_length": len(summary),
            "compression_ratio": round(len(summary) / len(content), 2) if len(content) > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error summarizing text: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error summarizing text"
        )

@router.post("/extract-entities", response_model=List[Dict[str, Any]])
async def extract_entities(
    content: str,
    current_user: dict = Depends(get_current_user)
):
    """Extract named entities from text"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        entities = await nlp_service.extract_entities(content)
        
        return entities
        
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error extracting entities"
        )

@router.post("/analyze-sentiment", response_model=Dict[str, Any])
async def analyze_sentiment(
    content: str,
    current_user: dict = Depends(get_current_user)
):
    """Analyze sentiment of text"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        sentiment = await nlp_service.analyze_sentiment(content)
        
        return sentiment
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error analyzing sentiment"
        )

@router.post("/extract-topics", response_model=List[str])
async def extract_topics(
    content: str,
    num_topics: int = Query(5, description="Number of topics to extract"),
    current_user: dict = Depends(get_current_user)
):
    """Extract topics from text"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        topics = await nlp_service.extract_topics(content, num_topics)
        
        return topics
        
    except Exception as e:
        logger.error(f"Error extracting topics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error extracting topics"
        )

@router.post("/extract-keywords", response_model=List[str])
async def extract_keywords(
    content: str,
    num_keywords: int = Query(10, description="Number of keywords to extract"),
    current_user: dict = Depends(get_current_user)
):
    """Extract keywords from text"""
    try:
        nlp_service = NLPService()
        await nlp_service.initialize()
        
        keywords = await nlp_service.extract_keywords(content, num_keywords)
        
        return keywords
        
    except Exception as e:
        logger.error(f"Error extracting keywords: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error extracting keywords"
        )

@router.get("/capabilities", response_model=Dict[str, Any])
async def get_nlp_capabilities(current_user: dict = Depends(get_current_user)):
    """Get available NLP capabilities"""
    try:
        return {
            "capabilities": [
                {
                    "name": "Named Entity Recognition (NER)",
                    "description": "Extract named entities like people, organizations, locations",
                    "endpoint": "/api/v1/nlp/extract-entities",
                    "status": "active"
                },
                {
                    "name": "Sentiment Analysis",
                    "description": "Analyze emotional tone and sentiment of text",
                    "endpoint": "/api/v1/nlp/analyze-sentiment",
                    "status": "active"
                },
                {
                    "name": "Topic Extraction",
                    "description": "Extract main topics and themes from text",
                    "endpoint": "/api/v1/nlp/extract-topics",
                    "status": "active"
                },
                {
                    "name": "Keyword Extraction",
                    "description": "Extract important keywords and phrases",
                    "endpoint": "/api/v1/nlp/extract-keywords",
                    "status": "active"
                },
                {
                    "name": "Text Summarization",
                    "description": "Generate concise summaries of text content",
                    "endpoint": "/api/v1/nlp/summarize",
                    "status": "active"
                },
                {
                    "name": "Comprehensive Analysis",
                    "description": "Run all NLP analyses in one request",
                    "endpoint": "/api/v1/nlp/analyze",
                    "status": "active"
                }
            ],
            "models_used": [
                "spaCy en_core_web_sm",
                "NLTK VADER Sentiment Analyzer",
                "Custom keyword extraction algorithms"
            ],
            "supported_languages": ["English"],
            "max_content_length": 10000
        }
    except Exception as e:
        logger.error(f"Error getting NLP capabilities: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting NLP capabilities"
        )
