"""
Development Authentication Bypass
WARNING: Only use for development/testing. Remove for production.
"""

from fastapi import Depends
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Dummy user for development
DUMMY_USER = {
    'id': '00000000-0000-0000-0000-000000000001',
    'email': 'dev@mindmate.local',
    'name': 'Development User',
    'user_type': 'individual'
}


async def get_current_user_dev() -> Dict[str, Any]:
    """
    Development bypass for authentication.
    Returns a dummy user without requiring authentication.
    
    WARNING: This bypasses all security. Only use for development.
    """
    logger.debug("Using development authentication bypass")
    return DUMMY_USER


async def get_optional_user_dev() -> Optional[Dict[str, Any]]:
    """
    Development bypass for optional authentication.
    Always returns dummy user.
    """
    return DUMMY_USER
