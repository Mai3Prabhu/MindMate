"""
Middleware package for MindMate API
"""

from .simple_auth import get_current_user, get_optional_user

from .rate_limit_middleware import (
    limiter,
    rate_limit_exceeded_handler,
    rate_limit_strict,
    rate_limit_moderate,
    rate_limit_relaxed,
    get_rate_limit,
)
from .security_middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    CORSSecurityMiddleware,
)

__all__ = [
    # Auth
    "get_current_user",
    "get_optional_user",
    # Rate limiting
    "limiter",
    "rate_limit_exceeded_handler",
    "rate_limit_strict",
    "rate_limit_moderate",
    "rate_limit_relaxed",
    "get_rate_limit",
    # Security
    "SecurityHeadersMiddleware",
    "RequestLoggingMiddleware",
    "CORSSecurityMiddleware",
]
