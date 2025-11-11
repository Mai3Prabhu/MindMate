"""
Backend Response Caching Service

Provides caching for frequently accessed data to reduce database load
and improve response times.
"""

import logging
import json
import hashlib
from typing import Optional, Any, Callable
from datetime import datetime, timedelta
from functools import wraps

from services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class CacheService:
    """Service for caching API responses"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.default_ttl = 300  # 5 minutes in seconds
        
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """
        Generate a unique cache key from prefix and parameters.
        
        Args:
            prefix: Cache key prefix (e.g., 'user_profile', 'content_library')
            *args: Positional arguments to include in key
            **kwargs: Keyword arguments to include in key
            
        Returns:
            MD5 hash of the cache key
        """
        key_data = {
            'prefix': prefix,
            'args': args,
            'kwargs': kwargs
        }
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get cached value if available and not expired.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        try:
            result = self.supabase.table('response_cache') \
                .select('value, expires_at') \
                .eq('key', key) \
                .execute()
            
            if not result.data or len(result.data) == 0:
                return None
            
            entry = result.data[0]
            expires_at = datetime.fromisoformat(entry['expires_at'].replace('Z', '+00:00'))
            
            # Check if expired
            if datetime.utcnow() > expires_at:
                # Delete expired entry
                self.delete(key)
                return None
            
            # Parse and return value
            return json.loads(entry['value'])
            
        except Exception as e:
            logger.error(f"Error getting cached value: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set cached value with TTL.
        
        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            ttl: Time to live in seconds (default: 5 minutes)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl = ttl or self.default_ttl
            expires_at = (datetime.utcnow() + timedelta(seconds=ttl)).isoformat()
            
            cache_data = {
                'key': key,
                'value': json.dumps(value),
                'expires_at': expires_at
            }
            
            # Upsert (insert or update)
            self.supabase.table('response_cache').upsert(cache_data).execute()
            
            logger.debug(f"Cached value for key: {key[:8]}... (TTL: {ttl}s)")
            return True
            
        except Exception as e:
            logger.error(f"Error setting cached value: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete cached value.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.supabase.table('response_cache').delete().eq('key', key).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting cached value: {str(e)}")
            return False
    
    def clear_expired(self) -> int:
        """
        Clear all expired cache entries.
        
        Returns:
            Number of entries deleted
        """
        try:
            now = datetime.utcnow().isoformat()
            
            result = self.supabase.table('response_cache') \
                .delete() \
                .lt('expires_at', now) \
                .execute()
            
            count = len(result.data) if result.data else 0
            logger.info(f"Cleared {count} expired cache entries")
            return count
            
        except Exception as e:
            logger.error(f"Error clearing expired cache: {str(e)}")
            return 0
    
    def clear_pattern(self, pattern: str) -> int:
        """
        Clear all cache entries matching a pattern.
        
        Args:
            pattern: Pattern to match (SQL LIKE pattern)
            
        Returns:
            Number of entries deleted
        """
        try:
            result = self.supabase.table('response_cache') \
                .delete() \
                .like('key', pattern) \
                .execute()
            
            count = len(result.data) if result.data else 0
            logger.info(f"Cleared {count} cache entries matching pattern: {pattern}")
            return count
            
        except Exception as e:
            logger.error(f"Error clearing cache pattern: {str(e)}")
            return 0


# Singleton instance
_cache_service: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """Get or create the cache service singleton"""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
    return _cache_service


def cached(
    prefix: str,
    ttl: Optional[int] = None,
    key_func: Optional[Callable] = None
):
    """
    Decorator for caching function results.
    
    Args:
        prefix: Cache key prefix
        ttl: Time to live in seconds
        key_func: Optional function to generate cache key from args
        
    Example:
        @cached('user_profile', ttl=600)
        async def get_user_profile(user_id: str):
            # Expensive database query
            return profile
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = get_cache_service()
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = cache._generate_cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit for {prefix}")
                return cached_value
            
            # Cache miss - call function
            logger.debug(f"Cache miss for {prefix}")
            result = await func(*args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


# Predefined cache key generators for common patterns
def user_cache_key(user_id: str, *args, **kwargs) -> str:
    """Generate cache key for user-specific data"""
    cache = get_cache_service()
    return cache._generate_cache_key('user', user_id, *args, **kwargs)


def content_cache_key(category: Optional[str] = None, type: Optional[str] = None) -> str:
    """Generate cache key for content library"""
    cache = get_cache_service()
    return cache._generate_cache_key('content', category=category, type=type)


def stats_cache_key(resource: str, user_id: str, days: int) -> str:
    """Generate cache key for statistics"""
    cache = get_cache_service()
    return cache._generate_cache_key('stats', resource, user_id, days=days)
