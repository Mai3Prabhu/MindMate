"""
Encryption Service for MindMate
Provides AES-256 encryption/decryption for sensitive data
"""

from cryptography.fernet import Fernet
import base64
import hashlib
import logging
from typing import Optional
from config import get_settings

logger = logging.getLogger(__name__)


class EncryptionService:
    """
    Service for encrypting and decrypting sensitive data using AES-256.
    Uses Fernet (symmetric encryption) which provides authenticated encryption.
    """
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize encryption service with a key.
        
        Args:
            encryption_key: Base encryption key. If None, loads from settings.
        """
        if encryption_key is None:
            settings = get_settings()
            encryption_key = settings.encryption_key
        
        # Derive a proper 32-byte key from the encryption key
        self.key = self._derive_key(encryption_key)
        self.cipher = Fernet(self.key)
        logger.info("Encryption service initialized")
    
    def _derive_key(self, key_string: str) -> bytes:
        """
        Derive a proper Fernet key from a string.
        Uses SHA-256 to create a 32-byte key, then base64 encodes it.
        
        Args:
            key_string: Input key string
            
        Returns:
            Base64-encoded 32-byte key suitable for Fernet
        """
        # Hash the key string to get exactly 32 bytes
        key_hash = hashlib.sha256(key_string.encode()).digest()
        # Fernet requires base64-encoded key
        return base64.urlsafe_b64encode(key_hash)
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext string.
        
        Args:
            plaintext: String to encrypt
            
        Returns:
            Base64-encoded encrypted string
            
        Raises:
            ValueError: If plaintext is empty
            Exception: If encryption fails
        """
        if not plaintext:
            raise ValueError("Cannot encrypt empty string")
        
        try:
            encrypted_bytes = self.cipher.encrypt(plaintext.encode('utf-8'))
            encrypted_string = encrypted_bytes.decode('utf-8')
            logger.debug(f"Successfully encrypted data (length: {len(plaintext)})")
            return encrypted_string
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise Exception(f"Encryption failed: {str(e)}")
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt ciphertext string.
        
        Args:
            ciphertext: Base64-encoded encrypted string
            
        Returns:
            Decrypted plaintext string
            
        Raises:
            ValueError: If ciphertext is empty
            Exception: If decryption fails (invalid token, corrupted data, wrong key)
        """
        if not ciphertext:
            raise ValueError("Cannot decrypt empty string")
        
        try:
            decrypted_bytes = self.cipher.decrypt(ciphertext.encode('utf-8'))
            decrypted_string = decrypted_bytes.decode('utf-8')
            logger.debug(f"Successfully decrypted data (length: {len(decrypted_string)})")
            return decrypted_string
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise Exception(f"Decryption failed: {str(e)}")
    
    def encrypt_dict(self, data: dict) -> str:
        """
        Encrypt a dictionary by converting to JSON string first.
        
        Args:
            data: Dictionary to encrypt
            
        Returns:
            Encrypted string
        """
        import json
        json_string = json.dumps(data)
        return self.encrypt(json_string)
    
    def decrypt_dict(self, ciphertext: str) -> dict:
        """
        Decrypt a string back to a dictionary.
        
        Args:
            ciphertext: Encrypted string
            
        Returns:
            Decrypted dictionary
        """
        import json
        json_string = self.decrypt(ciphertext)
        return json.loads(json_string)


# Singleton instance
_encryption_service: Optional[EncryptionService] = None


def get_encryption_service() -> EncryptionService:
    """
    Get encryption service instance (singleton pattern).
    
    Returns:
        EncryptionService instance
    """
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service
