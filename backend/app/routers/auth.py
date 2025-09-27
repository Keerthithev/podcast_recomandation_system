from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import passlib.exc
import jwt

from ..db import get_database
from ..config import settings

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
	email: EmailStr
	password: str
	name: Optional[str] = None

class LoginRequest(BaseModel):
	email: EmailStr
	password: str

class AuthResponse(BaseModel):
	token: str
	user: dict

async def _create_jwt(user_id: str, email: str) -> str:
	expires = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
	payload = {"sub": user_id, "email": email, "exp": expires}
	return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
	db = await get_database()
	users = db.get_collection("users")
	existing = await users.find_one({"email": req.email.lower()})
	if existing:
		raise HTTPException(status_code=400, detail="Email already registered")
	hash_pw = pwd_context.hash(req.password)
	username = req.email.lower()
	user_doc = {"email": req.email.lower(), "username": username, "password_hash": hash_pw, "name": req.name or ""}
	res = await users.insert_one(user_doc)
	user_id = str(res.inserted_id)
	token = await _create_jwt(user_id, req.email.lower())
	return {"token": token, "user": {"id": user_id, "email": req.email.lower(), "name": req.name or ""}}

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
	db = await get_database()
	users = db.get_collection("users")
	user = await users.find_one({"email": req.email.lower()})
	if not user:
		raise HTTPException(status_code=401, detail="Invalid credentials")
	stored = user.get("password_hash", "")
	verified = False
	try:
		verified = pwd_context.verify(req.password, stored)
	except passlib.exc.UnknownHashError:
		if stored and req.password == stored:
			new_hash = pwd_context.hash(req.password)
			await users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": new_hash}})
			verified = True
	if not verified:
		raise HTTPException(status_code=401, detail="Invalid credentials")
	user_id = str(user.get("_id"))
	token = await _create_jwt(user_id, req.email.lower())
	return {"token": token, "user": {"id": user_id, "email": user.get("email"), "name": user.get("name", "")}}
