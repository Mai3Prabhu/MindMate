# Security Middleware Documentation

## Overview

This package provides comprehensive security features for the MindMate API including encryption, authentication, rate limiting, and security headers.

## Components

### 1. Encryption Service (`encryption_service.py`)

Provides AES-256 encryption for sensitive data like journal entries and therapy sessions.

#### Usage

```python
from services.encryption_service import get_encryption_service

# Get service instance
encryption = get_encryption_service()

# Encrypt data
encrypted_text = encryption.encrypt("Sensitive journal entry")

# Decrypt data
decrypted_text = encryption.decrypt(encrypted_text)

# Encrypt/decrypt dictionaries
encrypted_dict = encryption.encrypt_dict({"mood": "happy", "note": "Great day"})
decrypted_dict = encryption.decrypt_dict(encrypted_dict)
```

#### Features

- AES-256 symmetric encryption using Fernet
- Authenticated encryption (prevents tampering)
- Key derivation from environment variable
- Dictionary encryption support
- Comprehensive error handling

### 2. Authentication Middleware (`auth_middleware.py`)

Provides JWT token validation and user authentication using Supabase Auth.

#### Usage

```python
from fastapi import APIRouter, Depends
from middleware import get_current_user, get_optional_user, require_user_type

router = APIRouter()

# Require authentication
@router.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"user_id": current_user["id"]}

# Optional authentication
@router.get("/public")
async def public_route(user: dict = Depends(get_optional_user)):
    if user:
        return {"message": f"Hello {user['name']}"}
    return {"message": "Hello guest"}

# Require specific user type
@router.get("/caregiver-only")
async def caregiver_route(user: dict = Depends(require_user_type("caregiver"))):
    return {"message": "Caregiver access granted"}
```

#### Features

- JWT token validation via Supabase Auth
- Automatic user profile retrieval
- Optional authentication support
- User type-based access control
- Comprehensive error handling

### 3. Rate Limiting Middleware (`rate_limit_middleware.py`)

Prevents API abuse through request rate limiting using SlowAPI.

#### Usage

```python
from fastapi import APIRouter, Request
from middleware import limiter, get_rate_limit, rate_limit_strict

router = APIRouter()

# Use predefined rate limit
@router.post("/therapy/chat")
@limiter.limit(get_rate_limit("therapy_chat"))
async def therapy_chat(request: Request):
    pass

# Use custom rate limit
@router.post("/expensive-operation")
@limiter.limit("5/minute")
async def expensive_operation(request: Request):
    pass

# Use convenience decorators
from middleware import rate_limit_strict, rate_limit_moderate, rate_limit_relaxed

@router.post("/ai-analysis")
@rate_limit_strict("10/minute")
async def ai_analysis(request: Request):
    pass
```

#### Predefined Rate Limits

| Operation | Limit | Use Case |
|-----------|-------|----------|
| `auth_login` | 5/minute | Login attempts |
| `auth_register` | 3/minute | Registration |
| `therapy_chat` | 30/minute | AI therapy |
| `feelhear_analyze` | 10/minute | Voice analysis |
| `journal_create` | 50/minute | Journal entries |
| `emotion_log` | 100/minute | Mood logging |
| `content_read` | 200/minute | Content access |

#### Features

- User-based rate limiting (when authenticated)
- IP-based rate limiting (for anonymous users)
- Configurable limits per endpoint
- Custom error responses
- In-memory storage (Redis support available)

### 4. Security Headers Middleware (`security_middleware.py`)

Adds security headers to all responses following OWASP best practices.

#### Headers Added

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - XSS protection for legacy browsers
- **Content-Security-Policy**: Restricts resource loading
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: Controls browser features
- **Strict-Transport-Security**: HTTPS enforcement (production only)

#### Additional Middleware

**RequestLoggingMiddleware**: Logs all incoming requests and responses for security monitoring.

**CORSSecurityMiddleware**: Additional CORS validation beyond FastAPI's built-in middleware.

## Integration

### main.py Setup

