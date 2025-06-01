from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel

from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.schemas.user import User, UserCreate, UserUpdate, UserRole
from app.models.user import UserModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=dict)
def login(
    db: Session = Depends(get_db),
    login_data: LoginRequest = None
) -> Any:
    user = db.query(UserModel).filter(UserModel.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_superuser": user.is_superuser
        }
    }

@router.post("/register", response_model=dict)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = UserModel(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

@router.get("/me", response_model=User)
def read_user_me(
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    if user_in.password is not None:
        current_user.hashed_password = security.get_password_hash(user_in.password)
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.email is not None:
        current_user.email = user_in.email
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.admin_only()),
) -> Any:
    """
    Retrieve users. Only accessible to admin users.
    """
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.patch("/users/{user_id}/role", response_model=User)
def update_user_role(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    role: UserRole,
    current_user: UserModel = Depends(security.admin_only()),
) -> Any:
    """
    Update a user's role. Only accessible to admin users.
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this ID does not exist in the system",
        )
    
    # Prevent changing the role of a superuser
    if user.is_superuser and current_user.id != user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change the role of a superuser",
        )
    
    user.role = role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user