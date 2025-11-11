from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging
from io import BytesIO

from services.supabase_client import get_supabase
from services.gemini_service import get_gemini_service, PromptType
from services.encryption_service import get_encryption_service
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class TherapyChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=2000)
    mode: str = Field(default="conversational", pattern="^(gentle|conversational|silent)$")


class TherapyChatResponse(BaseModel):
    session_id: str
    response: str
    topics: List[str]
    crisis_detected: bool = False
    crisis_message: Optional[str] = None


class TherapySessionResponse(BaseModel):
    id: str
    mode: str
    started_at: datetime
    ended_at: Optional[datetime]
    topics: List[str]
    feeling_rating: Optional[int]
    key_insights: Optional[str]
    message_count: int


class SessionCloseRequest(BaseModel):
    session_id: str
    feeling_rating: Optional[int] = Field(None, ge=1, le=10)


class ExportRequest(BaseModel):
    session_id: str
    format: str = Field(..., pattern="^(txt|pdf)$")


# Helper Functions
async def get_session_context(supabase: Client, user_id: str, limit: int = 5) -> List[dict]:
    """
    Retrieve previous session context for AI memory.
    
    Args:
        supabase: Supabase client
        user_id: User ID
        limit: Number of previous sessions to retrieve
        
    Returns:
        List of session summaries with key insights and topics
    """
    try:
        # Get last N completed sessions
        sessions = supabase.table('therapy_sessions') \
            .select('id, started_at, topics, key_insights') \
            .eq('user_id', user_id) \
            .not_.is_('ended_at', 'null') \
            .order('started_at', desc=True) \
            .limit(limit) \
            .execute()
        
        return sessions.data if sessions.data else []
    except Exception as e:
        logger.error(f"Error retrieving session context: {str(e)}")
        return []


async def get_conversation_history(supabase: Client, session_id: str, encryption) -> List[dict]:
    """
    Retrieve and decrypt conversation history for a session.
    
    Args:
        supabase: Supabase client
        session_id: Session ID
        encryption: Encryption service
        
    Returns:
        List of decrypted messages
    """
    try:
        messages = supabase.table('therapy_messages') \
            .select('*') \
            .eq('session_id', session_id) \
            .order('timestamp', desc=False) \
            .execute()
        
        if not messages.data:
            return []
        
        # Decrypt messages
        decrypted_messages = []
        for msg in messages.data:
            try:
                decrypted_text = encryption.decrypt(msg['encrypted_text'])
                decrypted_messages.append({
                    'role': msg['sender'],
                    'content': decrypted_text,
                    'timestamp': msg['timestamp']
                })
            except Exception as e:
                logger.error(f"Error decrypting message: {str(e)}")
                continue
        
        return decrypted_messages
    except Exception as e:
        logger.error(f"Error retrieving conversation history: {str(e)}")
        return []


async def generate_session_reflection(supabase: Client, session_id: str, encryption) -> str:
    """
    Generate AI reflection for a completed session.
    
    Args:
        supabase: Supabase client
        session_id: Session ID
        encryption: Encryption service
        
    Returns:
        AI-generated reflection text
    """
    try:
        # Get conversation history
        messages = await get_conversation_history(supabase, session_id, encryption)
        
        if not messages:
            return "Session completed."
        
        # Build conversation summary
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}" for msg in messages
        ])
        
        # Generate reflection using Gemini
        prompt = f"""Summarize this therapy session with:
1. Key themes discussed (2-3 topics)
2. Emotional journey (1 sentence)
3. Suggested follow-up topics (1-2 items)

Keep it warm, supportive, and under 100 words.

Conversation:
{conversation_text}

Reflection:"""
        
        import google.generativeai as genai
        from config import get_settings
        
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Error generating session reflection: {str(e)}")
        return "Session completed. Thank you for sharing."


