from pydantic import BaseModel, EmailStr, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> Any:
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: Any, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: PyObjectId = None
    hashed_password: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    preferences: dict = {}
    listening_history: List[str] = []
    favorite_podcasts: List[str] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(UserBase):
    id: PyObjectId = None
    created_at: datetime
    updated_at: datetime
    preferences: dict
    listening_history: List[str]
    favorite_podcasts: List[str]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