```python
from fastapi import FastAPI
from middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    CORSSecurityMiddleware,
    limiter,
    rate_limit_exceeded_handler,
)
from slowapi.errors import RateLimitExceeded

app = FastAPI()

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add middleware (order matters)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CORSSecurityMiddleware, allowed_origins=["http://localhost:3000"])
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Encryption
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# JWT
SECRET_KEY=your_jwt_secret_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://mindmate.app
```

## Best Practices

### 1. Always Encrypt Sensitive Data

```python
from services.encryption_service import get_encryption_service

encryption = get_encryption_service()

# Before storing in database
encrypted_content = encryption.encrypt(journal_entry)
await db.insert({"content": encrypted_content})

# After retrieving from database
decrypted_content = encryption.decrypt(row["content"])
```

### 2. Protect All Authenticated Routes

```python
from middleware import get_current_user

@router.get("/user-data")
async def get_user_data(current_user: dict = Depends(get_current_user)):
    # Route is automatically protected
    return {"data": "sensitive"}
```

### 3. Apply Appropriate Rate Limits

```python
# Expensive AI operations - strict limit
@router.post("/ai-analysis")
@limiter.limit("10/minute")
async def ai_analysis(request: Request):
    pass

# Normal operations - moderate limit
@router.post("/create-entry")
@limiter.limit("50/minute")
async def create_entry(request: Request):
    pass

# Read operations - relaxed limit
@router.get("/list-entries")
@limiter.limit("100/minute")
async def list_entries(request: Request):
    pass
```

### 4. Log Security Events

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/sensitive-operation")
async def sensitive_operation(current_user: dict = Depends(get_current_user)):
    logger.info(f"Sensitive operation by user {current_user['id']}")
    # ... operation logic
```

## Testing

### Test Encryption

```python
from services.encryption_service import EncryptionService

def test_encryption():
    service = EncryptionService("test_key_32_bytes_long_string")
    
    plaintext = "Secret message"
    encrypted = service.encrypt(plaintext)
    decrypted = service.decrypt(encrypted)
    
    assert decrypted == plaintext
    assert encrypted != plaintext
```

### Test Authentication

```python
from fastapi.testclient import TestClient

def test_protected_route(client: TestClient):
    # Without token
    response = client.get("/protected")
    assert response.status_code == 401
    
    # With valid token
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {valid_token}"}
    )
    assert response.status_code == 200
```

### Test Rate Limiting

```python
def test_rate_limit(client: TestClient):
    # Make requests up to limit
    for i in range(5):
        response = client.post("/login", json={"email": "test@test.com", "password": "pass"})
        assert response.status_code in [200, 401]  # May fail auth but not rate limit
    
    # Exceed limit
    response = client.post("/login", json={"email": "test@test.com", "password": "pass"})
    assert response.status_code == 429
```

## Production Considerations

### 1. Use Redis for Rate Limiting

```python
# In rate_limit_middleware.py
limiter = Limiter(
    key_func=get_user_identifier,
    storage_uri="redis://localhost:6379",  # Use Redis in production
    strategy="fixed-window"
)
```

### 2. Enable HSTS

Uncomment in `security_middleware.py`:

```python
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
```

### 3. Adjust CSP for Production

Update Content-Security-Policy directives based on your actual resource needs.

### 4. Monitor Logs

Set up log aggregation and monitoring for security events:
- Failed authentication attempts
- Rate limit violations
- Unauthorized access attempts

## Troubleshooting

### Rate Limit Not Working

- Ensure `app.state.limiter = limiter` is set
- Check that `Request` parameter is included in route handler
- Verify SlowAPI is installed: `pip install slowapi`

### Authentication Fails

- Verify Supabase credentials in `.env`
- Check token format: `Bearer <token>`
- Ensure user exists in `profiles` table

### Encryption Errors

- Verify `ENCRYPTION_KEY` is set in `.env`
- Ensure key is consistent across deployments
- Check that encrypted data wasn't corrupted

## Security Checklist

- [x] AES-256 encryption for sensitive data
- [x] JWT authentication with Supabase
- [x] Rate limiting on all endpoints
- [x] Security headers (OWASP compliant)
- [x] Request logging for monitoring
- [x] CORS validation
- [x] User type-based access control
- [ ] HTTPS enforcement (production)
- [ ] Redis for distributed rate limiting (production)
- [ ] Security audit logging
- [ ] Intrusion detection
