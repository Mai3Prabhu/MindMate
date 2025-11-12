from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from services.supabase_client import get_supabase

router = APIRouter()

class JournalEntryCreate(BaseModel):
    content: str
    mood_tag: Optional[str] = None
    theme: str = "minimal"

class JournalEntryUpdate(BaseModel):
    content: str
    mood_tag: Optional[str] = None
    theme: str = "minimal"

@router.get("/entries")
async def get_entries(user_id: str = "current", limit: int = 10):
    """Get user's journal entries"""
    try:
        supabase = get_supabase()
        # TODO: Extract real user_id from JWT token
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("journal_entries")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/entries")
async def create_entry(entry: JournalEntryCreate, user_id: str = "current"):
    """Create a new journal entry"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        data = {
            "user_id": actual_user_id,
            "content": entry.content,
            "mood_tag": entry.mood_tag,
            "theme": entry.theme,
            "word_count": len(entry.content.split()),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("journal_entries").insert(data).execute()
        
        # Update streak
        await update_journal_streak(actual_user_id)
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/entries/{entry_id}")
async def update_entry(entry_id: str, entry: JournalEntryUpdate):
    """Update a journal entry"""
    try:
        supabase = get_supabase()
        
        data = {
            "content": entry.content,
            "mood_tag": entry.mood_tag,
            "theme": entry.theme,
            "word_count": len(entry.content.split()),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("journal_entries")\
            .update(data)\
            .eq("id", entry_id)\
            .execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: str):
    """Delete a journal entry"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("journal_entries")\
            .delete()\
            .eq("id", entry_id)\
            .execute()
        
        return {"message": "Entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar")
async def get_calendar(year: int, month: int, user_id: str = "current"):
    """Get calendar data for a specific month"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get entries for the specified month
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        result = supabase.table("journal_entries")\
            .select("created_at, word_count, mood_tag")\
            .eq("user_id", actual_user_id)\
            .gte("created_at", start_date)\
            .lt("created_at", end_date)\
            .execute()
        
        # Group by date
        calendar_data = {}
        for entry in result.data:
            entry_date = entry["created_at"][:10]  # Extract YYYY-MM-DD
            if entry_date not in calendar_data:
                calendar_data[entry_date] = {
                    "date": entry_date,
                    "hasEntry": True,
                    "wordCount": 0,
                    "moodTag": None
                }
            calendar_data[entry_date]["wordCount"] += entry["word_count"]
            if entry["mood_tag"] and not calendar_data[entry_date]["moodTag"]:
                calendar_data[entry_date]["moodTag"] = entry["mood_tag"]
        
        return list(calendar_data.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/streak")
async def get_streak(user_id: str = "current"):
    """Get user's journal writing streak"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        result = supabase.table("journal_streaks")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        if result.data:
            streak_data = result.data[0]
            
            # Get this month's entries count
            today = date.today()
            month_start = today.replace(day=1)
            
            entries_result = supabase.table("journal_entries")\
                .select("id", count="exact")\
                .eq("user_id", actual_user_id)\
                .gte("created_at", month_start.isoformat())\
                .execute()
            
            this_month_entries = entries_result.count or 0
            
            return {
                "currentStreak": streak_data["current_streak"],
                "longestStreak": streak_data["longest_streak"],
                "totalEntries": streak_data["total_entries"],
                "thisMonthEntries": this_month_entries
            }
        else:
            # Create initial streak record
            initial_data = {
                "user_id": actual_user_id,
                "current_streak": 0,
                "longest_streak": 0,
                "total_entries": 0
            }
            create_result = supabase.table("journal_streaks").insert(initial_data).execute()
            
            return {
                "currentStreak": 0,
                "longestStreak": 0,
                "totalEntries": 0,
                "thisMonthEntries": 0
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_journal_streak(user_id: str):
    """Update journal writing streak after creating an entry"""
    try:
        supabase = get_supabase()
        
        # Get current streak
        streak_result = supabase.table("journal_streaks")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        today = date.today()
        
        if streak_result.data:
            streak = streak_result.data[0]
            last_date = streak.get("last_entry_date")
            
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
                "last_entry_date": today.isoformat(),
                "total_entries": streak["total_entries"] + 1,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("journal_streaks")\
                .update(update_data)\
                .eq("user_id", user_id)\
                .execute()
        else:
            # Create new streak
            initial_data = {
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_entry_date": today.isoformat(),
                "total_entries": 1
            }
            supabase.table("journal_streaks").insert(initial_data).execute()
            
    except Exception as e:
        print(f"Error updating journal streak: {e}")

@router.get("/stats")
async def get_journal_stats(user_id: str = "current", days: int = 30):
    """Get journal statistics"""
    try:
        supabase = get_supabase()
        actual_user_id = "00000000-0000-0000-0000-000000000000"
        
        # Get recent entries
        result = supabase.table("journal_entries")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .order("created_at", desc=True)\
            .limit(100)\
            .execute()
        
        entries = result.data
        
        # Get streak data
        streak_result = supabase.table("journal_streaks")\
            .select("*")\
            .eq("user_id", actual_user_id)\
            .execute()
        
        streak = streak_result.data[0] if streak_result.data else {}
        
        # Calculate stats
        total_entries = len(entries)
        total_words = sum(entry["word_count"] for entry in entries)
        avg_words = total_words / total_entries if total_entries > 0 else 0
        
        # Most common mood
        moods = [entry["mood_tag"] for entry in entries if entry.get("mood_tag")]
        most_common_mood = max(set(moods), key=moods.count) if moods else None
        
        return {
            "total_entries": total_entries,
            "total_words": total_words,
            "average_words": round(avg_words, 1),
            "current_streak": streak.get("current_streak", 0),
            "longest_streak": streak.get("longest_streak", 0),
            "most_common_mood": most_common_mood,
            "recent_entries": entries[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))