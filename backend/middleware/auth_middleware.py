"""
Authentication Middleware for MindMate
Provides JWT validation and user authentication
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
from services.supabase_client import get_supabase
from supabase import Client

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        supabase: Supabase client instance
        
    Returns:
        User data dictionary with id, email, and other profile info
        
    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    token = credentials.credentials
    
    try:
        # Verify token with Supabase Auth
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            logger.warning("Invalid token: User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = user_response.user
        
        # Get additional profile data from profiles table
        profile_response = supabase.table('profiles').select('*').eq('id', user.id).execute()
        
        if profile_response.data and len(profile_response.data) > 0:
            profile = profile_response.data[0]
        else:
            # If no profile exists, create basic user dict
            profile = {
                'id': user.id,
                'email': user.email,
            }
        
        logger.info(f"User authenticated: {user.id}")
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    request: Request,
    supabase: Client = Depends(get_supabase)
) -> Optional[Dict[str, Any]]:
    """
    Dependency to optionally get the current user.
    Returns None if no valid token is provided instead of raising an error.
    
    Args:
        request: FastAPI request object
        supabase: Supabase client instance
        
    Returns:
        User data dictionary or None if not authenticated
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            return None
        
        user = user_response.user
        
        # Get profile data
        profile_response = supabase.table('profiles').select('*').eq('id', user.id).execute()
        
        if profile_response.data and len(profile_response.data) > 0:
            return profile_response.data[0]
        
        return {
            'id': user.id,
            'email': user.email,
        }
        
    except Exception as e:
        logger.debug(f"Optional auth failed: {str(e)}")
        return None


def require_user_type(*allowed_types: str):
    """
    Decorator to require specific user types.
    
    Args:
        allowed_types: User types that are allowed (e.g., 'individual', 'caregiver', 'family')
        
    Returns:
        Dependency function that validates user type
        
    Example:
        @router.get("/admin")
        async def admin_route(user: dict = Depends(require_user_type('caregiver'))):
            pass
    """
    async def user_type_dependency(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Dict[str, Any]:
        user_type = current_user.get('user_type')
        
        if user_type not in allowed_types:
            logger.warning(f"User {current_user.get('id')} attempted to access restricted resource")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required user type: {', '.join(allowed_types)}"
            )
        
        return current_user
    
    return user_type_dependency
