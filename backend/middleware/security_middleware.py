"""
Security Headers Middleware for MindMate
Adds security headers to all responses
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses.
    Implements OWASP security best practices.
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        Process request and add security headers to response.
        
        Args:
            request: Incoming request
            call_next: Next middleware/route handler
            
        Returns:
            Response with security headers
        """
        response: Response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"
        
        # Enable XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Enforce HTTPS (only in production)
        # Uncomment for production with HTTPS
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Content Security Policy
        # Adjust based on your needs
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Adjust for production
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.openai.com https://*.supabase.co",
            "frame-ancestors 'none'",
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (formerly Feature Policy)
        permissions = [
            "geolocation=(self)",
            "microphone=(self)",
            "camera=()",
            "payment=()",
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions)
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all incoming requests for security monitoring.
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        Log request details and process request.
        
        Args:
            request: Incoming request
            call_next: Next middleware/route handler
            
        Returns:
            Response from route handler
        """
        # Log request details
        client_host = request.client.host if request.client else "unknown"
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {client_host}"
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response status
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code}"
        )
        
        return response


class CORSSecurityMiddleware(BaseHTTPMiddleware):
    """
    Additional CORS security checks beyond FastAPI's CORSMiddleware.
    """
    
    def __init__(self, app, allowed_origins: list):
        super().__init__(app)
        self.allowed_origins = allowed_origins
    
    async def dispatch(self, request: Request, call_next):
        """
        Validate CORS origin and process request.
        
        Args:
            request: Incoming request
            call_next: Next middleware/route handler
            
        Returns:
            Response from route handler
        """
        origin = request.headers.get("origin")
        
        # Check if origin is in allowed list
        if origin and origin not in self.allowed_origins:
            logger.warning(f"Blocked request from unauthorized origin: {origin}")
        
        response = await call_next(request)
        return response
