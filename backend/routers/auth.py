from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, EmailStr
from services.supabase_client import get_supabase
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
async def register(data: RegisterRequest):
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
async def login(data: LoginRequest, response: Response):
    """Login user with comprehensive error handling"""
    try:
        supabase = get_supabase()
        
        # Attempt authentication
        auth_response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        
        # Check for successful session
        if not auth_response.session:
            logger.warning(f"Login failed for email: {data.email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Set secure cookie
        response.set_cookie(
            key="access_token",
            value=auth_response.session.access_token,
            httponly=True,
            max_age=3600,
            secure=True,
            samesite="lax"
        )
        
        logger.info(f"Successful login for user: {auth_response.user.id}")
        
        return {
            "message": "Login successful",
            "access_token": auth_response.session.access_token,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "user_metadata": auth_response.user.user_metadata
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        # Log full error for debugging
        logger.error(f"Login error: {type(e).__name__}: {str(e)}", exc_info=True)
        
        # Classify error type
        error_str = str(e).lower()
        
        if "email not confirmed" in error_str or "not confirmed" in error_str:
            raise HTTPException(
                status_code=403,
                detail="Please verify your email address before logging in. Check your inbox for the confirmation link."
            )
        elif "invalid" in error_str or "credentials" in error_str or "password" in error_str:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
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
                detail="An error occurred during login. Please try again."
            )

@router.post("/logout")
async def logout(response: Response):
    """Logout user"""
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}

@router.post("/refresh")
async def refresh_token():
    """Refresh access token"""
    # TODO: Implement token refresh logic
    return {"message": "Token refreshed"}
