from pydantic_settings import BaseSettings
from pydantic import validator
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase Configuration
    supabase_url: str
    supabase_service_role_key: str
    
    # Database Configuration (Optional - for direct PostgreSQL connections)
    database_url: Optional[str] = None
    
    # Security
    encryption_key: str
    secret_key: str
    
    # API Keys
    gemini_api_key: str
    
    # Application Settings
    allowed_origins: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @validator('supabase_url')
    def validate_supabase_url(cls, v):
        """Validate that Supabase URL starts with https://"""
        if not v:
            raise ValueError('SUPABASE_URL cannot be empty')
        if not v.startswith('https://'):
            raise ValueError('SUPABASE_URL must start with https://')
        return v
    
    @validator('database_url')
    def validate_database_url(cls, v):
        """Log warning if DATABASE_URL is not set"""
        if not v:
            logger.warning(
                "DATABASE_URL is not set. This is optional and only needed for "
                "direct PostgreSQL connections (migrations, raw SQL queries)."
            )
        return v


# Singleton instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings instance (singleton pattern)"""
    global _settings
    if _settings is None:
        _settings = Settings()
        logger.info("Configuration loaded successfully")
    return _settings
