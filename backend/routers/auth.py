from fastapi import APIRouter, HTTPException, Response, Request, Depends, Body, status
from pydantic import BaseModel, EmailStr
from services.supabase_client import get_supabase
from supabase import Client
from middleware import limiter, get_rate_limit
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class RegisterRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    user_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
@limiter.limit(get_rate_limit("auth_register"))
async def register(request: Request, data: RegisterRequest):
    """Register a new user with comprehensive error handling"""
    try:
        supabase = get_supabase()
        
        logger.info(f"Registration attempt for email: {data.email}")
        
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })
        
        if not auth_response.user:
            logger.warning(f"Registration failed for email: {data.email} - No user returned")
            raise HTTPException(status_code=400, detail="Registration failed")
        
        # Create profile
        profile_data = {
            "id": auth_response.user.id,
            "name": data.name,
            "display_name": data.username,
            "user_type": data.user_type,
        }
        
        supabase.table("profiles").insert(profile_data).execute()
        
        logger.info(f"Successful registration for user: {auth_response.user.id}")
        
        return {
            "message": "Registration successful",
            "user": {
                "id": auth_response.user.id,
                "email": data.email,
                "name": data.name
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        # Log full error for debugging
        logger.error(f"Registration error: {type(e).__name__}: {str(e)}", exc_info=True)
        
        # Classify error type
        error_str = str(e).lower()
        
        if "already" in error_str or "duplicate" in error_str or "exists" in error_str:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists"
            )
        elif "invalid" in error_str or "format" in error_str:
            raise HTTPException(
                status_code=400,
                detail="Invalid registration data. Please check your input."
            )
        elif "network" in error_str or "connection" in error_str or "timeout" in error_str:
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again."
            )
        else:
            # Generic server error
            raise HTTPException(
                status_code=500,
                detail="An error occurred during registration. Please try again."
            )

@router.post("/login")
@limiter.limit(get_rate_limit("auth_login"))
async def login(request: Request, data: LoginRequest, response: Response):
    """Login user with simple session-based auth"""
    try:
        supabase = get_supabase()
        
        # Attempt authentication with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        
        if not auth_response.user:
            logger.warning(f"Login failed for email: {data.email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Get or create user profile
        profile = supabase.table('profiles').select('*').eq('id', auth_response.user.id).execute()
        
        if not profile.data or len(profile.data) == 0:
            # Profile doesn't exist, create it
            logger.info(f"Creating profile for existing user: {auth_response.user.id}")
            profile_data = {
                'id': auth_response.user.id,
                'name': auth_response.user.email.split('@')[0],  # Use email prefix as name
                'email': auth_response.user.email,
                'user_type': 'individual'
            }
            try:
                supabase.table('profiles').insert(profile_data).execute()
                user_name = profile_data['name']
            except Exception as e:
                logger.error(f"Failed to create profile: {str(e)}")
                user_name = auth_response.user.email
        else:
            user_name = profile.data[0].get('name')
        
        user_data = {
            'id': auth_response.user.id,
            'email': auth_response.user.email,
            'name': user_name
        }
        
        # Create session (no tokens)
        from middleware.simple_auth import create_session
        session_id = create_session(user_data)
        
        # Set session cookie
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=86400,  # 24 hours
            samesite="lax"
        )
        
        logger.info(f"Successful login for user: {auth_response.user.id}")
        
        return {
            "message": "Login successful",
            "user": user_data
        }
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Login error: {type(e).__name__}: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        
        if "email not confirmed" in error_str:
            raise HTTPException(status_code=403, detail="Please verify your email")
        elif "invalid" in error_str or "password" in error_str:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        else:
            raise HTTPException(status_code=500, detail="Login failed")

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_id = request.cookies.get('session_id')
    if session_id:
        from middleware.simple_auth import destroy_session
        destroy_session(session_id)
    
    response.delete_cookie("session_id")
    return {"message": "Logout successful"}

@router.get("/validate")
async def validate_session(request: Request):
    """Check if user has valid session"""
    try:
        from middleware.simple_auth import get_optional_user
        user = await get_optional_user(request)
        
        if user:
            return {"valid": True, "user": user}
        else:
            return {"valid": False, "user": None}
    except Exception as e:
        logger.error(f"Session validation error: {str(e)}")
        return {"valid": False, "user": None}
