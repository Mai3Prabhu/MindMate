"""
Simple Session-Based Authentication
No tokens, no JWT, just simple session tracking
"""

from fastapi import Request, HTTPException, status
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# In-memory session store (use Redis in production)
sessions: Dict[str, Dict[str, Any]] = {}


async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Get current user from session.
    Raises 401 if not authenticated.
    """
    session_id = request.cookies.get('session_id')
    logger.info(f"Auth check - Session ID from cookie: {session_id}")
    logger.info(f"Auth check - Active sessions: {list(sessions.keys())}")
    
    if not session_id:
        logger.warning("No session_id cookie found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - no session cookie"
        )
    
    if session_id not in sessions:
        logger.warning(f"Session ID {session_id} not found in active sessions")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - invalid session"
        )
    
    logger.info(f"User authenticated: {sessions[session_id].get('email')}")
    return sessions[session_id]


async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Get current user from session if available.
    Returns None if not authenticated.
    """
    session_id = request.cookies.get('session_id')
    
    if not session_id or session_id not in sessions:
        return None
    
    return sessions.get(session_id)


def create_session(user_data: Dict[str, Any]) -> str:
    """Create a new session and return session ID"""
    import uuid
    session_id = str(uuid.uuid4())
    sessions[session_id] = user_data
    logger.info(f"Session created for user: {user_data.get('id')}")
    return session_id


def destroy_session(session_id: str):
    """Destroy a session"""
    if session_id in sessions:
        del sessions[session_id]
        logger.info(f"Session destroyed: {session_id}")
