"""
Centralized Gemini AI Service

Provides a unified interface for all AI interactions with:
- Prompt template system
- Response caching
- Rate limit handling
- Logging
- Validation
- Fallback responses
"""

import logging
import json
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum

import google.generativeai as genai
from config import get_settings
from services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class PromptType(str, Enum):
    """Enumeration of all AI prompt types in the system"""
    THERAPY_RESPONSE = "therapy_response"
    THERAPY_REFLECTION = "therapy_reflection"
    EMOTION_ANALYSIS = "emotion_analysis"
    COGNITIVE_INSIGHT = "cognitive_insight"
    BEHAVIOR_ANALYSIS = "behavior_analysis"
    MOOD_SUMMARY = "mood_summary"
    SESSION_SUMMARY = "session_summary"


class GeminiService:
    """Centralized service for Gemini AI interactions"""
    
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.gemini_api_key)
        self.model = genai.GenerativeModel('models/gemini-flash-latest')
        self.supabase = get_supabase()
        
        # Cache settings
        self.cache_ttl_hours = 24
        self.enable_caching = True
        
        # Rate limit settings
        self.max_retries = 3
        self.retry_delay = 2  # seconds
    
    def _get_cache_key(self, prompt_type: PromptType, context: Dict[str, Any]) -> str:
        """
        Generate a unique cache key for a prompt.
        
        Args:
            prompt_type: Type of prompt
            context: Context data for the prompt
            
        Returns:
            MD5 hash of prompt type and context
        """
        cache_data = {
            'type': prompt_type,
            'context': context
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[str]:
        """
        Retrieve cached AI response if available and not expired.
        
        Args:
            cache_key: Cache key to lookup
            
        Returns:
            Cached response or None
        """
        if not self.enable_caching:
            return None
        
        try:
            cutoff_time = (datetime.utcnow() - timedelta(hours=self.cache_ttl_hours)).isoformat()
            
            result = self.supabase.table('ai_cache') \
                .select('response') \
                .eq('cache_key', cache_key) \
                .gte('created_at', cutoff_time) \
                .execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"Cache hit for key: {cache_key[:8]}...")
                return result.data[0]['response']
            
            return None
            
        except Exception as e:
            # Table might not exist yet - that's okay
            logger.debug(f"Cache lookup failed (table may not exist): {str(e)}")
            return None
    
    def _cache_response(self, cache_key: str, response: str, prompt_type: PromptType):
        """
        Cache an AI response for future use.
        
        Args:
            cache_key: Cache key
            response: AI response to cache
            prompt_type: Type of prompt
        """
        if not self.enable_caching:
            return
        
        try:
            cache_data = {
                'cache_key': cache_key,
                'prompt_type': prompt_type,
                'response': response
            }
            
            self.supabase.table('ai_cache').insert(cache_data).execute()
            logger.info(f"Cached response for key: {cache_key[:8]}...")
            
        except Exception as e:
            # Silently fail if table doesn't exist yet
            logger.debug(f"Could not cache response (table may not exist): {str(e)}")
    
    def _log_interaction(
        self,
        prompt_type: PromptType,
        prompt: str,
        response: str,
        success: bool,
        error: Optional[str] = None,
        user_id: Optional[str] = None
    ):
        """
        Log AI interaction for debugging and monitoring.
        
        Args:
            prompt_type: Type of prompt
            prompt: The prompt sent
            response: The response received
            success: Whether the interaction succeeded
            error: Error message if failed
            user_id: Optional user ID
        """
        try:
            log_data = {
                'prompt_type': prompt_type,
                'prompt': prompt[:1000],  # Truncate long prompts
                'response': response[:2000] if response else None,
                'success': success,
                'error': error,
                'user_id': user_id
            }
            
            self.supabase.table('ai_logs').insert(log_data).execute()
            
        except Exception as e:
            # Silently fail if table doesn't exist yet
            logger.debug(f"Could not log AI interaction (table may not exist): {str(e)}")
    
    def _validate_response(self, response: str, prompt_type: PromptType) -> bool:
        """
        Validate AI response before returning to frontend.
        
        Args:
            response: AI response to validate
            prompt_type: Type of prompt
            
        Returns:
            True if valid, False otherwise
        """
        if not response or len(response.strip()) == 0:
            return False
        
        # Check minimum length
        if len(response) < 10:
            return False
        
        # Check for common error patterns
        error_patterns = [
            'I cannot',
            'I am unable',
            'Error:',
            'Exception:',
            'as an AI',
            'I apologize, but'
        ]
        
        response_lower = response.lower()
        for pattern in error_patterns:
            if pattern.lower() in response_lower:
                logger.warning(f"Response contains error pattern: {pattern}")
                return False
        
        # Type-specific validation
        if prompt_type == PromptType.EMOTION_ANALYSIS:
            # Should contain emotion keywords
            emotion_keywords = ['feel', 'emotion', 'mood', 'happy', 'sad', 'anxious', 'calm']
            if not any(keyword in response_lower for keyword in emotion_keywords):
                logger.warning("Emotion analysis missing emotion keywords")
                return False
        
        return True
    
    def _get_fallback_response(self, prompt_type: PromptType, context: Dict[str, Any]) -> str:
        """
        Get fallback response when Gemini is unavailable.
        
        Args:
            prompt_type: Type of prompt
            context: Context data
            
        Returns:
            Fallback response
        """
        fallbacks = {
            PromptType.THERAPY_RESPONSE: "I hear you. It's important to acknowledge what you're feeling. Take a moment to breathe and know that it's okay to feel this way.",
            
            PromptType.THERAPY_REFLECTION: "Thank you for sharing today. Remember that healing is a journey, and every step forward matters. Take care of yourself.",
            
            PromptType.EMOTION_ANALYSIS: "Your emotions are valid. It's natural to experience a range of feelings. Consider taking some time for self-care.",
            
            PromptType.COGNITIVE_INSIGHT: "You're making progress! Keep practicing these exercises to maintain your cognitive health.",
            
            PromptType.BEHAVIOR_ANALYSIS: "Consider setting healthy boundaries with technology. Small changes can make a big difference in your digital wellness.",
            
            PromptType.MOOD_SUMMARY: "Your emotional journey is unique. Continue tracking your moods to better understand your patterns.",
            
            PromptType.SESSION_SUMMARY: "This session covered important topics. Reflect on what resonated with you and consider journaling about it."
        }
        
        return fallbacks.get(prompt_type, "Thank you for using MindMate. We're here to support your wellness journey.")
    
    def _build_prompt(self, prompt_type: PromptType, context: Dict[str, Any]) -> str:
        """
        Build a prompt from template and context.
        
        Args:
            prompt_type: Type of prompt
            context: Context data to fill template
            
        Returns:
            Formatted prompt
        """
        templates = {
            PromptType.THERAPY_RESPONSE: """You are a compassionate AI therapist. Respond to the user's message with empathy and support.

User's message: {message}

Previous context: {context}

Provide a supportive, empathetic response (2-3 sentences). Use active listening techniques and validate their feelings.""",
            
            PromptType.THERAPY_REFLECTION: """Generate a closing reflection for a therapy session.

Session topics: {topics}
User's mood: {mood}

Provide a brief, encouraging reflection (2-3 sentences) that summarizes key insights and offers hope.""",
            
            PromptType.EMOTION_ANALYSIS: """Analyze the emotional content of this voice recording.

Transcript/Description: {content}

Classify the primary emotion (happy/sad/anxious/calm/stressed/neutral) and provide a brief, supportive response (1-2 sentences).""",
            
            PromptType.COGNITIVE_INSIGHT: """Generate an encouraging insight about cognitive game performance.

Game: {game_type}
Total plays: {total_plays}
Best score: {best_score}
Recent average: {recent_avg}
Previous average: {older_avg}

Provide ONE encouraging sentence about their cognitive performance. Focus on progress or consistency. Never mention decline.""",
            
            PromptType.BEHAVIOR_ANALYSIS: """Analyze digital wellness data and provide insights.

Days tracked: {days}
Average screen time: {avg_screen_time} minutes
Trend: {trend}
Detected patterns: {detections}
Risk level: {risk_level}

Provide:
1. A brief 2-sentence summary
2. 3 specific, actionable recommendations

Format as JSON:
{{"summary": "...", "recommendations": ["...", "...", "..."]}}""",
            
            PromptType.MOOD_SUMMARY: """Summarize mood patterns over time.

Mood entries: {mood_data}
Time period: {days} days

Provide a brief, insightful summary (2-3 sentences) about their emotional patterns and any positive trends.""",
            
            PromptType.SESSION_SUMMARY: """Summarize a therapy session.

Duration: {duration} minutes
Topics discussed: {topics}
User's final mood: {mood}

Provide a concise summary (2-3 sentences) highlighting key points and progress."""
        }
        
        template = templates.get(prompt_type, "{message}")
        
        try:
            return template.format(**context)
        except KeyError as e:
            logger.error(f"Missing context key for prompt: {e}")
            return template
    
    async def generate_response(
        self,
        prompt_type: PromptType,
        context: Dict[str, Any],
        user_id: Optional[str] = None,
        use_cache: bool = True
    ) -> str:
        """
        Generate an AI response with caching, validation, and fallback.
        
        Args:
            prompt_type: Type of prompt to generate
            context: Context data for the prompt
            user_id: Optional user ID for logging
            use_cache: Whether to use cached responses
            
        Returns:
            AI-generated response
        """
        # Generate cache key
        cache_key = self._get_cache_key(prompt_type, context)
        
        # Check cache
        if use_cache:
            cached = self._get_cached_response(cache_key)
            if cached:
                return cached
        
        # Build prompt
        prompt = self._build_prompt(prompt_type, context)
        
        # Try to generate response with retries
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Generating AI response (attempt {attempt + 1}/{self.max_retries})")
                
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
                
                # Clean up response (remove markdown code blocks if present)
                if response_text.startswith('```'):
                    lines = response_text.split('\n')
                    response_text = '\n'.join(lines[1:-1])
                    if response_text.startswith('json'):
                        response_text = response_text[4:].strip()
                
                # Validate response
                if self._validate_response(response_text, prompt_type):
                    # Cache successful response
                    self._cache_response(cache_key, response_text, prompt_type)
                    
                    # Log successful interaction
                    self._log_interaction(
                        prompt_type=prompt_type,
                        prompt=prompt,
                        response=response_text,
                        success=True,
                        user_id=user_id
                    )
                    
                    return response_text
                else:
                    logger.warning(f"Response validation failed (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Error generating AI response (attempt {attempt + 1}): {str(e)}")
                
                # Log failed interaction
                self._log_interaction(
                    prompt_type=prompt_type,
                    prompt=prompt,
                    response=None,
                    success=False,
                    error=str(e),
                    user_id=user_id
                )
                
                # If rate limited, wait before retry
                if 'rate limit' in str(e).lower() or 'quota' in str(e).lower():
                    if attempt < self.max_retries - 1:
                        import time
                        time.sleep(self.retry_delay * (attempt + 1))
                        continue
        
        # All attempts failed - return fallback
        logger.warning(f"All AI generation attempts failed, using fallback for {prompt_type}")
        fallback = self._get_fallback_response(prompt_type, context)
        
        # Log fallback usage
        self._log_interaction(
            prompt_type=prompt_type,
            prompt=prompt,
            response=fallback,
            success=False,
            error="Using fallback response",
            user_id=user_id
        )
        
        return fallback


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create the Gemini service singleton"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
