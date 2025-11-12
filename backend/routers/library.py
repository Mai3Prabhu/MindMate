from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from services.supabase_client import get_supabase
from datetime import datetime

router = APIRouter()

class ContentInteraction(BaseModel):
    content_id: str
    liked: Optional[bool] = None
    saved: Optional[bool] = None
    viewed: Optional[bool] = None
    completed: Optional[bool] = None

@router.get("/content")
async def get_content_items(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(50, le=100)
):
    """Get content library items with filters"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("content_items").select("*")
        
        if category and category != "All":
            query = query.eq("category", category)
        
        if type and type != "All":
            query = query.eq("type", type)
        
        if featured is not None:
            query = query.eq("featured", featured)
        
        query = query.order("created_at", desc=True).limit(limit)
        
        result = query.execute()
        items = result.data
        
        # Client-side search filtering (Supabase doesn't support full-text search in free tier)
        if search:
            search_lower = search.lower()
            items = [
                item for item in items
                if search_lower in item["title"].lower() or
                   search_lower in item["description"].lower() or
                   any(search_lower in tag.lower() for tag in item.get("tags", []))
            ]
        
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content/{content_id}")
async def get_content_item(content_id: str):
    """Get a single content item"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("content_items")\
            .select("*")\
            .eq("id", content_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Increment view count
        supabase.table("content_items")\
            .update({"view_count": result.data[0]["view_count"] + 1})\
            .eq("id", content_id)\
            .execute()
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interactions")
async def update_content_interaction(interaction: ContentInteraction, user_id: str = "current"):
    """Update user's interaction with content (like, save, view, complete)"""
    try:
        supabase = get_supabase()
        # TODO: Extract real user_id from JWT token
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Check if interaction exists
        existing = supabase.table("user_content_interactions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .eq("content_id", interaction.content_id)\
            .execute()
        
        data = {
            "user_id": actual_user_id,
            "content_id": interaction.content_id,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if interaction.liked is not None:
            data["liked"] = interaction.liked
        if interaction.saved is not None:
            data["saved"] = interaction.saved
        if interaction.viewed is not None:
            data["viewed"] = interaction.viewed
            if interaction.viewed:
                data["viewed_at"] = datetime.utcnow().isoformat()
        if interaction.completed is not None:
            data["completed"] = interaction.completed
        
        if existing.data:
            # Update existing
            result = supabase.table("user_content_interactions")\
                .update(data)\
                .eq("user_id", actual_user_id)\
                .eq("content_id", interaction.content_id)\
                .execute()
        else:
            # Create new
            result = supabase.table("user_content_interactions")\
                .insert(data)\
                .execute()
        
        # Update content item like count if liked
        if interaction.liked is not None:
            content = supabase.table("content_items")\
                .select("like_count")\
                .eq("id", interaction.content_id)\
                .execute()
            
            if content.data:
                new_count = content.data[0]["like_count"] + (1 if interaction.liked else -1)
                supabase.table("content_items")\
                    .update({"like_count": max(0, new_count)})\
                    .eq("id", interaction.content_id)\
                    .execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interactions")
async def get_user_interactions(user_id: str = "current"):
    """Get all user's content interactions"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("user_content_interactions")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/saved")
async def get_saved_content(user_id: str = "current"):
    """Get user's saved content items"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get saved content IDs
        interactions = supabase.table("user_content_interactions")\
            .select("content_id")\
            .eq("user_id", actual_user_id)\
            .eq("saved", True)\
            .execute()
        
        if not interactions.data:
            return []
        
        content_ids = [i["content_id"] for i in interactions.data]
        
        # Get content items
        result = supabase.table("content_items")\
            .select("*")\
            .in_("id", content_ids)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/featured")
async def get_featured_content(limit: int = 3):
    """Get featured content items"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("content_items")\
            .select("*")\
            .eq("featured", True)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
