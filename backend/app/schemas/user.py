from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[UserRole] = UserRole.VIEWER
    organization_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    is_superuser: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserOrganizationUpdate(BaseModel):
    organization_id: int