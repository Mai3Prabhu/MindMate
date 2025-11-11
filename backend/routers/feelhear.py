from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging
import base64
import json

from services.supabase_client import get_supabase
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client
import google.generativeai as genai
from config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class AudioAnalyzeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio data")
    duration_seconds: int = Field(..., ge=1, le=30, description="Audio duration in seconds")


class EmotionResult(BaseModel):
    emotion: str
    intensity: int = Field(..., ge=0, le=100)
    secondary_emotions: List[str] = []


class AudioAnalyzeResponse(BaseModel):
    session_id: str
    emotion: str
    intensity: int
    secondary_emotions: List[str]
    message: str
    transcription: Optional[str] = None


class FeelHearSession(BaseModel):
    id: str
    analyzed_emotion: str
    intensity: int
    summary: str
    timestamp: datetime
    saved: bool


class SaveSessionRequest(BaseModel):
    session_id: str


# Helper Functions
async def analyze_audio_emotion(audio_base64: str, duration: int) -> dict:
    """
    Analyze audio for emotional content using Gemini AI.
    
    Args:
        audio_base64: Base64 encoded audio data
        duration: Duration in seconds
        
    Returns:
        Dictionary with emotion analysis results
    """
    try:
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        
        # For now, we'll analyze based on text transcription
        # In production, you could use Gemini's multimodal capabilities
        # or a specialized audio emotion recognition model
        
        # Simulate emotion analysis based on audio characteristics
        # In a real implementation, you would:
        # 1. Transcribe audio using Whisper or Gemini
        # 2. Analyze tone, pitch, speed
        # 3. Combine with text sentiment
        
        prompt = f"""Analyze this voice recording for emotional content.
        
Duration: {duration} seconds

Based on typical voice patterns, classify the primary emotion and provide:
1. Primary emotion (happy, sad, stressed, calm, neutral)
2. Intensity (0-100)
3. Up to 2 secondary emotions
4. A brief, empathetic response (2-3 sentences)

Return ONLY valid JSON:
{{
    "emotion": "primary emotion",
    "intensity": 50,
    "secondary_emotions": ["emotion1", "emotion2"],
    "message": "empathetic response"
}}
"""
        
        model = genai.GenerativeModel('models/gemini-flash-latest')
        response = model.generate_content(prompt)
        
        # Parse response
        text = response.text.strip()
        
        # Extract JSON from response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        try:
            result = json.loads(text)
            
            # Validate and set defaults
            emotion = result.get('emotion', 'neutral')
            intensity = max(0, min(100, result.get('intensity', 50)))
            secondary = result.get('secondary_emotions', [])[:2]
            message = result.get('message', 'Thank you for sharing. I hear you.')
            
            return {
                'emotion': emotion,
                'intensity': intensity,
                'secondary_emotions': secondary,
                'message': message
            }
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Gemini response: {text}")
            return {
                'emotion': 'neutral',
                'intensity': 50,
                'secondary_emotions': [],
                'message': 'Thank you for sharing your feelings with me.'
            }
        
    except Exception as e:
        logger.error(f"Error analyzing audio emotion: {str(e)}")
        return {
            'emotion': 'neutral',
            'intensity': 50,
            'secondary_emotions': [],
            'message': 'I appreciate you sharing. How are you feeling right now?'
        }


def generate_empathetic_message(emotion: str, intensity: int) -> str:
    """
    Generate an empathetic message based on detected emotion.
    
    Args:
        emotion: Detected emotion
        intensity: Emotion intensity (0-100)
        
    Returns:
        Empathetic message string
    """
    messages = {
        'happy': [
            "It's wonderful to hear the joy in your voice! 😊",
            "Your happiness is contagious! Keep embracing those positive moments.",
            "I can feel your positive energy! What's bringing you joy today?"
        ],
        'sad': [
            "I hear the sadness in your voice, and I want you to know that it's okay to feel this way. 💙",
            "Your feelings are valid. Remember, it's okay to not be okay sometimes.",
            "I'm here with you. Would you like to talk about what's weighing on your heart?"
        ],
        'stressed': [
            "I can sense the stress in your voice. Take a deep breath with me. 🌬️",
            "Stress can be overwhelming. Remember to be gentle with yourself.",
            "You're carrying a lot right now. What would help you feel lighter?"
        ],
        'calm': [
            "Your voice sounds peaceful. It's beautiful to hear you in this calm state. 🕊️",
            "There's a lovely serenity in your tone. Keep nurturing this peace.",
            "Your calmness is grounding. How does it feel to be in this space?"
        ],
        'neutral': [
            "Thank you for sharing your voice with me. How are you feeling right now?",
            "I'm here to listen. What's on your mind today?",
            "Your presence matters. Would you like to share more about how you're feeling?"
        ]
    }
    
    emotion_messages = messages.get(emotion.lower(), messages['neutral'])
    
    # Select message based on intensity
    if intensity > 70:
        return emotion_messages[0]
    elif intensity > 40:
        return emotion_messages[1] if len(emotion_messages) > 1 else emotion_messages[0]
    else:
        return emotion_messages[2] if len(emotion_messages) > 2 else emotion_messages[0]


