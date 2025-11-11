from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, date, timedelta
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
class DigitalWellnessMetrics(BaseModel):
    id: str
    user_id: str
    daily_screen_minutes: int
    app_usage_json: Dict[str, int]
    detections: List[str]
    date: date
    timestamp: datetime


class MetricsSubmitRequest(BaseModel):
    daily_screen_minutes: int = Field(..., ge=0, le=1440)  # Max 24 hours
    app_usage_json: Dict[str, int] = Field(..., description="App name to minutes mapping")


class BehaviorAnalysisRequest(BaseModel):
    days: int = Field(7, ge=1, le=30)


class BehaviorAnalysis(BaseModel):
    summary: str
    detections: List[str]
    recommendations: List[str]
    screen_time_trend: str
    risk_level: str


class WellnessPlan(BaseModel):
    id: str
    user_id: str
    meditation_streak: int
    journal_streak: int
    breath_streak: int
    movement_streak: int
    last_meditation: Optional[date]
    last_journal: Optional[date]
    last_breath: Optional[date]
    last_movement: Optional[date]
    updated_at: datetime


class WellnessPlanUpdate(BaseModel):
    meditation_goal: Optional[int] = Field(None, ge=0, le=60)
    journal_goal: Optional[int] = Field(None, ge=0, le=60)
    breath_goal: Optional[int] = Field(None, ge=0, le=60)
    movement_goal: Optional[int] = Field(None, ge=0, le=120)


# Helper Functions
async def detect_unhealthy_patterns(metrics: List[Dict]) -> List[str]:
    """
    Detect unhealthy digital behavior patterns.
    
    Args:
        metrics: List of daily metrics
        
    Returns:
        List of detected patterns
    """
    detections = []
    
    if not metrics:
        return detections
    
    # Calculate averages
    avg_screen_time = sum(m['daily_screen_minutes'] for m in metrics) / len(metrics)
    
    # Detection rules
    if avg_screen_time > 480:  # More than 8 hours/day
        detections.append('excessive_screen_time')
    
    # Check for increasing trend
    if len(metrics) >= 3:
        recent = metrics[:3]
        older = metrics[3:6] if len(metrics) >= 6 else metrics[3:]
        
        if older:
            recent_avg = sum(m['daily_screen_minutes'] for m in recent) / len(recent)
            older_avg = sum(m['daily_screen_minutes'] for m in older) / len(older)
            
            if recent_avg > older_avg * 1.2:  # 20% increase
                detections.append('increasing_usage')
    
    # Check for late-night usage (if we had timestamp data)
    # This would require more detailed tracking
    
    # Check for app-specific patterns
    for metric in metrics:
        app_usage = metric.get('app_usage_json', {})
        
        # Social media doomscrolling
        social_apps = ['facebook', 'instagram', 'twitter', 'tiktok', 'reddit']
        social_time = sum(app_usage.get(app, 0) for app in social_apps)
        
        if social_time > 180:  # More than 3 hours on social media
            if 'doomscrolling' not in detections:
                detections.append('doomscrolling')
        
        # Video binge watching
        video_apps = ['youtube', 'netflix', 'hulu', 'disney+', 'prime video']
        video_time = sum(app_usage.get(app.lower(), 0) for app in video_apps)
        
        if video_time > 240:  # More than 4 hours
            if 'binge_watching' not in detections:
                detections.append('binge_watching')
    
    return detections


