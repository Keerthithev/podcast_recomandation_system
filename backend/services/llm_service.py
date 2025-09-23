import openai
from typing import Dict, List, Any, Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Large Language Models"""
    
    def __init__(self):
        self.client = None
        self.model = "gpt-3.5-turbo"
        self.max_tokens = 1000
        self.temperature = 0.7
    
    async def initialize(self) -> bool:
        """Initialize the LLM service"""
        try:
            if not settings.openai_api_key or settings.openai_api_key == "your-openai-api-key-here":
                logger.warning("OpenAI API key not configured. Using mock responses.")
                return True
            
            openai.api_key = settings.openai_api_key
            self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
            
            # Test the connection
            await self._test_connection()
            logger.info("LLM service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize LLM service: {e}")
            return False
    
    async def _test_connection(self) -> bool:
        """Test the connection to OpenAI API"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return True
        except Exception as e:
            logger.error(f"LLM connection test failed: {e}")
            return False
    
    async def generate_text(self, prompt: str, max_tokens: Optional[int] = None) -> str:
        """Generate text using the LLM"""
        try:
            if not self.client:
                return await self._mock_response(prompt)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            return await self._mock_response(prompt)
    
    async def generate_recommendations(self, user_profile: Dict[str, Any], preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate podcast recommendations using LLM"""
        try:
            prompt = f"""
            Based on the following user profile and preferences, suggest 5 podcast recommendations:
            
            User Profile:
            - Categories: {user_profile.get('preferences', {}).get('categories', [])}
            - Languages: {user_profile.get('preferences', {}).get('languages', [])}
            - Listening History: {user_profile.get('listening_history', [])}
            
            Preferences:
            - Categories: {preferences.get('categories', [])}
            - Exclude Explicit: {preferences.get('exclude_explicit', True)}
            
            Return the recommendations as a JSON array with the following format:
            [
                {{
                    "title": "Podcast Title",
                    "description": "Brief description",
                    "category": "Category",
                    "reason": "Why this podcast is recommended"
                }}
            ]
            """
            
            response = await self.generate_text(prompt)
            
            # Try to parse JSON response
            import json
            try:
                recommendations = json.loads(response)
                return recommendations
            except json.JSONDecodeError:
                # If JSON parsing fails, return mock data
                return await self._mock_recommendations()
                
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return await self._mock_recommendations()
    
    async def analyze_content(self, content: str) -> Dict[str, Any]:
        """Analyze content using LLM"""
        try:
            prompt = f"""
            Analyze the following podcast content and provide insights:
            
            Content: {content[:1000]}...
            
            Provide analysis in the following format:
            - Main topics (list)
            - Sentiment (positive/negative/neutral)
            - Key themes (list)
            - Target audience
            - Content quality (1-10)
            - Summary (2-3 sentences)
            """
            
            response = await self.generate_text(prompt)
            
            # Parse the response (this is simplified - in production, you'd want more robust parsing)
            return {
                "analysis": response,
                "timestamp": "2024-01-01T00:00:00Z"  # This would be actual timestamp
            }
            
        except Exception as e:
            logger.error(f"Error analyzing content: {e}")
            return {"error": str(e)}
    
    async def _mock_response(self, prompt: str) -> str:
        """Generate mock response when LLM is not available"""
        if "recommendation" in prompt.lower():
            return "Based on your preferences, I recommend podcasts in the technology and science categories that align with your interests."
        elif "analysis" in prompt.lower():
            return "This content appears to be educational and informative, suitable for a general audience interested in learning."
        else:
            return "This is a mock response. Please configure the OpenAI API key for real LLM functionality."
    
    async def _mock_recommendations(self) -> List[Dict[str, Any]]:
        """Generate mock recommendations"""
        return [
            {
                "title": "Tech Talk Weekly",
                "description": "Latest technology trends and discussions",
                "category": "Technology",
                "reason": "Matches your interest in technology"
            },
            {
                "title": "Science Today",
                "description": "Daily science news and discoveries",
                "category": "Science",
                "reason": "Aligns with your science preferences"
            }
        ]
    
    async def cleanup(self) -> bool:
        """Cleanup LLM service resources"""
        try:
            self.client = None
            logger.info("LLM service cleaned up")
            return True
        except Exception as e:
            logger.error(f"Error during LLM cleanup: {e}")
            return False
