from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import logging
import hashlib

from services.supabase_client import get_supabase
from services.encryption_service import get_encryption_service
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class JournalEntryCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    mood_tag: Optional[str] = None
    theme: str = Field(default="minimal", pattern="^(nature-forest|ocean|night|minimal|zen)$")


class JournalEntryUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=50000)
    mood_tag: Optional[str] = None
    theme: Optional[str] = Field(None, pattern="^(nature-forest|ocean|night|minimal|zen)$")


class JournalEntryResponse(BaseModel):
    id: str
    content: str  # Decrypted content
    mood_tag: Optional[str]
    theme: str
    timestamp: datetime


class PINSetRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]{4}$")


class PINValidateRequest(BaseModel):
    pin_hash: str


class JournalStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_entries: int
    entries_by_date: dict  # {date: count}


# Helper Functions
def hash_pin(pin: str) -> str:
    """Hash a PIN using SHA-256"""
    return hashlib.sha256(pin.encode()).hexdigest()


async def get_or_create_pin_record(supabase: Client, user_id: str) -> dict:
    """Get or create PIN record for user"""
    try:
        # Check if PIN record exists
        result = supabase.table('journal_pins').select('*').eq('user_id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        # Create new PIN record (no PIN set yet)
        new_record = {
            'user_id': user_id,
            'pin_hash': None
        }
        result = supabase.table('journal_pins').insert(new_record).execute()
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error getting/creating PIN record: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to access PIN record")


async def calculate_streaks(supabase: Client, user_id: str) -> dict:
    """Calculate journal writing streaks"""
    try:
        # Get all entries ordered by date
        entries = supabase.table('journal_entries') \
            .select('timestamp') \
            .eq('user_id', user_id) \
            .order('timestamp', desc=False) \
            .execute()
        
        if not entries.data:
            return {
                'current_streak': 0,
                'longest_streak': 0,
                'total_entries': 0,
                'entries_by_date': {}
            }
        
        # Group entries by date
        entries_by_date = {}
        for entry in entries.data:
            entry_date = datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00')).date()
            date_str = entry_date.isoformat()
            entries_by_date[date_str] = entries_by_date.get(date_str, 0) + 1
        
        # Calculate streaks
        dates = sorted([date.fromisoformat(d) for d in entries_by_date.keys()])
        
        current_streak = 0
        longest_streak = 0
        temp_streak = 1
        
        today = date.today()
        
        # Check if there's an entry today or yesterday for current streak
        if dates and (dates[-1] == today or dates[-1] == today.replace(day=today.day - 1)):
            current_streak = 1
            
            # Count backwards from most recent date
            for i in range(len(dates) - 2, -1, -1):
                if (dates[i + 1] - dates[i]).days == 1:
                    current_streak += 1
                else:
                    break
        
        # Calculate longest streak
        for i in range(1, len(dates)):
            if (dates[i] - dates[i - 1]).days == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak, current_streak)
        
        return {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_entries': len(entries.data),
            'entries_by_date': entries_by_date
        }
        
    except Exception as e:
        logger.error(f"Error calculating streaks: {str(e)}")
        return {
            'current_streak': 0,
            'longest_streak': 0,
            'total_entries': 0,
            'entries_by_date': {}
        }


