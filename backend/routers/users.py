from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from services.supabase_client import get_supabase
from middleware import get_current_user
import logging
import json
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, min_length=1, max_length=50)
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    place: Optional[str] = Field(None, max_length=100)
    location: Optional[dict] = None
    
    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 13 or v > 120):
            raise ValueError('Age must be between 13 and 120')
        return v

class ThemePreferences(BaseModel):
    theme: str = Field(..., pattern="^(light|dark|system)$")
    
class NotificationSettings(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    therapy_reminders: bool = True
    journal_reminders: bool = True
    wellness_tips: bool = True

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        supabase = get_supabase()
        result = supabase.table("profiles").select("*").eq("id", current_user['id']).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile with validation"""
    try:
        supabase = get_supabase()
        update_data = data.dict(exclude_none=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data provided for update")
        
        # Add updated_at timestamp
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table("profiles").update(update_data).eq("id", current_user['id']).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        logger.info(f"Profile updated for user: {current_user['id']}")
        return {"message": "Profile updated successfully", "data": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/settings/theme")
async def get_theme_preferences(current_user: dict = Depends(get_current_user)):
    """Get user theme preferences"""
    try:
        supabase = get_supabase()
        result = supabase.table("user_settings").select("theme").eq("user_id", current_user['id']).execute()
        
        if result.data and len(result.data) > 0:
            return {"theme": result.data[0].get('theme', 'system')}
        
        return {"theme": "system"}
    except Exception as e:
        logger.error(f"Error fetching theme preferences: {str(e)}")
        return {"theme": "system"}

@router.put("/settings/theme")
async def update_theme_preferences(
    preferences: ThemePreferences,
    current_user: dict = Depends(get_current_user)
):
    """Update user theme preferences"""
    try:
        supabase = get_supabase()
        
        # Upsert theme preference
        result = supabase.table("user_settings").upsert({
            "user_id": current_user['id'],
            "theme": preferences.theme,
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        logger.info(f"Theme updated for user: {current_user['id']} to {preferences.theme}")
        return {"message": "Theme preferences updated", "theme": preferences.theme}
    
    except Exception as e:
        logger.error(f"Error updating theme: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update theme preferences")

@router.get("/settings/notifications")
async def get_notification_settings(current_user: dict = Depends(get_current_user)):
    """Get user notification settings"""
    try:
        supabase = get_supabase()
        result = supabase.table("user_settings").select("notification_settings").eq("user_id", current_user['id']).execute()
        
        if result.data and len(result.data) > 0 and result.data[0].get('notification_settings'):
            return result.data[0]['notification_settings']
        
        # Return defaults
        return {
            "email_notifications": True,
            "push_notifications": True,
            "therapy_reminders": True,
            "journal_reminders": True,
            "wellness_tips": True
        }
    except Exception as e:
        logger.error(f"Error fetching notification settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notification settings")

@router.put("/settings/notifications")
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: dict = Depends(get_current_user)
):
    """Update user notification settings"""
    try:
        supabase = get_supabase()
        
        # Upsert notification settings
        result = supabase.table("user_settings").upsert({
            "user_id": current_user['id'],
            "notification_settings": settings.dict(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        logger.info(f"Notification settings updated for user: {current_user['id']}")
        return {"message": "Notification settings updated", "settings": settings.dict()}
    
    except Exception as e:
        logger.error(f"Error updating notification settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update notification settings")

@router.get("/data/export")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export all user data (GDPR compliance)"""
    try:
        supabase = get_supabase()
        user_id = current_user['id']
        
        # Collect all user data from various tables
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "profile": {},
            "therapy_sessions": [],
            "journal_entries": [],
            "emotion_events": [],
            "feelhear_sessions": [],
            "braingym_scores": [],
            "symphony_posts": [],
            "meditation_sessions": []
        }
        
        # Profile data
        profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if profile.data:
            export_data["profile"] = profile.data[0]
        
        # Therapy sessions (without encryption for export)
        therapy = supabase.table("therapy_sessions").select("*").eq("user_id", user_id).execute()
        if therapy.data:
            export_data["therapy_sessions"] = therapy.data
        
        # Journal entries (note: content is encrypted, user should decrypt separately)
        journal = supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()
        if journal.data:
            export_data["journal_entries"] = journal.data
        
        # Emotion events
        emotions = supabase.table("emotion_events").select("*").eq("user_id", user_id).execute()
        if emotions.data:
            export_data["emotion_events"] = emotions.data
        
        # FeelHear sessions
        feelhear = supabase.table("feelhear_sessions").select("*").eq("user_id", user_id).execute()
        if feelhear.data:
            export_data["feelhear_sessions"] = feelhear.data
        
        # Brain Gym scores
        braingym = supabase.table("braingym_scores").select("*").eq("user_id", user_id).execute()
        if braingym.data:
            export_data["braingym_scores"] = braingym.data
        
        # Symphony posts
        symphony = supabase.table("symphony_posts").select("*").eq("user_id", user_id).execute()
        if symphony.data:
            export_data["symphony_posts"] = symphony.data
        
        # Meditation sessions
        meditation = supabase.table("meditation_sessions").select("*").eq("user_id", user_id).execute()
        if meditation.data:
            export_data["meditation_sessions"] = meditation.data
        
        logger.info(f"Data export generated for user: {user_id}")
        return export_data
    
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export user data")

@router.delete("/account")
async def delete_account(
    current_user: dict = Depends(get_current_user),
    response: Response = None
):
    """Delete user account and all associated data"""
    try:
        supabase = get_supabase()
        user_id = current_user['id']
        
        # Delete all user data from various tables
        # Note: In production, consider soft delete or data retention policies
        
        # Delete therapy sessions and messages
        supabase.table("therapy_messages").delete().eq("session_id", 
            supabase.table("therapy_sessions").select("id").eq("user_id", user_id)
        ).execute()
        supabase.table("therapy_sessions").delete().eq("user_id", user_id).execute()
        
        # Delete journal entries
        supabase.table("journal_entries").delete().eq("user_id", user_id).execute()
        
        # Delete emotion events
        supabase.table("emotion_events").delete().eq("user_id", user_id).execute()
        
        # Delete FeelHear sessions
        supabase.table("feelhear_sessions").delete().eq("user_id", user_id).execute()
        
        # Delete Brain Gym scores
        supabase.table("braingym_scores").delete().eq("user_id", user_id).execute()
        
        # Delete Symphony posts
        supabase.table("symphony_posts").delete().eq("user_id", user_id).execute()
        
        # Delete meditation sessions
        supabase.table("meditation_sessions").delete().eq("user_id", user_id).execute()
        
        # Delete user settings
        supabase.table("user_settings").delete().eq("user_id", user_id).execute()
        
        # Delete profile
        supabase.table("profiles").delete().eq("id", user_id).execute()
        
        # Delete auth user (this will cascade delete in Supabase)
        # Note: This requires admin privileges
        try:
            supabase.auth.admin.delete_user(user_id)
        except Exception as auth_error:
            logger.warning(f"Could not delete auth user: {str(auth_error)}")
        
        logger.info(f"Account deleted for user: {user_id}")
        
        # Clear authentication cookie
        if response:
            response.delete_cookie("access_token")
        
        return {"message": "Account deleted successfully"}
    
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete account")
