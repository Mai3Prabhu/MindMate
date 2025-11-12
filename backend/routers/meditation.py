from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.supabase_client import get_supabase
from datetime import datetime

router = APIRouter()

class MeditationSessionCreate(BaseModel):
    theme: str
    voice_type: str
    duration_minutes: int
    time_of_day: str
    before_calmness: Optional[int] = None
    after_calmness: Optional[int] = None

class MeditationSessionUpdate(BaseModel):
    after_calmness: int

@router.get("/sessions")
async def get_sessions(user_id: str = "current"):
    """Get all meditation sessions for a user"""
    try:
        supabase = get_supabase()
        # TODO: Extract real user_id from JWT token
        # For now using placeholder
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("meditation_sessions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .order("timestamp", desc=True)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions")
async def create_session(session: MeditationSessionCreate):
    """Create a new meditation session with mood tracking"""
    try:
        supabase = get_supabase()
        # TODO: Extract real user_id from JWT token
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        data = {
            "user_id": actual_user_id,
            "theme": session.theme,
            "duration_minutes": session.duration_minutes,
            "voice_type": session.voice_type,
            "time_of_day": session.time_of_day,
            "before_calmness": session.before_calmness,
            "after_calmness": session.after_calmness,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("meditation_sessions").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/sessions/{session_id}")
async def update_session(session_id: str, update: MeditationSessionUpdate):
    """Update session with after-meditation mood"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("meditation_sessions")\
            .update({"after_calmness": update.after_calmness})\
            .eq("id", session_id)\
            .execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_meditation_stats(user_id: str = "current", days: int = 30):
    """Get meditation statistics for dashboard"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get sessions from last N days
        result = supabase.table("meditation_sessions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .order("timestamp", desc=True)\
            .limit(100)\
            .execute()
        
        sessions = result.data
        
        if not sessions:
            return {
                "total_sessions": 0,
                "total_minutes": 0,
                "average_improvement": 0,
                "favorite_theme": None,
                "favorite_time": None
            }
        
        # Calculate stats
        total_sessions = len(sessions)
        total_minutes = sum(s["duration_minutes"] for s in sessions)
        
        improvements = [
            s["after_calmness"] - s["before_calmness"] 
            for s in sessions 
            if s.get("before_calmness") and s.get("after_calmness")
        ]
        average_improvement = sum(improvements) / len(improvements) if improvements else 0
        
        # Find favorite theme and time
        themes = [s["theme"] for s in sessions]
        favorite_theme = max(set(themes), key=themes.count) if themes else None
        
        times = [s["time_of_day"] for s in sessions]
        favorite_time = max(set(times), key=times.count) if times else None
        
        return {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "average_improvement": round(average_improvement, 2),
            "favorite_theme": favorite_theme,
            "favorite_time": favorite_time,
            "recent_sessions": sessions[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