async def generate_behavior_analysis(metrics: List[Dict]) -> BehaviorAnalysis:
    """
    Generate AI-powered behavior analysis using Gemini.
    
    Args:
        metrics: List of daily metrics
        
    Returns:
        Behavior analysis with recommendations
    """
    try:
        if not metrics:
            return BehaviorAnalysis(
                summary="No data available for analysis.",
                detections=[],
                recommendations=["Start tracking your digital wellness to get insights."],
                screen_time_trend="unknown",
                risk_level="low"
            )
        
        # Detect patterns
        detections = await detect_unhealthy_patterns(metrics)
        
        # Calculate statistics
        avg_screen_time = sum(m['daily_screen_minutes'] for m in metrics) / len(metrics)
        total_days = len(metrics)
        
        # Determine trend
        if len(metrics) >= 2:
            recent_avg = sum(m['daily_screen_minutes'] for m in metrics[:3]) / min(3, len(metrics))
            older_avg = sum(m['daily_screen_minutes'] for m in metrics[3:]) / max(1, len(metrics) - 3)
            
            if recent_avg > older_avg * 1.1:
                trend = "increasing"
            elif recent_avg < older_avg * 0.9:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        # Determine risk level
        if avg_screen_time > 480 or 'excessive_screen_time' in detections:
            risk_level = "high"
        elif avg_screen_time > 360 or len(detections) > 0:
            risk_level = "moderate"
        else:
            risk_level = "low"
        
        # Generate AI summary and recommendations
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        
        prompt = f"""Analyze this digital wellness data and provide insights.

Data Summary:
- Days tracked: {total_days}
- Average daily screen time: {avg_screen_time:.0f} minutes ({avg_screen_time/60:.1f} hours)
- Trend: {trend}
- Detected patterns: {', '.join(detections) if detections else 'None'}
- Risk level: {risk_level}

Provide:
1. A brief 2-sentence summary of their digital wellness
2. 3 specific, actionable recommendations to improve their digital health

Keep the tone supportive and non-judgmental. Focus on positive changes.

Format as JSON:
{{
  "summary": "2-sentence summary",
  "recommendations": ["rec1", "rec2", "rec3"]
}}"""
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Parse JSON response
        # Remove markdown code blocks if present
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        result = json.loads(result_text)
        
        return BehaviorAnalysis(
            summary=result.get('summary', 'Analysis complete.'),
            detections=detections,
            recommendations=result.get('recommendations', []),
            screen_time_trend=trend,
            risk_level=risk_level
        )
        
    except Exception as e:
        logger.error(f"Error generating behavior analysis: {str(e)}")
        
        # Fallback analysis
        return BehaviorAnalysis(
            summary=f"You've averaged {avg_screen_time/60:.1f} hours of screen time per day. Consider setting boundaries for healthier digital habits.",
            detections=detections,
            recommendations=[
                "Set specific times for checking social media",
                "Use app timers to limit usage",
                "Take regular breaks from screens"
            ],
            screen_time_trend=trend,
            risk_level=risk_level
        )


