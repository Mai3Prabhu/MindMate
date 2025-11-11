from supabase import create_client, Client
from functools import lru_cache
import sys
sys.path.append('..')
from config import get_settings
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_supabase() -> Client:
    """
    Get Supabase client instance with connection pooling.
    
    Uses LRU cache to maintain a single client instance across the application,
    which provides connection pooling and reduces overhead.
    
    Returns:
        Supabase client instance
    """
    try:
        settings = get_settings()
        
        # Create Supabase client with connection pooling
        # The Supabase client internally manages connection pooling
        client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        
        logger.info("Supabase client initialized with connection pooling")
        return client
        
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {str(e)}")
        raise


# Initialize client on module load
_supabase_client = get_supabase()
