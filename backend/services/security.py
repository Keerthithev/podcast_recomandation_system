from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        return None

def sanitize_input(input_string: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not isinstance(input_string, str):
        return str(input_string)
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$']
    sanitized = input_string
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    # Limit length
    sanitized = sanitized[:1000]
    
    return sanitized.strip()

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> dict:
    """Validate password strength"""
    result = {
        "is_valid": True,
        "errors": []
    }
    
    if len(password) < 8:
        result["is_valid"] = False
        result["errors"].append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        result["is_valid"] = False
        result["errors"].append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        result["is_valid"] = False
        result["errors"].append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        result["is_valid"] = False
        result["errors"].append("Password must contain at least one number")
    
    return result
