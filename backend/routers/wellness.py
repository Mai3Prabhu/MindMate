from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
from services.supabase_client import get_supabase
from middleware import get_current_user
from supabase import Client

router = APIRouter()

# Pydantic Models
class BreathingSessionCreate(BaseModel):
    pattern: str
    duration_minutes: int
    before_calmness: int
    after_calmness: Optional[int] = None

class ActivityCreate(BaseModel):
    activity_type: str
    duration_minutes: int
    intensity: str
    calories: int

class GoalCreate(BaseModel):
    title: str
    target: int
    unit: str
    category: str

class GoalUpdate(BaseModel):
    current: int

# Breathing Sessions Endpoints
@router.post("/breath-sessions")
async def log_breathing_session(
    session: BreathingSessionCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a breathing exercise session"""
    try:
        user_id = current_user['id']
        
        data = {
            'user_id': user_id,
            'pattern': session.pattern,
            'duration_minutes': session.duration_minutes,
            'before_calmness': session.before_calmness,
            'after_calmness': session.after_calmness,
            'completed_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('breathing_sessions').insert(data).execute()
        
        # Update streak
        await update_breathing_streak(supabase, user_id)
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BreathingLogCreate(BaseModel):
    type: str
    duration_minutes: int
    cycles_completed: Optional[int] = None
    timestamp: str

@router.post("/breathing-log")
async def log_breathing_activity(
    session: BreathingLogCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a breathing activity (Box Breathing, etc.)"""
    try:
        user_id = current_user['id']
        
        data = {
            'user_id': user_id,
            'breathing_type': session.type,
            'duration_minutes': session.duration_minutes,
            'cycles_completed': session.cycles_completed,
            'completed_at': session.timestamp
        }
        
        result = supabase.table('breathing_logs').insert(data).execute()
        
        # Update breathing streak
        await update_breathing_streak(supabase, user_id)
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breath-sessions")
async def get_breathing_sessions(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's breathing sessions"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('breathing_sessions')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breathing-log")
async def get_breathing_logs(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's breathing activity logs"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('breathing_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breathing/stats")
async def get_breathing_stats(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get breathing statistics"""
    try:
        user_id = current_user['id']
        
        # Get all sessions
        sessions = supabase.table('breathing_sessions')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        total_sessions = len(sessions.data)
        total_minutes = sum(s['duration_minutes'] for s in sessions.data)
        
        # Calculate average improvement
        improvements = [
            s['after_calmness'] - s['before_calmness']
            for s in sessions.data
            if s.get('after_calmness') and s.get('before_calmness')
        ]
        avg_improvement = sum(improvements) / len(improvements) if improvements else 0
        
        # Get streak
        streak = supabase.table('wellness_streaks')\
            .select('breathing_streak')\
            .eq('user_id', user_id)\
            .execute()
        
        current_streak = streak.data[0]['breathing_streak'] if streak.data else 0
        
        return {
            'total_sessions': total_sessions,
            'total_minutes': total_minutes,
            'average_improvement': round(avg_improvement, 2),
            'current_streak': current_streak
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# MoveFlow Endpoints  
@router.post("/moveflow-log")
async def log_moveflow_activity(
    activity: ActivityCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a moveflow activity"""
    try:
        user_id = current_user['id']
        
        data = {
            'user_id': user_id,
            'activity_type': activity.activity_type,
            'duration_minutes': activity.duration_minutes,
            'intensity': activity.intensity,
            'calories': activity.calories,
            'completed_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('wellness_activities').insert(data).execute()
        
        # Update streak
        await update_activity_streak(supabase, user_id)
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/moveflow-log")
async def get_moveflow_activities(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's moveflow activities"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_activities')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Activity Endpoints (Legacy)
@router.post("/activity")
async def log_activity(
    activity: ActivityCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a physical activity"""
    try:
        user_id = current_user['id']
        
        data = {
            'user_id': user_id,
            'activity_type': activity.activity_type,
            'duration_minutes': activity.duration_minutes,
            'intensity': activity.intensity,
            'calories': activity.calories,
            'completed_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('wellness_activities').insert(data).execute()
        
        # Update streak
        await update_activity_streak(supabase, user_id)
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity/sessions")
async def get_activities(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's activities"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_activities')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity/stats")
async def get_activity_stats(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get activity statistics"""
    try:
        user_id = current_user['id']
        
        # Get today's activities
        today = date.today()
        activities = supabase.table('wellness_activities')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('completed_at', today.isoformat())\
            .execute()
        
        today_count = len(activities.data)
        today_calories = sum(a['calories'] for a in activities.data)
        today_minutes = sum(a['duration_minutes'] for a in activities.data)
        
        # Get streak
        streak = supabase.table('wellness_streaks')\
            .select('activity_streak')\
            .eq('user_id', user_id)\
            .execute()
        
        current_streak = streak.data[0]['activity_streak'] if streak.data else 0
        
        return {
            'today_activities': today_count,
            'today_minutes': today_minutes,
            'today_calories': today_calories,
            'current_streak': current_streak
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Meditation Endpoints
class MeditationLogCreate(BaseModel):
    duration_minutes: int
    before_calmness: int
    after_calmness: Optional[int] = None
    meditation_type: str = "general"

@router.post("/meditation-log")
async def log_meditation_session(
    session: MeditationLogCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a meditation session"""
    try:
        user_id = current_user['id']
        
        # Create meditation_sessions table entry if it doesn't exist
        data = {
            'user_id': user_id,
            'duration_minutes': session.duration_minutes,
            'before_calmness': session.before_calmness,
            'after_calmness': session.after_calmness,
            'meditation_type': session.meditation_type,
            'completed_at': datetime.utcnow().isoformat()
        }
        
        # Use breathing_sessions table for now, add meditation_type field
        result = supabase.table('breathing_sessions').insert({
            **data,
            'pattern': f"meditation_{session.meditation_type}"
        }).execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/meditation-log")
async def get_meditation_sessions(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's meditation sessions"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('breathing_sessions')\
            .select('*')\
            .eq('user_id', user_id)\
            .like('pattern', 'meditation_%')\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Journal Endpoints
class JournalPromptLogCreate(BaseModel):
    prompt: str
    response: str
    mood_before: Optional[int] = None
    mood_after: Optional[int] = None

@router.post("/journal-prompt-log")
async def log_journal_prompt(
    journal: JournalPromptLogCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Log a journal prompt response"""
    try:
        user_id = current_user['id']
        
        # Use wellness_activities table with activity_type = "journal"
        data = {
            'user_id': user_id,
            'activity_type': 'journal',
            'duration_minutes': 5,  # Default journal time
            'intensity': 'light',
            'calories': 0,
            'completed_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('wellness_activities').insert(data).execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal-prompt-log")
async def get_journal_prompts(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 10
):
    """Get user's journal entries"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_activities')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('activity_type', 'journal')\
            .order('completed_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Goals Endpoints
@router.post("/goals")
async def create_goal(
    goal: GoalCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a wellness goal"""
    try:
        user_id = current_user['id']
        
        data = {
            'user_id': user_id,
            'title': goal.title,
            'target': goal.target,
            'current': 0,
            'unit': goal.unit,
            'category': goal.category,
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('wellness_goals').insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goals")
async def get_goals(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get user's wellness goals"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_goals')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=False)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/goals/{goal_id}")
async def update_goal(
    goal_id: str,
    update: GoalUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Update goal progress"""
    try:
        result = supabase.table('wellness_goals')\
            .update({'current': update.current})\
            .eq('id', goal_id)\
            .execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Delete a goal"""
    try:
        supabase.table('wellness_goals')\
            .delete()\
            .eq('id', goal_id)\
            .execute()
        
        return {'message': 'Goal deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Badges Endpoint
@router.get("/badges")
async def get_badges(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get user's earned badges"""
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_badges')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Overall Stats
@router.get("/stats")
async def get_wellness_stats(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get overall wellness statistics"""
    try:
        user_id = current_user['id']
        
        # Get streaks
        streaks = supabase.table('wellness_streaks')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        streak_data = streaks.data[0] if streaks.data else {
            'breathing_streak': 0,
            'activity_streak': 0,
            'meditation_streak': 0,
            'journal_streak': 0
        }
        
        return {
            'streaks': streak_data,
            'total_wellness_score': calculate_wellness_score(streak_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Daily Tip
@router.get("/daily-tip")
async def get_daily_tip():
    """Get AI-generated daily wellness tip"""
    tips = [
        "Start your day with 3 minutes of mindful breathing. It helps reduce stress and improves focus.",
        "Take a 10-minute walk after lunch to boost energy and improve digestion.",
        "Practice gratitude by writing down 3 things you're thankful for today.",
        "Stretch for 5 minutes every hour to prevent muscle tension and improve circulation.",
        "Stay hydrated! Aim for 8 glasses of water throughout the day.",
        "Try a 5-minute meditation before bed for better sleep quality.",
        "Move your body! Even light exercise can boost your mood significantly.",
        "Take breaks from screens every 20 minutes to reduce eye strain.",
    ]
    
    # Return a random tip (in production, use AI to personalize)
    import random
    return {'tip': random.choice(tips)}

# Helper Functions
async def update_breathing_streak(supabase: Client, user_id: str):
    """Update breathing streak"""
    today = date.today()
    
    streak_result = supabase.table('wellness_streaks')\
        .select('*')\
        .eq('user_id', user_id)\
        .execute()
    
    if streak_result.data:
        streak = streak_result.data[0]
        last_date = streak.get('last_breathing_date')
        
        if last_date:
            last_date = datetime.fromisoformat(last_date).date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                current_streak = streak['breathing_streak']
            elif days_diff == 1:
                current_streak = streak['breathing_streak'] + 1
            else:
                current_streak = 1
        else:
            current_streak = 1
        
        supabase.table('wellness_streaks')\
            .update({
                'breathing_streak': current_streak,
                'last_breathing_date': today.isoformat()
            })\
            .eq('user_id', user_id)\
            .execute()
    else:
        supabase.table('wellness_streaks').insert({
            'user_id': user_id,
            'breathing_streak': 1,
            'last_breathing_date': today.isoformat()
        }).execute()

async def update_activity_streak(supabase: Client, user_id: str):
    """Update activity streak"""
    today = date.today()
    
    streak_result = supabase.table('wellness_streaks')\
        .select('*')\
        .eq('user_id', user_id)\
        .execute()
    
    if streak_result.data:
        streak = streak_result.data[0]
        last_date = streak.get('last_activity_date')
        
        if last_date:
            last_date = datetime.fromisoformat(last_date).date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                current_streak = streak['activity_streak']
            elif days_diff == 1:
                current_streak = streak['activity_streak'] + 1
            else:
                current_streak = 1
        else:
            current_streak = 1
        
        supabase.table('wellness_streaks')\
            .update({
                'activity_streak': current_streak,
                'last_activity_date': today.isoformat()
            })\
            .eq('user_id', user_id)\
            .execute()
    else:
        supabase.table('wellness_streaks').insert({
            'user_id': user_id,
            'activity_streak': 1,
            'last_activity_date': today.isoformat()
        }).execute()

def calculate_wellness_score(streak_data: dict) -> int:
    """Calculate overall wellness score based on streaks"""
    score = 0
    score += min(streak_data.get('breathing_streak', 0) * 5, 25)
    score += min(streak_data.get('activity_streak', 0) * 5, 25)
    score += min(streak_data.get('meditation_streak', 0) * 5, 25)
    score += min(streak_data.get('journal_streak', 0) * 5, 25)
    return score