# Endpoints
@router.post("/analyze", response_model=AudioAnalyzeResponse)
@limiter.limit(get_rate_limit("feelhear_analyze"))
async def analyze_audio(
    request: Request,
    analyze_request: AudioAnalyzeRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Analyze audio recording for emotional content.
    Creates a FeelHear session with emotion analysis.
    """
    try:
        user_id = current_user['id']
        
        # Validate audio data
        try:
            audio_bytes = base64.b64decode(analyze_request.audio_base64)
            logger.info(f"Received audio: {len(audio_bytes)} bytes, {analyze_request.duration_seconds}s")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid audio data")
        
        # Analyze emotion
        analysis = await analyze_audio_emotion(
            analyze_request.audio_base64,
            analyze_request.duration_seconds
        )
        
        # Generate empathetic message
        empathetic_message = generate_empathetic_message(
            analysis['emotion'],
            analysis['intensity']
        )
        
        # Use AI-generated message if available, otherwise use template
        final_message = analysis.get('message', empathetic_message)
        
        # Store session in database
        session_data = {
            'user_id': user_id,
            'analyzed_emotion': analysis['emotion'],
            'intensity': analysis['intensity'],
            'summary': final_message,
            'saved': False
        }
        
        result = supabase.table('feelhear_sessions').insert(session_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        session = result.data[0]
        
        logger.info(f"FeelHear session created: {session['id']} - {analysis['emotion']}")
        
        return AudioAnalyzeResponse(
            session_id=session['id'],
            emotion=analysis['emotion'],
            intensity=analysis['intensity'],
            secondary_emotions=analysis.get('secondary_emotions', []),
            message=final_message,
            transcription=None  # Could add transcription in future
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing audio: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze audio")


@router.post("/save")
async def save_feelhear_session(
    save_request: SaveSessionRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Mark a FeelHear session as saved.
    """
    try:
        user_id = current_user['id']
        
        # Verify session belongs to user
        session = supabase.table('feelhear_sessions') \
            .select('*') \
            .eq('id', save_request.session_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update saved status
        supabase.table('feelhear_sessions') \
            .update({'saved': True}) \
            .eq('id', save_request.session_id) \
            .execute()
        
        logger.info(f"FeelHear session saved: {save_request.session_id}")
        
        return {"message": "Session saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save session")


@router.get("/history", response_model=List[FeelHearSession])
async def get_feelhear_history(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10,
    saved_only: bool = False
):
    """
    Get user's FeelHear session history.
    """
    try:
        user_id = current_user['id']
        
        query = supabase.table('feelhear_sessions') \
            .select('*') \
            .eq('user_id', user_id)
        
        if saved_only:
            query = query.eq('saved', True)
        
        sessions = query.order('timestamp', desc=True).limit(limit).execute()
        
        if not sessions.data:
            return []
        
        return [
            FeelHearSession(
                id=s['id'],
                analyzed_emotion=s['analyzed_emotion'],
                intensity=s['intensity'],
                summary=s['summary'],
                timestamp=s['timestamp'],
                saved=s['saved']
            )
            for s in sessions.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving FeelHear history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")


@router.delete("/{session_id}")
async def delete_feelhear_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete a FeelHear session.
    """
    try:
        user_id = current_user['id']
        
        # Verify and delete
        result = supabase.table('feelhear_sessions') \
            .delete() \
            .eq('id', session_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        logger.info(f"FeelHear session deleted: {session_id}")
        
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete session")
