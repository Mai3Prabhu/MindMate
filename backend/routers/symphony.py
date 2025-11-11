from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import logging
from collections import defaultdict

from services.supabase_client import get_supabase
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class SymphonyPostRequest(BaseModel):
    emotion_label: str = Field(..., min_length=1, max_length=50)
    short_text: Optional[str] = Field(None, max_length=200)
    color_code: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class SymphonyPost(BaseModel):
    id: str
    emotion_label: str
    color_code: Optional[str]
    short_text: Optional[str]
    timestamp: datetime
    resonance_count: int = 0


class ResonateRequest(BaseModel):
    post_id: str = Field(..., min_length=1)


class GlobalMoodData(BaseModel):
    total_posts: int
    emotion_distribution: Dict[str, int]
    regional_moods: Dict[str, Dict[str, int]]
    recent_posts: List[SymphonyPost]
    dominant_emotion: Optional[str]
    mood_intensity: float


class RegionalMood(BaseModel):
    region: str
    dominant_emotion: str
    post_count: int
    intensity: float


# Helper Functions
def get_emotion_color(emotion_label: str) -> str:
    """
    Map emotion labels to color codes.
    
    Args:
        emotion_label: The emotion label
        
    Returns:
        Hex color code
    """
    emotion_colors = {
        'happy': '#FFD700',      # Gold
        'joyful': '#FFD700',
        'excited': '#FF6B6B',    # Coral
        'calm': '#87CEEB',       # Sky Blue
        'peaceful': '#87CEEB',
        'relaxed': '#98D8C8',    # Mint
        'sad': '#4A90E2',        # Blue
        'anxious': '#9B59B6',    # Purple
        'stressed': '#E74C3C',   # Red
        'angry': '#E74C3C',
        'frustrated': '#FF8C42', # Orange
        'bored': '#95A5A6',      # Gray
        'tired': '#7F8C8D',      # Dark Gray
        'energetic': '#F39C12',  # Yellow-Orange
        'focused': '#27AE60',    # Green
        'grateful': '#F1C40F',   # Yellow
        'hopeful': '#3498DB',    # Light Blue
        'lonely': '#34495E',     # Dark Blue-Gray
        'confused': '#9B7FFF',   # Lavender
        'neutral': '#BDC3C7',    # Light Gray
    }
    
    return emotion_colors.get(emotion_label.lower(), '#9B7FFF')  # Default to brand color


def extract_region_from_location(location: Optional[dict]) -> str:
    """
    Extract region from location data.
    For privacy, we use broad regions instead of specific locations.
    
    Args:
        location: Location dict with lat, lng, address
        
    Returns:
        Region identifier (e.g., 'north_america', 'europe', 'asia')
    """
    if not location or 'lat' not in location or 'lng' not in location:
        return 'unknown'
    
    lat = location['lat']
    lng = location['lng']
    
    # Simple region mapping based on coordinates
    # North America
    if 15 <= lat <= 72 and -168 <= lng <= -52:
        return 'north_america'
    # South America
    elif -56 <= lat <= 13 and -82 <= lng <= -34:
        return 'south_america'
    # Europe
    elif 36 <= lat <= 71 and -10 <= lng <= 40:
        return 'europe'
    # Africa
    elif -35 <= lat <= 37 and -18 <= lng <= 52:
        return 'africa'
    # Asia
    elif -10 <= lat <= 55 and 40 <= lng <= 150:
        return 'asia'
    # Oceania
    elif -47 <= lat <= -10 and 110 <= lng <= 180:
        return 'oceania'
    else:
        return 'other'


