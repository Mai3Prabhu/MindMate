from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging

from services.supabase_client import get_supabase
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class ContentItem(BaseModel):
    id: str
    title: str
    url: str
    category: str
    type: str
    duration_min: Optional[int]
    description: Optional[str]
    created_at: datetime


class ContentProgressRequest(BaseModel):
    content_id: str = Field(..., min_length=1)
    action: str = Field(..., pattern="^(opened|completed)$")


class ContentProgress(BaseModel):
    id: str
    user_id: str
    content_id: str
    opened_at: datetime
    completed_at: Optional[datetime]


# Endpoints
@router.get("/library", response_model=List[ContentItem])
async def get_content_library(
    category: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = 50,
    supabase: Client = Depends(get_supabase)
):
    """
    Get curated content library items.
    
    Categories: mindfulness, emotional_wellness, cognitive_health, relationships, stress_management
    Types: article, video, podcast
    """
    try:
        query = supabase.table('content_items').select('*')
        
        if category:
            query = query.eq('category', category)
        
        if type:
            query = query.eq('type', type)
        
        result = query.order('created_at', desc=True).limit(limit).execute()
        
        if not result.data:
            return []
        
        logger.info(f"Content library retrieved: {len(result.data)} items")
        
        return [
            ContentItem(
                id=item['id'],
                title=item['title'],
                url=item['url'],
                category=item['category'],
                type=item['type'],
                duration_min=item.get('duration_min'),
                description=item.get('description'),
                created_at=item['created_at']
            )
            for item in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving content library: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve content library")


@router.get("/library/categories")
async def get_categories(
    supabase: Client = Depends(get_supabase)
):
    """
    Get available content categories with counts.
    """
    try:
        result = supabase.table('content_items').select('category').execute()
        
        if not result.data:
            return []
        
        # Count items per category
        categories = {}
        for item in result.data:
            cat = item['category']
            categories[cat] = categories.get(cat, 0) + 1
        
        return [
            {"category": cat, "count": count}
            for cat, count in sorted(categories.items())
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")


@router.post("/progress")
@limiter.limit(get_rate_limit("content_progress"))
async def track_content_progress(
    request: Request,
    progress_request: ContentProgressRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Track user progress on content items.
    
    Actions:
    - opened: Mark content as opened
    - completed: Mark content as completed
    """
    try:
        user_id = current_user['id']
        content_id = progress_request.content_id
        action = progress_request.action
        
        # Verify content exists
        content_result = supabase.table('content_items') \
            .select('id') \
            .eq('id', content_id) \
            .execute()
        
        if not content_result.data:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if action == 'opened':
            # Check if already opened
            existing = supabase.table('content_progress') \
                .select('id') \
                .eq('user_id', user_id) \
                .eq('content_id', content_id) \
                .execute()
            
            if existing.data:
                logger.info(f"Content already opened: {content_id}")
                return {"message": "Content already tracked"}
            
            # Insert new progress record
            progress_data = {
                'user_id': user_id,
                'content_id': content_id
            }
            
            result = supabase.table('content_progress').insert(progress_data).execute()
            
            if not result.data:
                raise HTTPException(status_code=500, detail="Failed to track progress")
            
            logger.info(f"Content opened: {content_id}")
            
            return {"message": "Content opened tracked"}
            
        elif action == 'completed':
            # Update existing record
            result = supabase.table('content_progress') \
                .update({'completed_at': datetime.utcnow().isoformat()}) \
                .eq('user_id', user_id) \
                .eq('content_id', content_id) \
                .execute()
            
            if not result.data:
                raise HTTPException(status_code=404, detail="Content progress not found")
            
            logger.info(f"Content completed: {content_id}")
            
            return {"message": "Content completion tracked"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking content progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track progress")


@router.get("/progress", response_model=List[ContentProgress])
async def get_user_progress(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    completed_only: bool = False
):
    """
    Get user's content progress.
    """
    try:
        user_id = current_user['id']
        
        query = supabase.table('content_progress') \
            .select('*') \
            .eq('user_id', user_id)
        
        if completed_only:
            query = query.not_.is_('completed_at', 'null')
        
        result = query.order('opened_at', desc=True).execute()
        
        if not result.data:
            return []
        
        return [
            ContentProgress(
                id=item['id'],
                user_id=item['user_id'],
                content_id=item['content_id'],
                opened_at=item['opened_at'],
                completed_at=item.get('completed_at')
            )
            for item in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving user progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve progress")


@router.delete("/progress/{content_id}")
async def delete_progress(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete user's progress for a content item.
    """
    try:
        user_id = current_user['id']
        
        result = supabase.table('content_progress') \
            .delete() \
            .eq('user_id', user_id) \
            .eq('content_id', content_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Progress not found")
        
        logger.info(f"Content progress deleted: {content_id}")
        
        return {"message": "Progress deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete progress")
