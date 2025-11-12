from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
from services.supabase_client import get_supabase

router = APIRouter()

class FocusSessionCreate(BaseModel):
    duration_minutes: int
    environment: str
    tree_stage: Optional[str] = None
    before_focus_level: Optional[int] = None

class FocusSessionComplete(BaseModel):
    after_focus_level: int
    tree_stage: str
    completed: bool = True

@router.post("/sessions")
async def create_focus_session(session: FocusSessionCreate, user_id: str = "current"):
    """Start a new focus session"""
    try:
        supabase = get_supabase()
        # TODO: Extract real user_id from JWT token
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        data = {
            "user_id": actual_user_id,
            "duration_minutes": session.duration_minutes,
            "environment": session.environment,
            "tree_stage": session.tree_stage,
            "before_focus_level": session.before_focus_level,
            "started_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("focus_sessions").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/sessions/{session_id}")
async def complete_focus_session(session_id: str, completion: FocusSessionComplete):
    """Complete a focus session"""
    try:
        supabase = get_supabase()
        
        data = {
            "completed": completion.completed,
            "after_focus_level": completion.after_focus_level,
            "tree_stage": completion.tree_stage,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("focus_sessions").update(data).eq("id", session_id).execute()
        
        # Update streak if completed
        if completion.completed:
            await update_focus_streak("current")
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_focus_sessions(user_id: str = "current", limit: int = 10):
    """Get user's focus sessions"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("focus_sessions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .order("started_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/streak")
async def get_focus_streak(user_id: str = "current"):
    """Get user's focus streak"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("focus_streaks")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        if result.data:
            return result.data[0]
        else:
            # Create initial streak record
            initial_data = {
                "user_id": actual_user_id,
                "current_streak": 0,
                "longest_streak": 0,
                "total_sessions": 0,
                "total_minutes": 0
            }
            create_result = supabase.table("focus_streaks").insert(initial_data).execute()
            return create_result.data[0] if create_result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_focus_streak(user_id: str):
    """Update focus streak after completing a session"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get current streak
        streak_result = supabase.table("focus_streaks")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        today = date.today()
        
        if streak_result.data:
            streak = streak_result.data[0]
            last_date = streak.get("last_session_date")
            
            if last_date:
                last_date = datetime.fromisoformat(last_date).date()
                days_diff = (today - last_date).days
                
                if days_diff == 0:
                    # Same day, no streak change
                    current_streak = streak["current_streak"]
                elif days_diff == 1:
                    # Consecutive day, increment streak
                    current_streak = streak["current_streak"] + 1
                else:
                    # Streak broken, reset to 1
                    current_streak = 1
            else:
                current_streak = 1
            
            longest_streak = max(streak["longest_streak"], current_streak)
            
            update_data = {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_session_date": today.isoformat(),
                "total_sessions": streak["total_sessions"] + 1,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("focus_streaks")\
                .update(update_data)\
                .eq("user_id", actual_user_id)\
                .execute()
        else:
            # Create new streak
            initial_data = {
                "user_id": actual_user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_session_date": today.isoformat(),
                "total_sessions": 1,
                "total_minutes": 0
            }
            supabase.table("focus_streaks").insert(initial_data).execute()
            
    except Exception as e:
        print(f"Error updating streak: {e}")

@router.get("/stats")
async def get_focus_stats(user_id: str = "current"):
    """Get focus statistics"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get sessions
        sessions_result = supabase.table("focus_sessions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .eq("completed", True)\
            .execute()
        
        sessions = sessions_result.data
        
        # Get streak
        streak_result = supabase.table("focus_streaks")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        streak = streak_result.data[0] if streak_result.data else {}
        
        # Calculate stats
        total_sessions = len(sessions)
        total_minutes = sum(s["duration_minutes"] for s in sessions)
        avg_duration = total_minutes / total_sessions if total_sessions > 0 else 0
        
        return {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "average_duration": round(avg_duration, 1),
            "current_streak": streak.get("current_streak", 0),
            "longest_streak": streak.get("longest_streak", 0),
            "recent_sessions": sessions[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
