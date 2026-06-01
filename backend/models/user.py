from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "new_hire"
    department_id: Optional[int] = None

class UserCreate(UserBase):
    joining_date: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    user_id: int
    joining_date: Optional[datetime]
    is_active: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SetPassword(BaseModel):
    user_id: int
    new_password: str

class TokenData(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
