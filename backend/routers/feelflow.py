from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta, date
import logging
import json

from services.supabase_client import get_supabase
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client
import google.generativeai as genai
from config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class MoodLogRequest(BaseModel):
    label: str = Field(..., pattern="^(happy|anxious|bored|focused|sad|calm|energetic|stressed|neutral)$")
    intensity: int = Field(..., ge=0, le=100)
    snippet: Optional[str] = Field(None, max_length=500)


class MoodEntry(BaseModel):
    id: str
    label: str
    intensity: int
    source: str
    timestamp: datetime
    snippet: Optional[str] = None


class MoodHistoryRequest(BaseModel):
    days: int = Field(default=30, ge=1, le=365)
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class MoodInsightsRequest(BaseModel):
    days: int = Field(default=30, ge=7, le=90)


class MoodInsightsResponse(BaseModel):
    insights: str
    dominant_emotions: List[dict]
    patterns: List[str]
    suggestions: List[str]


class ExportRequest(BaseModel):
    format: str = Field(..., pattern="^(txt|json)$")
    days: int = Field(default=30, ge=1, le=365)


# Helper Functions
async def generate_mood_insights(moods: List[dict], days: int) -> dict:
    """
    Generate AI insights from mood data using Gemini.
    
    Args:
        moods: List of mood entries
        days: Number of days analyzed
        
    Returns:
        Dictionary with insights, patterns, and suggestions
    """
    try:
        if not moods:
            return {
                'insights': 'No mood data available for analysis.',
                'dominant_emotions': [],
                'patterns': [],
                'suggestions': ['Start tracking your moods to gain insights into your emotional patterns.']
            }
        
        # Aggregate mood data
        mood_counts = {}
        total_intensity = {}
        
        for mood in moods:
            label = mood['label']
            intensity = mood['intensity']
            
            mood_counts[label] = mood_counts.get(label, 0) + 1
            total_intensity[label] = total_intensity.get(label, 0) + intensity
        
        # Calculate averages
        mood_averages = {
            label: total_intensity[label] / mood_counts[label]
            for label in mood_counts
        }
        
        # Sort by frequency
        dominant_emotions = sorted(
            [{'emotion': label, 'count': count, 'avg_intensity': mood_averages[label]}
             for label, count in mood_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:3]
        
        # Prepare data for Gemini
        mood_summary = {
            'total_entries': len(moods),
            'days_analyzed': days,
            'dominant_emotions': dominant_emotions,
            'mood_distribution': mood_counts
        }
        
        # Generate insights with Gemini
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        
        prompt = f"""Analyze these mood tracking entries over {days} days:

Total entries: {mood_summary['total_entries']}
Mood distribution: {json.dumps(mood_summary['mood_distribution'])}
Top emotions: {json.dumps(dominant_emotions)}

Provide:
1. A brief, empathetic summary (2-3 sentences)
2. 2-3 observable patterns or trends
3. 2-3 gentle, actionable suggestions for emotional wellness

Keep the tone warm, supportive, and non-judgmental. Focus on positive framing.

Return ONLY valid JSON:
{{
    "insights": "summary text",
    "patterns": ["pattern1", "pattern2"],
    "suggestions": ["suggestion1", "suggestion2"]
}}
"""
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Extract JSON
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        try:
            ai_response = json.loads(text)
            
            return {
                'insights': ai_response.get('insights', 'Your emotional journey is unique and valuable.'),
                'dominant_emotions': dominant_emotions,
                'patterns': ai_response.get('patterns', []),
                'suggestions': ai_response.get('suggestions', [])
            }
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Gemini response: {text}")
            return {
                'insights': 'Your mood tracking shows valuable patterns. Keep observing your emotional landscape.',
                'dominant_emotions': dominant_emotions,
                'patterns': ['Regular mood tracking helps build self-awareness'],
                'suggestions': ['Continue tracking your moods daily', 'Notice what triggers different emotions']
            }
        
    except Exception as e:
        logger.error(f"Error generating mood insights: {str(e)}")
        return {
            'insights': 'Thank you for tracking your moods. Your emotional awareness is growing.',
            'dominant_emotions': dominant_emotions if 'dominant_emotions' in locals() else [],
            'patterns': [],
            'suggestions': ['Keep tracking your moods regularly']
        }


# Endpoints
@router.post("/mood", response_model=MoodEntry)
@limiter.limit(get_rate_limit("emotion_log"))
async def log_mood(
    request: Request,
    mood_request: MoodLogRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Log a mood entry.
    """
    try:
        user_id = current_user['id']
        
        # Create mood entry
        mood_data = {
            'user_id': user_id,
            'label': mood_request.label,
            'intensity': mood_request.intensity,
            'source': 'feelflow',
            'encrypted_snippet': mood_request.snippet if mood_request.snippet else None
        }
        
        result = supabase.table('emotion_events').insert(mood_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to log mood")
        
        entry = result.data[0]
        
        logger.info(f"Mood logged for user {user_id}: {mood_request.label}")
        
        return MoodEntry(
            id=entry['id'],
            label=entry['label'],
            intensity=entry['intensity'],
            source=entry['source'],
            timestamp=entry['timestamp'],
            snippet=mood_request.snippet
        )
        
    except Exception as e:
        logger.error(f"Error logging mood: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log mood")


@router.get("/history", response_model=List[MoodEntry])
async def get_mood_history(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    days: int = 30,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Get mood history with optional date filtering.
    """
    try:
        user_id = current_user['id']
        
        query = supabase.table('emotion_events').select('*').eq('user_id', user_id)
        
        # Apply date filters
        if start_date:
            query = query.gte('timestamp', start_date)
        elif days:
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            query = query.gte('timestamp', cutoff_date)
        
        if end_date:
            query = query.lte('timestamp', end_date)
        
        result = query.order('timestamp', desc=True).execute()
        
        if not result.data:
            return []
        
        return [
            MoodEntry(
                id=entry['id'],
                label=entry['label'],
                intensity=entry['intensity'],
                source=entry.get('source', 'manual'),
                timestamp=entry['timestamp'],
                snippet=entry.get('encrypted_snippet')
            )
            for entry in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving mood history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve mood history")


@router.post("/insights", response_model=MoodInsightsResponse)
@limiter.limit(get_rate_limit("feelflow_insights"))
async def get_mood_insights(
    request: Request,
    insights_request: MoodInsightsRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get AI-generated insights from mood patterns.
    """
    try:
        user_id = current_user['id']
        days = insights_request.days
        
        # Get mood history
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table('emotion_events') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', cutoff_date) \
            .order('timestamp', desc=False) \
            .execute()
        
        moods = result.data if result.data else []
        
        # Generate insights
        insights_data = await generate_mood_insights(moods, days)
        
        logger.info(f"Generated mood insights for user {user_id} ({days} days)")
        
        return MoodInsightsResponse(**insights_data)
        
    except Exception as e:
        logger.error(f"Error generating mood insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")


@router.post("/export")
async def export_mood_history(
    export_request: ExportRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Export mood history as TXT or JSON.
    """
    try:
        user_id = current_user['id']
        days = export_request.days
        
        # Get mood history
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table('emotion_events') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', cutoff_date) \
            .order('timestamp', desc=False) \
            .execute()
        
        moods = result.data if result.data else []
        
        if not moods:
            raise HTTPException(status_code=404, detail="No mood data found")
        
        if export_request.format == 'json':
            # Return JSON
            return {
                'export_date': datetime.utcnow().isoformat(),
                'days': days,
                'total_entries': len(moods),
                'moods': [
                    {
                        'label': m['label'],
                        'intensity': m['intensity'],
                        'timestamp': m['timestamp'],
                        'source': m.get('source', 'manual')
                    }
                    for m in moods
                ]
            }
        else:
            # Generate TXT
            content = f"""MindMate Mood History Export
=====================================

Export Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
Period: Last {days} days
Total Entries: {len(moods)}

Mood Entries:
-------------

"""
            
            for mood in moods:
                timestamp = datetime.fromisoformat(mood['timestamp'].replace('Z', '+00:00'))
                content += f"{timestamp.strftime('%Y-%m-%d %H:%M')} - {mood['label'].capitalize()} (Intensity: {mood['intensity']}%)\n"
            
            return Response(
                content=content,
                media_type="text/plain",
                headers={
                    "Content-Disposition": f"attachment; filename=mood_history_{days}days.txt"
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting mood history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export mood history")


@router.delete("/{mood_id}")
async def delete_mood_entry(
    mood_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete a mood entry.
    """
    try:
        user_id = current_user['id']
        
        result = supabase.table('emotion_events') \
            .delete() \
            .eq('id', mood_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Mood entry not found")
        
        logger.info(f"Mood entry deleted: {mood_id}")
        
        return {"message": "Mood entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting mood entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete mood entry")
