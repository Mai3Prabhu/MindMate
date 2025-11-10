from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
import os
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
import sys

from routers import auth, users, journal, emotion, therapy, feelhear, meditation
from routers import content, wellness, braingym, symphony, gemini_routes
from config import get_settings

load_dotenv()

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        RotatingFileHandler(
            'logs/app.log',
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="MindMate API",
    description="Mental wellness platform API with Supabase and Gemini AI",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_event():
    """Validate configuration on startup"""
    try:
        settings = get_settings()
        logger.info("[OK] Configuration validated successfully")
        logger.info(f"[OK] Supabase URL: {settings.supabase_url}")
        logger.info(f"[OK] Allowed Origins: {settings.allowed_origins}")
        if settings.database_url:
            logger.info("[OK] Database URL configured for direct PostgreSQL access")
    except Exception as e:
        logger.error(f"[ERROR] Configuration validation failed: {str(e)}")
        logger.error("Application cannot start without valid configuration")
        sys.exit(1)


# CORS middleware
settings = get_settings()
allowed_origins = settings.allowed_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(emotion.router, prefix="/api/emotion", tags=["Emotions"])
app.include_router(therapy.router, prefix="/api/therapy", tags=["Therapy"])
app.include_router(feelhear.router, prefix="/api/feelhear", tags=["FeelHear"])
app.include_router(meditation.router, prefix="/api/meditation", tags=["Meditation"])
app.include_router(content.router, prefix="/api/content", tags=["Content Library"])
app.include_router(wellness.router, prefix="/api/digital-wellness", tags=["Digital Wellness"])
app.include_router(braingym.router, prefix="/api/braingym", tags=["Brain Gym"])
app.include_router(symphony.router, prefix="/api/symphony", tags=["Symphony"])
app.include_router(gemini_routes.router, prefix="/api/gemini", tags=["Gemini AI"])

@app.get("/")
async def root():
    return {
        "message": "MindMate API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Enhanced health check with Supabase connectivity verification"""
    health_status = {
        "status": "healthy",
        "version": "1.0.0",
        "database": "unknown"
    }
    
    try:
        from services.supabase_client import get_supabase
        supabase = get_supabase()
        
        # Test Supabase connectivity with a simple query
        # This will fail if Supabase is unreachable
        result = supabase.table("profiles").select("id").limit(1).execute()
        health_status["database"] = "connected"
        
    except Exception as e:
        logger.warning(f"Health check: Database connection issue - {str(e)}")
        health_status["database"] = "disconnected"
        health_status["status"] = "degraded"
    
    return health_status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
