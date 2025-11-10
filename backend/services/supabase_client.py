from supabase import create_client, Client
import sys
sys.path.append('..')
from config import get_settings
import logging

logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create Supabase client
try:
    supabase: Client = create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Failed to create Supabase client: {str(e)}")
    raise


def get_supabase() -> Client:
    """Get Supabase client instance"""
    return supabase
