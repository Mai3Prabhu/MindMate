"""
Rate Limiting Middleware for MindMate
Provides request rate limiting to prevent abuse
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


def get_user_identifier(request: Request) -> str:
    """
    Get identifier for rate limiting.
    Uses user ID if authenticated, otherwise falls back to IP address.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User identifier string
    """
    # Try to get user ID from request state (set by auth middleware)
    if hasattr(request.state, 'user') and request.state.user:
        user_id = request.state.user.get('id')
        if user_id:
            return f"user:{user_id}"
    
    # Fall back to IP address
    return get_remote_address(request)


# Initialize rate limiter
limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["100/minute"],  # Default limit for all routes
    storage_uri="memory://",  # Use in-memory storage (for production, use Redis)
    strategy="fixed-window"
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom handler for rate limit exceeded errors.
    
    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception
        
    Returns:
        JSON response with 429 status code
    """
    logger.warning(f"Rate limit exceeded for {get_user_identifier(request)}")
    
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "detail": str(exc.detail) if hasattr(exc, 'detail') else None
        }
    )


# Rate limit decorators for different use cases
def rate_limit_strict(limit: str = "10/minute"):
    """
    Strict rate limit for expensive operations.
    
    Args:
        limit: Rate limit string (e.g., "10/minute", "100/hour")
        
    Returns:
        Limiter decorator
        
    Example:
        @router.post("/expensive-operation")
        @rate_limit_strict("5/minute")
        async def expensive_operation():
            pass
    """
    return limiter.limit(limit)


def rate_limit_moderate(limit: str = "30/minute"):
    """
    Moderate rate limit for normal operations.
    
    Args:
        limit: Rate limit string
        
    Returns:
        Limiter decorator
    """
    return limiter.limit(limit)


def rate_limit_relaxed(limit: str = "100/minute"):
    """
    Relaxed rate limit for read operations.
    
    Args:
        limit: Rate limit string
        
    Returns:
        Limiter decorator
    """
    return limiter.limit(limit)


# Specific rate limits for different features
RATE_LIMITS = {
    # Authentication endpoints
    "auth_login": "5/minute",
    "auth_register": "3/minute",
    "auth_refresh": "10/minute",
    
    # AI-powered endpoints (expensive)
    "therapy_chat": "30/minute",
    "feelhear_analyze": "10/minute",
    "feelflow_insights": "20/minute",
    "gemini_generate": "20/minute",
    
    # Data write operations
    "journal_create": "50/minute",
    "emotion_log": "100/minute",
    "braingym_score": "100/minute",
    
    # Data read operations
    "journal_read": "100/minute",
    "emotion_read": "100/minute",
    "content_read": "200/minute",
}


def get_rate_limit(operation: str) -> str:
    """
    Get rate limit for a specific operation.
    
    Args:
        operation: Operation name (key from RATE_LIMITS)
        
    Returns:
        Rate limit string
    """
    return RATE_LIMITS.get(operation, "100/minute")
