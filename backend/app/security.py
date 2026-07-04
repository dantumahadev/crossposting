import base64
import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

def get_encryption_key() -> bytes:
    key_str = settings.ENCRYPTION_KEY
    try:
        # If 64 hex characters, convert to 32 bytes
        if len(key_str) == 64:
            return bytes.fromhex(key_str)
        # If base64 encoded, decode
        decoded = base64.b64decode(key_str)
        if len(decoded) in (16, 24, 32):
            return decoded
    except Exception:
        pass
    # Fallback padding/truncating to exactly 32 bytes
    return key_str.encode("utf-8").ljust(32, b"0")[:32]

def encrypt_token(plain_text: str) -> str:
    if not plain_text:
        return ""
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    data = plain_text.encode("utf-8")
    ct = aesgcm.encrypt(nonce, data, None)
    # Return base64 encoded (nonce + ciphertext)
    return base64.b64encode(nonce + ct).decode("utf-8")

def decrypt_token(cipher_text: str) -> str:
    if not cipher_text:
        return ""
    try:
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        raw = base64.b64decode(cipher_text.encode("utf-8"))
        nonce = raw[:12]
        ct = raw[12:]
        plain = aesgcm.decrypt(nonce, ct, None)
        return plain.decode("utf-8")
    except Exception as e:
        # If decryption fails (e.g., during development key change or legacy unencrypted token), return as is
        return cipher_text

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