# Endpoints
@router.post("/chat", response_model=TherapyChatResponse)
@limiter.limit(get_rate_limit("therapy_chat"))
async def therapy_chat(
    request: Request,
    chat_request: TherapyChatRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service)
):
    """
    Send a message in therapy session and get AI response.
    Creates new session if session_id is not provided.
    """
    try:
        logger.info(f"Therapy chat request received")
        user_id = current_user['id']
        logger.info(f"User ID: {user_id}")
        
        # Check for crisis indicators (simple keyword check)
        crisis_keywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself']
        crisis_detected = any(keyword in chat_request.message.lower() for keyword in crisis_keywords)
        crisis_message = None
        
        if crisis_detected:
            crisis_message = "I'm concerned about what you've shared. Please reach out to a crisis helpline immediately. National Suicide Prevention Lifeline: 988 (US)"
        
        # Create or get session
        if not chat_request.session_id:
            logger.info("Creating new therapy session")
            # Create new session
            session_data = {
                'user_id': user_id,
                'mode': chat_request.mode,
                'topics': [],
            }
            try:
                session_result = supabase.table('therapy_sessions').insert(session_data).execute()
                session_id = session_result.data[0]['id']
                logger.info(f"Created new therapy session: {session_id}")
            except Exception as e:
                logger.error(f"Failed to create session: {str(e)}")
                raise
        else:
            session_id = chat_request.session_id
            logger.info(f"Using existing session: {session_id}")
        
        # Encrypt and store user message
        logger.info("Encrypting user message")
        try:
            encrypted_message = encryption.encrypt(chat_request.message)
            user_message_data = {
                'session_id': session_id,
                'sender': 'user',
                'encrypted_text': encrypted_message,
            }
            supabase.table('therapy_messages').insert(user_message_data).execute()
            logger.info("User message stored")
        except Exception as e:
            logger.error(f"Failed to store user message: {str(e)}")
            raise
        
        # Get conversation history
        conversation_history = await get_conversation_history(supabase, session_id, encryption)
        
        # Get previous session context for AI memory
        session_context = await get_session_context(supabase, user_id, limit=5)
        
        # Build context for AI
        user_context = {
            'previous_sessions': session_context,
            'mode': chat_request.mode
        }
        
        # Generate AI response using GeminiService
        logger.info("Generating AI response")
        try:
            gemini_service = get_gemini_service()
            
            # Build context for therapy response
            therapy_context = {
                'message': chat_request.message,
                'context': f"Previous conversation: {conversation_history[-3:] if conversation_history else 'First message'}"
            }
            
            ai_response = await gemini_service.generate_response(
                prompt_type=PromptType.THERAPY_RESPONSE,
                context=therapy_context,
                user_id=user_id
            )
            logger.info("AI response generated successfully")
        except Exception as e:
            logger.error(f"Gemini service error: {str(e)}", exc_info=True)
            # Fallback response if AI fails
            ai_response = "I hear you. It's important to acknowledge what you're feeling. Take a moment to breathe and know that it's okay to feel this way. How can I support you further?"
            logger.info("Using fallback response")
        
        # Encrypt and store AI response
        encrypted_response = encryption.encrypt(ai_response)
        ai_message_data = {
            'session_id': session_id,
            'sender': 'therapist',
            'encrypted_text': encrypted_response,
        }
        supabase.table('therapy_messages').insert(ai_message_data).execute()
        
        # Extract topics (simple keyword extraction)
        # In production, use more sophisticated NLP
        topics = []
        keywords = ['anxiety', 'stress', 'work', 'family', 'sleep', 'mood', 'relationships']
        message_lower = chat_request.message.lower()
        for keyword in keywords:
            if keyword in message_lower:
                topics.append(keyword)
        
        # Update session topics
        if topics:
            session = supabase.table('therapy_sessions').select('topics').eq('id', session_id).execute()
            existing_topics = session.data[0].get('topics', []) if session.data else []
            updated_topics = list(set(existing_topics + topics))
            supabase.table('therapy_sessions').update({'topics': updated_topics}).eq('id', session_id).execute()
        
        logger.info(f"Therapy chat completed for session: {session_id}")
        
        return TherapyChatResponse(
            session_id=session_id,
            response=ai_response,
            topics=topics,
            crisis_detected=crisis_detected,
            crisis_message=crisis_message
        )
        
    except Exception as e:
        logger.error(f"Error in therapy chat: {str(e)}", exc_info=True)
        # Return detailed error for debugging
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=f"Failed to process therapy message: {str(e)}")


