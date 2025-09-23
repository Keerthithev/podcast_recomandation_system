from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from datetime import timedelta, datetime
from models.simple_models import UserCreate, UserInDB, User, UserUpdate
from services.database import get_database
from services.security import verify_password, get_password_hash, create_access_token, verify_token, validate_email, validate_password_strength, sanitize_input
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Dict[str, Any])
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Validate email
        if not validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        password_validation = validate_password_strength(user_data.password)
        if not password_validation["is_valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation failed: {', '.join(password_validation['errors'])}"
            )
        
        # Sanitize inputs
        sanitized_email = sanitize_input(user_data.email)
        sanitized_username = sanitize_input(user_data.username)
        sanitized_full_name = sanitize_input(user_data.full_name) if user_data.full_name else None
        
        db = await get_database()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": sanitized_email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = await db.users.find_one({"username": sanitized_username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user_dict = {
            "email": sanitized_email,
            "username": sanitized_username,
            "full_name": sanitized_full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "preferences": {},
            "listening_history": [],
            "favorite_podcasts": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(user_dict)
        
        if result.inserted_id:
            # Create access token
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(
                data={"sub": str(result.inserted_id), "email": sanitized_email},
                expires_delta=access_token_expires
            )
            
            return {
                "message": "User registered successfully",
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": str(result.inserted_id)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/login", response_model=Dict[str, Any])
async def login(login_data: dict):
    """Login user"""
    try:
        email = login_data.get("email")
        password = login_data.get("password")
        
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required"
            )
        
        # Sanitize inputs
        sanitized_email = sanitize_input(email)
        
        db = await get_database()
        
        # Find user
        user = await db.users.find_one({"email": sanitized_email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user["_id"]), "email": user["email"]},
            expires_delta=access_token_expires
        )
        
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current user from token"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        db = await get_database()
        user = await db.users.find_one({"_id": current_user["sub"]})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "full_name": user.get("full_name"),
            "is_active": user.get("is_active", True),
            "preferences": user.get("preferences", {}),
            "created_at": user.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/me", response_model=Dict[str, Any])
async def update_user_info(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user information"""
    try:
        db = await get_database()
        
        # Sanitize inputs
        update_data = {}
        if user_update.email:
            if not validate_email(user_update.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format"
                )
            update_data["email"] = sanitize_input(user_update.email)
        
        if user_update.username:
            update_data["username"] = sanitize_input(user_update.username)
        
        if user_update.full_name:
            update_data["full_name"] = sanitize_input(user_update.full_name)
        
        if user_update.is_active is not None:
            update_data["is_active"] = user_update.is_active
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Check for duplicate email/username
        if "email" in update_data:
            existing_user = await db.users.find_one({
                "email": update_data["email"],
                "_id": {"$ne": current_user["sub"]}
            })
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
        
        if "username" in update_data:
            existing_user = await db.users.find_one({
                "username": update_data["username"],
                "_id": {"$ne": current_user["sub"]}
            })
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update user
        update_data["updated_at"] = datetime.utcnow()
        result = await db.users.update_one(
            {"_id": current_user["sub"]},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return {"message": "User updated successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout", response_model=Dict[str, Any])
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    return {"message": "Logout successful"}
