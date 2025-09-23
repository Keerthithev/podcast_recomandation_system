from typing import Dict, List, Any, Optional
import asyncio
import logging
from datetime import datetime
from services.agents.agent_base import AgentBase
from services.nlp_service import NLPService
from services.llm_service import LLMService

logger = logging.getLogger(__name__)

class NLPAgent(AgentBase):
    """AI agent responsible for natural language processing tasks"""
    
    def __init__(self, agent_id: str = "nlp_agent"):
        super().__init__(agent_id, "nlp")
        self.nlp_service = NLPService()
        self.llm_service = LLMService()
        self.processing_queue = asyncio.Queue()
    
    async def initialize(self) -> bool:
        """Initialize the NLP agent"""
        try:
            await self.nlp_service.initialize()
            await self.llm_service.initialize()
            self.update_status("ready")
            self.logger.info("NLP agent initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize NLP agent: {e}")
            self.update_status("error")
            return False
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process an NLP request"""
        try:
            self.update_status("processing")
            
            task_type = request.get("task_type")
            content = request.get("content", "")
            
            if not content:
                return {"error": "No content provided for processing"}
            
            result = {}
            
            if task_type == "ner":
                result = await self._perform_ner(content)
            elif task_type == "summarization":
                result = await self._perform_summarization(content)
            elif task_type == "sentiment_analysis":
                result = await self._perform_sentiment_analysis(content)
            elif task_type == "topic_extraction":
                result = await self._perform_topic_extraction(content)
            elif task_type == "keyword_extraction":
                result = await self._perform_keyword_extraction(content)
            elif task_type == "content_analysis":
                result = await self._perform_comprehensive_analysis(content)
            else:
                return {"error": f"Unknown task type: {task_type}"}
            
            self.update_status("ready")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing NLP request: {e}")
            self.update_status("error")
            return {"error": str(e)}
    
    async def _perform_ner(self, content: str) -> Dict[str, Any]:
        """Perform Named Entity Recognition"""
        try:
            entities = await self.nlp_service.extract_entities(content)
            return {
                "task_type": "ner",
                "entities": entities,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error in NER: {e}")
            return {"error": str(e)}
    
    async def _perform_summarization(self, content: str) -> Dict[str, Any]:
        """Perform text summarization"""
        try:
            summary = await self.nlp_service.summarize_text(content)
            return {
                "task_type": "summarization",
                "summary": summary,
                "original_length": len(content),
                "summary_length": len(summary),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error in summarization: {e}")
            return {"error": str(e)}
    
    async def _perform_sentiment_analysis(self, content: str) -> Dict[str, Any]:
        """Perform sentiment analysis"""
        try:
            sentiment = await self.nlp_service.analyze_sentiment(content)
            return {
                "task_type": "sentiment_analysis",
                "sentiment": sentiment,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error in sentiment analysis: {e}")
            return {"error": str(e)}
    
    async def _perform_topic_extraction(self, content: str) -> Dict[str, Any]:
        """Extract topics from content"""
        try:
            topics = await self.nlp_service.extract_topics(content)
            return {
                "task_type": "topic_extraction",
                "topics": topics,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error in topic extraction: {e}")
            return {"error": str(e)}
    
    async def _perform_keyword_extraction(self, content: str) -> Dict[str, Any]:
        """Extract keywords from content"""
        try:
            keywords = await self.nlp_service.extract_keywords(content)
            return {
                "task_type": "keyword_extraction",
                "keywords": keywords,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error in keyword extraction: {e}")
            return {"error": str(e)}
    
    async def _perform_comprehensive_analysis(self, content: str) -> Dict[str, Any]:
        """Perform comprehensive content analysis"""
        try:
            # Run multiple NLP tasks in parallel
            tasks = [
                self._perform_ner(content),
                self._perform_sentiment_analysis(content),
                self._perform_topic_extraction(content),
                self._perform_keyword_extraction(content)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine results
            analysis = {
                "task_type": "comprehensive_analysis",
                "content_length": len(content),
                "timestamp": datetime.utcnow().isoformat(),
                "ner": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
                "sentiment": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
                "topics": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
                "keywords": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])}
            }
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in comprehensive analysis: {e}")
            return {"error": str(e)}
    
    async def cleanup(self) -> bool:
        """Cleanup agent resources"""
        try:
            await self.nlp_service.cleanup()
            await self.llm_service.cleanup()
            self.update_status("idle")
            return True
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")
            return False