@router.get("/history", response_model=List[TherapySessionResponse])
async def get_therapy_history(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    limit: int = 5
):
    """
    Retrieve user's therapy session history (last 5 sessions by default).
    """
    try:
        user_id = current_user['id']
        
        # Get sessions
        sessions = supabase.table('therapy_sessions') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('started_at', desc=True) \
            .limit(limit) \
            .execute()
        
        if not sessions.data:
            return []
        
        # Get message counts for each session
        result = []
        for session in sessions.data:
            message_count_result = supabase.table('therapy_messages') \
                .select('id', count='exact') \
                .eq('session_id', session['id']) \
                .execute()
            
            message_count = message_count_result.count if message_count_result.count else 0
            
            result.append(TherapySessionResponse(
                id=session['id'],
                mode=session['mode'],
                started_at=session['started_at'],
                ended_at=session.get('ended_at'),
                topics=session.get('topics', []),
                feeling_rating=session.get('feeling_rating'),
                key_insights=session.get('key_insights'),
                message_count=message_count
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving therapy history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve therapy history")


@router.post("/close")
async def close_session(
    close_request: SessionCloseRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service)
):
    """
    Close a therapy session and generate AI reflection.
    """
    try:
        user_id = current_user['id']
        
        # Verify session belongs to user
        session = supabase.table('therapy_sessions') \
            .select('*') \
            .eq('id', close_request.session_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Generate reflection
        reflection = await generate_session_reflection(supabase, close_request.session_id, encryption)
        
        # Update session
        update_data = {
            'ended_at': datetime.utcnow().isoformat(),
            'key_insights': reflection,
        }
        
        if close_request.feeling_rating:
            update_data['feeling_rating'] = close_request.feeling_rating
        
        supabase.table('therapy_sessions').update(update_data).eq('id', close_request.session_id).execute()
        
        logger.info(f"Closed therapy session: {close_request.session_id}")
        
        return {
            "message": "Session closed successfully",
            "reflection": reflection
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error closing session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to close session")


@router.post("/export")
async def export_session(
    export_request: ExportRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    encryption = Depends(get_encryption_service)
):
    """
    Export therapy session as TXT or PDF.
    """
    try:
        user_id = current_user['id']
        
        # Verify session belongs to user
        session = supabase.table('therapy_sessions') \
            .select('*') \
            .eq('id', export_request.session_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = session.data[0]
        
        # Get conversation history
        messages = await get_conversation_history(supabase, export_request.session_id, encryption)
        
        if not messages:
            raise HTTPException(status_code=404, detail="No messages found in session")
        
        # Generate export content
        export_content = f"""MindMate Therapy Session Export
=====================================

Session ID: {export_request.session_id}
Mode: {session_data['mode']}
Started: {session_data['started_at']}
Ended: {session_data.get('ended_at', 'In progress')}
Topics: {', '.join(session_data.get('topics', []))}

Conversation:
-------------

"""
        
        for msg in messages:
            role = "You" if msg['role'] == 'user' else "Therapist"
            export_content += f"{role}: {msg['content']}\n\n"
        
        if session_data.get('key_insights'):
            export_content += f"\nSession Reflection:\n{session_data['key_insights']}\n"
        
        # Return based on format
        if export_request.format == 'txt':
            return Response(
                content=export_content,
                media_type="text/plain",
                headers={
                    "Content-Disposition": f"attachment; filename=therapy_session_{export_request.session_id}.txt"
                }
            )
        else:  # PDF
            # For PDF, we'll return the text content with a note
            # In production, use a library like reportlab or weasyprint
            return {
                "message": "PDF export not yet implemented. Use TXT format.",
                "content": export_content
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export session")