# Endpoints
@router.get("/metrics", response_model=List[DigitalWellnessMetrics])
async def get_wellness_metrics(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    days: int = 7
):
    """
    Get user's digital wellness metrics.
    """
    try:
        user_id = current_user['id']
        
        result = supabase.table('digital_wellness') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('date', desc=True) \
            .limit(days) \
            .execute()
        
        if not result.data:
            return []
        
        return [
            DigitalWellnessMetrics(
                id=item['id'],
                user_id=item['user_id'],
                daily_screen_minutes=item['daily_screen_minutes'],
                app_usage_json=item.get('app_usage_json', {}),
                detections=item.get('detections', []),
                date=item['date'],
                timestamp=item['timestamp']
            )
            for item in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving wellness metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


@router.post("/metrics")
@limiter.limit(get_rate_limit("wellness_metrics"))
async def submit_wellness_metrics(
    request: Request,
    metrics_request: MetricsSubmitRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Submit daily digital wellness metrics.
    """
    try:
        user_id = current_user['id']
        today = date.today()
        
        # Check if metrics already exist for today
        existing = supabase.table('digital_wellness') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('date', today.isoformat()) \
            .execute()
        
        metrics_data = {
            'user_id': user_id,
            'daily_screen_minutes': metrics_request.daily_screen_minutes,
            'app_usage_json': metrics_request.app_usage_json,
            'date': today.isoformat(),
            'detections': []
        }
        
        if existing.data:
            # Update existing record
            result = supabase.table('digital_wellness') \
                .update(metrics_data) \
                .eq('id', existing.data[0]['id']) \
                .execute()
        else:
            # Insert new record
            result = supabase.table('digital_wellness') \
                .insert(metrics_data) \
                .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save metrics")
        
        logger.info(f"Wellness metrics saved: {metrics_request.daily_screen_minutes} minutes")
        
        return {"message": "Metrics saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting wellness metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit metrics")


@router.post("/analyze", response_model=BehaviorAnalysis)
@limiter.limit(get_rate_limit("wellness_analyze"))
async def analyze_digital_behavior(
    request: Request,
    analysis_request: BehaviorAnalysisRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Analyze digital behavior patterns using Gemini AI.
    """
    try:
        user_id = current_user['id']
        days = analysis_request.days
        
        # Fetch metrics
        result = supabase.table('digital_wellness') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('date', desc=True) \
            .limit(days) \
            .execute()
        
        metrics = result.data if result.data else []
        
        # Generate analysis
        analysis = await generate_behavior_analysis(metrics)
        
        logger.info(f"Behavior analysis generated for {days} days")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing behavior: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze behavior")


@router.get("/plan", response_model=WellnessPlan)
async def get_wellness_plan(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get user's wellness plan and streak data.
    """
    try:
        user_id = current_user['id']
        
        result = supabase.table('wellness_plan') \
            .select('*') \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            # Create default plan
            default_plan = {
                'user_id': user_id,
                'meditation_streak': 0,
                'journal_streak': 0,
                'breath_streak': 0,
                'movement_streak': 0
            }
            
            create_result = supabase.table('wellness_plan') \
                .insert(default_plan) \
                .execute()
            
            if not create_result.data:
                raise HTTPException(status_code=500, detail="Failed to create wellness plan")
            
            plan_data = create_result.data[0]
        else:
            plan_data = result.data[0]
        
        return WellnessPlan(
            id=plan_data['id'],
            user_id=plan_data['user_id'],
            meditation_streak=plan_data.get('meditation_streak', 0),
            journal_streak=plan_data.get('journal_streak', 0),
            breath_streak=plan_data.get('breath_streak', 0),
            movement_streak=plan_data.get('movement_streak', 0),
            last_meditation=plan_data.get('last_meditation'),
            last_journal=plan_data.get('last_journal'),
            last_breath=plan_data.get('last_breath'),
            last_movement=plan_data.get('last_movement'),
            updated_at=plan_data['updated_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving wellness plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve wellness plan")


@router.put("/plan")
@limiter.limit(get_rate_limit("wellness_plan"))
async def update_wellness_plan(
    request: Request,
    plan_update: WellnessPlanUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update user's wellness plan goals.
    
    Note: This endpoint updates goals, not streaks.
    Streaks are automatically updated when activities are completed.
    """
    try:
        user_id = current_user['id']
        
        # Get existing plan
        result = supabase.table('wellness_plan') \
            .select('id') \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Wellness plan not found")
        
        plan_id = result.data[0]['id']
        
        # Build update data (only include provided fields)
        update_data = {}
        if plan_update.meditation_goal is not None:
            update_data['meditation_goal'] = plan_update.meditation_goal
        if plan_update.journal_goal is not None:
            update_data['journal_goal'] = plan_update.journal_goal
        if plan_update.breath_goal is not None:
            update_data['breath_goal'] = plan_update.breath_goal
        if plan_update.movement_goal is not None:
            update_data['movement_goal'] = plan_update.movement_goal
        
        if not update_data:
            return {"message": "No updates provided"}
        
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Update plan
        update_result = supabase.table('wellness_plan') \
            .update(update_data) \
            .eq('id', plan_id) \
            .execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update wellness plan")
        
        logger.info(f"Wellness plan updated: {list(update_data.keys())}")
        
        return {"message": "Wellness plan updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating wellness plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update wellness plan")


class WellnessActivityRequest(BaseModel):
    activity_type: str = Field(..., pattern="^(meditation|journal|breath|movement)$")


@router.post("/plan/activity")
@limiter.limit(get_rate_limit("wellness_activity"))
async def log_wellness_activity(
    request: Request,
    activity_request: WellnessActivityRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Log a wellness activity and update streaks.
    
    Activity types: meditation, journal, breath, movement
    """
    try:
        user_id = current_user['id']
        activity_type = activity_request.activity_type
        today = date.today()
        
        # Get current plan
        result = supabase.table('wellness_plan') \
            .select('*') \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Wellness plan not found")
        
        plan = result.data[0]
        
        # Check last activity date
        last_date_field = f'last_{activity_type}'
        streak_field = f'{activity_type}_streak'
        
        last_date = plan.get(last_date_field)
        current_streak = plan.get(streak_field, 0)
        
        # Calculate new streak
        if last_date:
            last_date_obj = datetime.fromisoformat(str(last_date)).date()
            days_diff = (today - last_date_obj).days
            
            if days_diff == 0:
                # Already logged today
                return {"message": "Activity already logged today", "streak": current_streak}
            elif days_diff == 1:
                # Consecutive day - increment streak
                new_streak = current_streak + 1
            else:
                # Streak broken - reset to 1
                new_streak = 1
        else:
            # First time logging
            new_streak = 1
        
        # Update plan
        update_data = {
            last_date_field: today.isoformat(),
            streak_field: new_streak,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        update_result = supabase.table('wellness_plan') \
            .update(update_data) \
            .eq('user_id', user_id) \
            .execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update activity")
        
        logger.info(f"Wellness activity logged: {activity_type}, streak: {new_streak}")
        
        return {
            "message": "Activity logged successfully",
            "activity": activity_type,
            "streak": new_streak
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging wellness activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log activity")