async def get_user_region(user_id: str, supabase: Client) -> str:
    """
    Get user's region from their profile.
    
    Args:
        user_id: User ID
        supabase: Supabase client
        
    Returns:
        Region identifier
    """
    try:
        result = supabase.table('profiles').select('location').eq('id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            location = result.data[0].get('location')
            return extract_region_from_location(location)
        
        return 'unknown'
        
    except Exception as e:
        logger.error(f"Error getting user region: {str(e)}")
        return 'unknown'


# Endpoints
@router.post("/post", response_model=SymphonyPost)
@limiter.limit(get_rate_limit("symphony_post"))
async def create_post(
    request: Request,
    post_request: SymphonyPostRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Submit an anonymous emotional contribution to Symphony.
    
    Note: While we store user_id for moderation purposes,
    the global feed displays all posts anonymously.
    """
    try:
        user_id = current_user['id']
        
        # Get user's region for aggregation
        region = await get_user_region(user_id, supabase)
        
        # Auto-assign color if not provided
        color_code = post_request.color_code or get_emotion_color(post_request.emotion_label)
        
        # Store post
        post_data = {
            'user_id': user_id,
            'emotion_label': post_request.emotion_label,
            'color_code': color_code,
            'short_text': post_request.short_text,
            'region': region
        }
        
        result = supabase.table('symphony_posts').insert(post_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create post")
        
        entry = result.data[0]
        
        logger.info(f"Symphony post created: {post_request.emotion_label} in {region}")
        
        return SymphonyPost(
            id=entry['id'],
            emotion_label=entry['emotion_label'],
            color_code=entry['color_code'],
            short_text=entry.get('short_text'),
            timestamp=entry['timestamp'],
            resonance_count=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Symphony post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create post")


@router.get("/global", response_model=GlobalMoodData)
async def get_global_mood(
    hours: int = 24,
    limit: int = 100,
    supabase: Client = Depends(get_supabase)
):
    """
    Get aggregated global mood data.
    
    Returns anonymous, aggregated emotional data from the community.
    Individual posts are anonymized - no user information is exposed.
    """
    try:
        # Calculate time cutoff
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        
        # Fetch recent posts
        result = supabase.table('symphony_posts') \
            .select('id, emotion_label, color_code, short_text, timestamp, region') \
            .gte('timestamp', cutoff_time) \
            .order('timestamp', desc=True) \
            .limit(limit) \
            .execute()
        
        posts = result.data if result.data else []
        
        if not posts:
            return GlobalMoodData(
                total_posts=0,
                emotion_distribution={},
                regional_moods={},
                recent_posts=[],
                dominant_emotion=None,
                mood_intensity=0.0
            )
        
        # Aggregate emotion distribution
        emotion_counts = defaultdict(int)
        regional_emotions = defaultdict(lambda: defaultdict(int))
        
        for post in posts:
            emotion = post['emotion_label']
            region = post.get('region', 'unknown')
            
            emotion_counts[emotion] += 1
            regional_emotions[region][emotion] += 1
        
        # Calculate dominant emotion
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else None
        
        # Calculate mood intensity (0-1 scale based on post frequency)
        # More posts = higher intensity
        mood_intensity = min(len(posts) / 100.0, 1.0)
        
        # Format recent posts (anonymized)
        recent_posts = [
            SymphonyPost(
                id=post['id'],
                emotion_label=post['emotion_label'],
                color_code=post['color_code'],
                short_text=post.get('short_text'),
                timestamp=post['timestamp'],
                resonance_count=post.get('resonance_count', 0)
            )
            for post in posts[:20]  # Return top 20 recent posts
        ]
        
        logger.info(f"Global mood data retrieved: {len(posts)} posts, dominant: {dominant_emotion}")
        
        return GlobalMoodData(
            total_posts=len(posts),
            emotion_distribution=dict(emotion_counts),
            regional_moods={k: dict(v) for k, v in regional_emotions.items()},
            recent_posts=recent_posts,
            dominant_emotion=dominant_emotion,
            mood_intensity=mood_intensity
        )
        
    except Exception as e:
        logger.error(f"Error getting global mood data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve global mood data")


@router.post("/resonate")
@limiter.limit(get_rate_limit("symphony_resonate"))
async def resonate_with_post(
    request: Request,
    resonate_request: ResonateRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    React/resonate with another user's post.
    
    This creates an anonymous connection between users who share similar feelings.
    """
    try:
        user_id = current_user['id']
        post_id = resonate_request.post_id
        
        # Check if post exists
        post_result = supabase.table('symphony_posts') \
            .select('id') \
            .eq('id', post_id) \
            .execute()
        
        if not post_result.data:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Check if user already resonated with this post
        existing = supabase.table('symphony_resonances') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('post_id', post_id) \
            .execute()
        
        if existing.data:
            # Already resonated - remove resonance (toggle)
            supabase.table('symphony_resonances') \
                .delete() \
                .eq('user_id', user_id) \
                .eq('post_id', post_id) \
                .execute()
            
            logger.info(f"Resonance removed: post {post_id}")
            
            return {
                "message": "Resonance removed",
                "resonated": False
            }
        else:
            # Add new resonance
            resonance_data = {
                'user_id': user_id,
                'post_id': post_id
            }
            
            supabase.table('symphony_resonances').insert(resonance_data).execute()
            
            logger.info(f"Resonance added: post {post_id}")
            
            return {
                "message": "Resonance added",
                "resonated": True
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing resonance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process resonance")


@router.get("/regions", response_model=List[RegionalMood])
async def get_regional_moods(
    hours: int = 24,
    supabase: Client = Depends(get_supabase)
):
    """
    Get mood aggregation by region.
    
    Returns dominant emotions and intensity for each geographic region.
    """
    try:
        # Calculate time cutoff
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        
        # Fetch posts with region data
        result = supabase.table('symphony_posts') \
            .select('emotion_label, region') \
            .gte('timestamp', cutoff_time) \
            .execute()
        
        posts = result.data if result.data else []
        
        if not posts:
            return []
        
        # Aggregate by region
        regional_data = defaultdict(lambda: defaultdict(int))
        
        for post in posts:
            region = post.get('region', 'unknown')
            emotion = post['emotion_label']
            regional_data[region][emotion] += 1
        
        # Format response
        regional_moods = []
        
        for region, emotions in regional_data.items():
            total_posts = sum(emotions.values())
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            
            # Calculate intensity (0-1 scale)
            intensity = min(total_posts / 50.0, 1.0)
            
            regional_moods.append(RegionalMood(
                region=region,
                dominant_emotion=dominant_emotion,
                post_count=total_posts,
                intensity=intensity
            ))
        
        # Sort by post count
        regional_moods.sort(key=lambda x: x.post_count, reverse=True)
        
        logger.info(f"Regional mood data retrieved: {len(regional_moods)} regions")
        
        return regional_moods
        
    except Exception as e:
        logger.error(f"Error getting regional moods: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve regional moods")


@router.delete("/post/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete a user's own Symphony post.
    """
    try:
        user_id = current_user['id']
        
        # Delete post (only if user owns it)
        result = supabase.table('symphony_posts') \
            .delete() \
            .eq('id', post_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Post not found or unauthorized")
        
        logger.info(f"Symphony post deleted: {post_id}")
        
        return {"message": "Post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete post")
