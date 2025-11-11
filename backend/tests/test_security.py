"""
Tests for security middleware and encryption service
"""

import pytest
from services.encryption_service import EncryptionService


class TestEncryptionService:
    """Test encryption service functionality"""
    
    def test_encrypt_decrypt_string(self):
        """Test basic string encryption and decryption"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        plaintext = "This is a secret journal entry"
        encrypted = service.encrypt(plaintext)
        decrypted = service.decrypt(encrypted)
        
        assert decrypted == plaintext
        assert encrypted != plaintext
        assert len(encrypted) > len(plaintext)
    
    def test_encrypt_decrypt_dict(self):
        """Test dictionary encryption and decryption"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        data = {
            "mood": "happy",
            "note": "Had a great day today",
            "intensity": 8
        }
        
        encrypted = service.encrypt_dict(data)
        decrypted = service.decrypt_dict(encrypted)
        
        assert decrypted == data
        assert isinstance(encrypted, str)
    
    def test_encrypt_empty_string_raises_error(self):
        """Test that encrypting empty string raises ValueError"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        with pytest.raises(ValueError, match="Cannot encrypt empty string"):
            service.encrypt("")
    
    def test_decrypt_empty_string_raises_error(self):
        """Test that decrypting empty string raises ValueError"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        with pytest.raises(ValueError, match="Cannot decrypt empty string"):
            service.decrypt("")
    
    def test_decrypt_invalid_data_raises_error(self):
        """Test that decrypting invalid data raises Exception"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        with pytest.raises(Exception, match="Decryption failed"):
            service.decrypt("invalid_encrypted_data")
    
    def test_different_keys_produce_different_ciphertexts(self):
        """Test that different keys produce different encrypted outputs"""
        service1 = EncryptionService("key_one_32_bytes_long_string_here")
        service2 = EncryptionService("key_two_32_bytes_long_string_here")
        
        plaintext = "Same message"
        encrypted1 = service1.encrypt(plaintext)
        encrypted2 = service2.encrypt(plaintext)
        
        assert encrypted1 != encrypted2
    
    def test_wrong_key_cannot_decrypt(self):
        """Test that wrong key cannot decrypt data"""
        service1 = EncryptionService("key_one_32_bytes_long_string_here")
        service2 = EncryptionService("key_two_32_bytes_long_string_here")
        
        plaintext = "Secret message"
        encrypted = service1.encrypt(plaintext)
        
        with pytest.raises(Exception, match="Decryption failed"):
            service2.decrypt(encrypted)
    
    def test_unicode_characters(self):
        """Test encryption of unicode characters"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        plaintext = "Hello 世界 🌍 émojis"
        encrypted = service.encrypt(plaintext)
        decrypted = service.decrypt(encrypted)
        
        assert decrypted == plaintext
    
    def test_large_text(self):
        """Test encryption of large text"""
        service = EncryptionService("test_key_32_bytes_long_string_here")
        
        # Create a large text (10KB)
        plaintext = "A" * 10000
        encrypted = service.encrypt(plaintext)
        decrypted = service.decrypt(encrypted)
        
        assert decrypted == plaintext
        assert len(decrypted) == 10000


# Note: Authentication and rate limiting tests require FastAPI TestClient
# and would be in separate integration test files

"""
Example integration tests (requires TestClient setup):

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_protected_route_without_auth():
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_rate_limit_exceeded():
    for i in range(6):  # Exceed 5/minute limit
        response = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
    
    assert response.status_code == 429
    assert "rate_limit_exceeded" in response.json()["error"]

def test_security_headers():
    response = client.get("/")
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert "X-Frame-Options" in response.headers
    assert response.headers["X-Frame-Options"] == "DENY"
"""