# PIN Management Endpoints
@router.post("/set-pin")
async def set_journal_pin(
    pin_request: PINSetRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Set or update journal PIN"""
    try:
        user_id = current_user['id']
        pin_hash = hash_pin(pin_request.pin)
        
        # Check if PIN record exists
        existing = supabase.table('journal_pins').select('*').eq('user_id', user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing PIN
            supabase.table('journal_pins').update({'pin_hash': pin_hash}).eq('user_id', user_id).execute()
        else:
            # Create new PIN record
            supabase.table('journal_pins').insert({
                'user_id': user_id,
                'pin_hash': pin_hash
            }).execute()
        
        logger.info(f"PIN set for user: {user_id}")
        return {"message": "PIN set successfully"}
        
    except Exception as e:
        logger.error(f"Error setting PIN: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set PIN")


@router.post("/validate-pin")
async def validate_journal_pin(
    validate_request: PINValidateRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Validate journal PIN"""
    try:
        user_id = current_user['id']
        
        # Get stored PIN hash
        pin_record = supabase.table('journal_pins').select('pin_hash').eq('user_id', user_id).execute()
        
        if not pin_record.data or len(pin_record.data) == 0:
            # No PIN set yet
            return {"valid": True, "pin_set": False}
        
        stored_hash = pin_record.data[0].get('pin_hash')
        
        if not stored_hash:
            # PIN not set yet
            return {"valid": True, "pin_set": False}
        
        # Validate PIN
        is_valid = stored_hash == validate_request.pin_hash
        
        return {"valid": is_valid, "pin_set": True}
        
    except Exception as e:
        logger.error(f"Error validating PIN: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate PIN")


@router.get("/check-pin")
async def check_pin_status(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Check if user has set a PIN"""
    try:
        user_id = current_user['id']
        
        pin_record = supabase.table('journal_pins').select('pin_hash').eq('user_id', user_id).execute()
        
        has_pin = False
        if pin_record.data and len(pin_record.data) > 0:
            has_pin = pin_record.data[0].get('pin_hash') is not None
        
        return {"has_pin": has_pin}
        
    except Exception as e:
        logger.error(f"Error checking PIN status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check PIN status")


# Journal Entry Endpoints
@router.get("", response_model=List[JournalEntryResponse])
@limiter.limit(get_rate_limit("journal_read"))
async def get_journal_entries(
    request: Request,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service),
    limit: int = 50,
    offset: int = 0
):
    """Get all journal entries for user (decrypted)"""
    try:
        user_id = current_user['id']
        
        # Get entries
        entries = supabase.table('journal_entries') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('timestamp', desc=True) \
            .limit(limit) \
            .range(offset, offset + limit - 1) \
            .execute()
        
        if not entries.data:
            return []
        
        # Decrypt entries
        decrypted_entries = []
        for entry in entries.data:
            try:
                decrypted_content = encryption.decrypt(entry['encrypted_content'])
                decrypted_entries.append(JournalEntryResponse(
                    id=entry['id'],
                    content=decrypted_content,
                    mood_tag=entry.get('mood_tag'),
                    theme=entry.get('theme', 'minimal'),
                    timestamp=entry['timestamp']
                ))
            except Exception as e:
                logger.error(f"Error decrypting entry {entry['id']}: {str(e)}")
                continue
        
        return decrypted_entries
        
    except Exception as e:
        logger.error(f"Error retrieving journal entries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve journal entries")


@router.post("", response_model=JournalEntryResponse)
@limiter.limit(get_rate_limit("journal_create"))
async def create_journal_entry(
    request: Request,
    entry: JournalEntryCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service)
):
    """Create new journal entry (encrypted)"""
    try:
        user_id = current_user['id']
        
        # Encrypt content
        encrypted_content = encryption.encrypt(entry.content)
        
        # Create entry
        entry_data = {
            'user_id': user_id,
            'encrypted_content': encrypted_content,
            'mood_tag': entry.mood_tag,
            'theme': entry.theme
        }
        
        result = supabase.table('journal_entries').insert(entry_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create entry")
        
        created_entry = result.data[0]
        
        logger.info(f"Journal entry created for user: {user_id}")
        
        return JournalEntryResponse(
            id=created_entry['id'],
            content=entry.content,  # Return original content
            mood_tag=created_entry.get('mood_tag'),
            theme=created_entry.get('theme', 'minimal'),
            timestamp=created_entry['timestamp']
        )
        
    except Exception as e:
        logger.error(f"Error creating journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create journal entry")


@router.put("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    entry_update: JournalEntryUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service)
):
    """Update journal entry"""
    try:
        user_id = current_user['id']
        
        # Verify entry belongs to user
        existing = supabase.table('journal_entries') \
            .select('*') \
            .eq('id', entry_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        # Build update data
        update_data = {}
        
        if entry_update.content is not None:
            update_data['encrypted_content'] = encryption.encrypt(entry_update.content)
        
        if entry_update.mood_tag is not None:
            update_data['mood_tag'] = entry_update.mood_tag
        
        if entry_update.theme is not None:
            update_data['theme'] = entry_update.theme
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update entry
        result = supabase.table('journal_entries').update(update_data).eq('id', entry_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update entry")
        
        updated_entry = result.data[0]
        
        # Decrypt content for response
        decrypted_content = encryption.decrypt(updated_entry['encrypted_content'])
        
        logger.info(f"Journal entry updated: {entry_id}")
        
        return JournalEntryResponse(
            id=updated_entry['id'],
            content=decrypted_content,
            mood_tag=updated_entry.get('mood_tag'),
            theme=updated_entry.get('theme', 'minimal'),
            timestamp=updated_entry['timestamp']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update journal entry")


@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Delete journal entry"""
    try:
        user_id = current_user['id']
        
        # Verify entry belongs to user and delete
        result = supabase.table('journal_entries') \
            .delete() \
            .eq('id', entry_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        logger.info(f"Journal entry deleted: {entry_id}")
        
        return {"message": "Entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete journal entry")


@router.get("/streaks", response_model=JournalStreakResponse)
async def get_journal_streaks(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get journal writing streaks"""
    try:
        user_id = current_user['id']
        streaks = await calculate_streaks(supabase, user_id)
        
        return JournalStreakResponse(**streaks)
        
    except Exception as e:
        logger.error(f"Error getting journal streaks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get journal streaks")
