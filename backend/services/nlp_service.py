import spacy
import nltk
from typing import Dict, List, Any, Optional
import logging
import asyncio
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class NLPService:
    """Service for Natural Language Processing tasks"""
    
    def __init__(self):
        self.nlp_model = None
        self.initialized = False
    
    async def initialize(self) -> bool:
        """Initialize the NLP service"""
        try:
            # Download required NLTK data
            await self._download_nltk_data()
            
            # Load spaCy model
            try:
                self.nlp_model = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
                # Use a basic tokenizer as fallback
                self.nlp_model = None
            
            self.initialized = True
            logger.info("NLP service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize NLP service: {e}")
            return False
    
    async def _download_nltk_data(self):
        """Download required NLTK data"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
        except Exception as e:
            logger.warning(f"Failed to download NLTK data: {e}")
    
    async def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        try:
            if not self.nlp_model:
                return await self._basic_entity_extraction(text)
            
            doc = self.nlp_model(text)
            entities = []
            
            for ent in doc.ents:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": 0.8  # spaCy doesn't provide confidence scores
                })
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []
    
    async def _basic_entity_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Basic entity extraction without spaCy"""
        entities = []
        
        # Simple regex patterns for common entities
        patterns = {
            "PERSON": r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
            "ORG": r'\b[A-Z][a-z]+ (Inc|Corp|LLC|Ltd|Company)\b',
            "GPE": r'\b[A-Z][a-z]+ (City|State|Country)\b',
            "MONEY": r'\$[\d,]+(?:\.\d{2})?',
            "DATE": r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b'
        }
        
        for label, pattern in patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                entities.append({
                    "text": match.group(),
                    "label": label,
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.6
                })
        
        return entities
    
    async def summarize_text(self, text: str, max_sentences: int = 3) -> str:
        """Summarize text using extractive summarization"""
        try:
            if not self.nlp_model:
                return await self._basic_summarization(text, max_sentences)
            
            doc = self.nlp_model(text)
            sentences = [sent.text for sent in doc.sents]
            
            if len(sentences) <= max_sentences:
                return text
            
            # Simple extractive summarization based on sentence length and position
            scored_sentences = []
            for i, sentence in enumerate(sentences):
                score = len(sentence.split()) + (1.0 / (i + 1))  # Prefer longer sentences and earlier positions
                scored_sentences.append((score, sentence))
            
            # Sort by score and take top sentences
            scored_sentences.sort(reverse=True)
            summary_sentences = [sent for _, sent in scored_sentences[:max_sentences]]
            
            return " ".join(summary_sentences)
            
        except Exception as e:
            logger.error(f"Error summarizing text: {e}")
            return text[:200] + "..." if len(text) > 200 else text
    
    async def _basic_summarization(self, text: str, max_sentences: int) -> str:
        """Basic summarization without spaCy"""
        sentences = text.split('. ')
        if len(sentences) <= max_sentences:
            return text
        
        # Take first few sentences as summary
        return '. '.join(sentences[:max_sentences]) + '.'
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        try:
            from nltk.sentiment import SentimentIntensityAnalyzer
            
            sia = SentimentIntensityAnalyzer()
            scores = sia.polarity_scores(text)
            
            # Determine overall sentiment
            if scores['compound'] >= 0.05:
                sentiment = 'positive'
            elif scores['compound'] <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                "sentiment": sentiment,
                "compound_score": scores['compound'],
                "positive_score": scores['pos'],
                "negative_score": scores['neg'],
                "neutral_score": scores['neu']
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {
                "sentiment": "neutral",
                "compound_score": 0.0,
                "positive_score": 0.0,
                "negative_score": 0.0,
                "neutral_score": 1.0
            }
    
    async def extract_topics(self, text: str, num_topics: int = 5) -> List[str]:
        """Extract topics from text"""
        try:
            if not self.nlp_model:
                return await self._basic_topic_extraction(text, num_topics)
            
            doc = self.nlp_model(text)
            
            # Extract nouns and proper nouns as potential topics
            topics = []
            for token in doc:
                if token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop and not token.is_punct:
                    topics.append(token.lemma_.lower())
            
            # Count frequency and return most common
            from collections import Counter
            topic_counts = Counter(topics)
            return [topic for topic, _ in topic_counts.most_common(num_topics)]
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return []
    
    async def _basic_topic_extraction(self, text: str, num_topics: int) -> List[str]:
        """Basic topic extraction without spaCy"""
        # Simple keyword extraction based on word frequency
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
        
        from collections import Counter
        word_counts = Counter(filtered_words)
        return [word for word, _ in word_counts.most_common(num_topics)]
    
    async def extract_keywords(self, text: str, num_keywords: int = 10) -> List[str]:
        """Extract keywords from text"""
        try:
            if not self.nlp_model:
                return await self._basic_keyword_extraction(text, num_keywords)
            
            doc = self.nlp_model(text)
            
            # Extract meaningful words (nouns, adjectives, verbs)
            keywords = []
            for token in doc:
                if (token.pos_ in ['NOUN', 'ADJ', 'VERB'] and 
                    not token.is_stop and 
                    not token.is_punct and 
                    not token.is_space and
                    len(token.text) > 2):
                    keywords.append(token.lemma_.lower())
            
            # Count frequency and return most common
            from collections import Counter
            keyword_counts = Counter(keywords)
            return [keyword for keyword, _ in keyword_counts.most_common(num_keywords)]
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []
    
    async def _basic_keyword_extraction(self, text: str, num_keywords: int) -> List[str]:
        """Basic keyword extraction without spaCy"""
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
        
        from collections import Counter
        word_counts = Counter(filtered_words)
        return [word for word, _ in word_counts.most_common(num_keywords)]
    
    async def cleanup(self) -> bool:
        """Cleanup NLP service resources"""
        try:
            self.nlp_model = None
            self.initialized = False
            logger.info("NLP service cleaned up")
            return True
        except Exception as e:
            logger.error(f"Error during NLP cleanup: {e}")
            return False
