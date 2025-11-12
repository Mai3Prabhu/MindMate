from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from services.supabase_client import get_supabase
import json

router = APIRouter()

class SymphonyPost(BaseModel):
    emotion_label: str
    short_text: Optional[str] = None

class ResonanceRequest(BaseModel):
    post_id: str

@router.get("/global")
async def get_global_mood(hours: int = 24, limit: int = 100):
    """Get global mood data and recent posts"""
    try:
        supabase = get_supabase()
        
        # Calculate time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        # Get recent posts
        posts_result = supabase.table("symphony_posts")\
            .select("*")\
            .gte("created_at", time_threshold.isoformat())\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        posts = posts_result.data
        
        # Calculate emotion distribution
        emotion_counts = {}
        total_posts = len(posts)
        
        for post in posts:
            emotion = post["emotion_label"]
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Find dominant emotion
        dominant_emotion = None
        if emotion_counts:
            dominant_emotion = max(emotion_counts, key=emotion_counts.get)
        
        # Calculate mood intensity (based on post frequency and variety)
        mood_intensity = 0.0
        if total_posts > 0:
            # Base intensity on post frequency (more posts = higher intensity)
            frequency_factor = min(total_posts / 50, 1.0)  # Cap at 50 posts
            
            # Variety factor (more emotions = higher intensity)
            variety_factor = len(emotion_counts) / 10  # Assuming max 10 emotions
            
            mood_intensity = (frequency_factor + variety_factor) / 2
            mood_intensity = min(mood_intensity, 1.0)
        
        # Format recent posts for response
        formatted_posts = []
        for post in posts[:50]:  # Limit to 50 most recent
            formatted_posts.append({
                "id": post["id"],
                "emotion_label": post["emotion_label"],
                "color_code": post.get("color_code"),
                "short_text": post.get("short_text"),
                "timestamp": post["created_at"],
                "resonance_count": post.get("resonance_count", 0)
            })
        
        return {
            "total_posts": total_posts,
            "emotion_distribution": emotion_counts,
            "regional_moods": {},  # Placeholder for future regional data
            "recent_posts": formatted_posts,
            "dominant_emotion": dominant_emotion,
            "mood_intensity": mood_intensity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/post")
async def submit_post(post: SymphonyPost, user_id: str = "current"):
    """Submit an anonymous emotional post"""
    try:
        supabase = get_supabase()
        # Note: Posts are anonymous, but we track user_id for rate limiting
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Color mapping for emotions
        emotion_colors = {
            "joy": "#FFD700",
            "sadness": "#4169E1", 
            "anger": "#DC143C",
            "fear": "#800080",
            "surprise": "#FF69B4",
            "disgust": "#228B22",
            "calm": "#87CEEB",
            "excited": "#FF4500",
            "anxious": "#9370DB",
            "content": "#32CD32",
            "lonely": "#708090",
            "grateful": "#FFB6C1",
            "hopeful": "#98FB98",
            "overwhelmed": "#B22222",
            "peaceful": "#E0E6FF"
        }
        
        data = {
            "user_id": actual_user_id,  # For rate limiting only
            "emotion_label": post.emotion_label,
            "short_text": post.short_text,
            "color_code": emotion_colors.get(post.emotion_label, "#888888"),
            "resonance_count": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("symphony_posts").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resonate")
async def resonate_with_post(resonance: ResonanceRequest, user_id: str = "current"):
    """Resonate with (like) a post"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Check if user already resonated with this post
        existing = supabase.table("symphony_resonances")\
            .select("id")\
            .eq("user_id", actual_user_id)\
            .eq("post_id", resonance.post_id)\
            .execute()
        
        if existing.data:
            # Already resonated, remove resonance
            supabase.table("symphony_resonances")\
                .delete()\
                .eq("user_id", actual_user_id)\
                .eq("post_id", resonance.post_id)\
                .execute()
            
            # Decrement resonance count
            supabase.rpc("decrement_resonance", {"post_id": resonance.post_id}).execute()
            
            return {"message": "Resonance removed"}
        else:
            # Add new resonance
            resonance_data = {
                "user_id": actual_user_id,
                "post_id": resonance.post_id,
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("symphony_resonances").insert(resonance_data).execute()
            
            # Increment resonance count
            supabase.rpc("increment_resonance", {"post_id": resonance.post_id}).execute()
            
            return {"message": "Resonance added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts")
async def get_recent_posts(limit: int = 50):
    """Get recent symphony posts"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("symphony_posts")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/emotions")
async def get_emotion_trends(hours: int = 24):
    """Get emotion trends over time"""
    try:
        supabase = get_supabase()
        
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        result = supabase.table("symphony_posts")\
            .select("emotion_label, created_at")\
            .gte("created_at", time_threshold.isoformat())\
            .order("created_at", desc=False)\
            .execute()
        
        # Group by hour
        hourly_emotions = {}
        for post in result.data:
            hour = post["created_at"][:13]  # YYYY-MM-DDTHH
            if hour not in hourly_emotions:
                hourly_emotions[hour] = {}
            
            emotion = post["emotion_label"]
            hourly_emotions[hour][emotion] = hourly_emotions[hour].get(emotion, 0) + 1
        
        return {
            "hourly_trends": hourly_emotions,
            "total_posts": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_symphony_stats():
    """Get overall symphony statistics"""
    try:
        supabase = get_supabase()
        
        # Get total posts
        total_result = supabase.table("symphony_posts")\
            .select("id", count="exact")\
            .execute()
        
        total_posts = total_result.count or 0
        
        # Get posts from last 24 hours
        yesterday = datetime.utcnow() - timedelta(hours=24)
        recent_result = supabase.table("symphony_posts")\
            .select("id", count="exact")\
            .gte("created_at", yesterday.isoformat())\
            .execute()
        
        recent_posts = recent_result.count or 0
        
        # Get most common emotions (all time)
        emotions_result = supabase.table("symphony_posts")\
            .select("emotion_label")\
            .execute()
        
        emotion_counts = {}
        for post in emotions_result.data:
            emotion = post["emotion_label"]
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Sort emotions by frequency
        top_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_posts": total_posts,
            "posts_24h": recent_posts,
            "top_emotions": dict(top_emotions),
            "active_now": recent_posts > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))