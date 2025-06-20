from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel

from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.schemas.user import User, UserCreate, UserUpdate, UserRole, PasswordResetRequest, PasswordReset, UserRoleUpdate, UserOrganizationUpdate
from app.models.user import UserModel
from app.models.password_reset import PasswordResetToken
from app.models.organization import OrganizationModel

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
    
    # Check if this is the first user (make them superuser)
    is_first_user = db.query(UserModel).count() == 0
    
    user = UserModel(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        role=UserRole.ADMIN if is_first_user else UserRole.VIEWER,  # First user becomes admin
        is_superuser=is_first_user  # First user becomes superuser
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
            "full_name": user.full_name,
            "role": user.role,
            "is_superuser": user.is_superuser
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

@router.patch("/{user_id}/role", response_model=User)
@router.put("/{user_id}/role", response_model=User)
def update_user_role(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    role_update: UserRoleUpdate,
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
    
    user.role = role_update.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/organization", response_model=User)
@router.put("/{user_id}/organization", response_model=User)
def update_user_organization(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    organization_update: UserOrganizationUpdate,
    current_user: UserModel = Depends(security.admin_only()),
) -> Any:
    """
    Update a user's organization. Only accessible to admin users.
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this ID does not exist in the system",
        )
    
    # Check if organization exists
    organization = db.query(OrganizationModel).filter(
        OrganizationModel.id == organization_update.organization_id
    ).first()
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="The organization with this ID does not exist",
        )
    
    # Update user's organization
    user.organization_id = organization_update.organization_id
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Add a utility function for sending password reset emails
def send_password_reset_email(email: str, token: str):
    """
    In a production environment, this would send an actual email.
    For now, we'll just print the reset link to the console.
    """
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    print(f"Password reset link for {email}: {reset_link}")
    # In production, you would use an email service like:
    # send_email(
    #     to=email,
    #     subject="Password Reset Request",
    #     body=f"Click the link to reset your password: {reset_link}"
    # )

@router.post("/forgot-password", response_model=dict)
def request_password_reset(
    background_tasks: BackgroundTasks,
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Request a password reset token
    """
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if not user:
        # Don't reveal that the user doesn't exist, just return success
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Generate token
    token = security.generate_password_reset_token(user.email)
    
    # Store token in database with expiry
    expires_at = datetime.now() + timedelta(hours=24)
    db_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    
    # Send email in background to not block the response
    background_tasks.add_task(send_password_reset_email, user.email, token)
    
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/reset-password", response_model=dict)
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password with token
    """
    email = security.verify_password_reset_token(reset_data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if token exists and is not used
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == reset_data.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.now()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    
    # Update password
    user.hashed_password = security.get_password_hash(reset_data.new_password)
    
    # Mark token as used
    token_record.used = True
    
    db.add(user)
    db.add(token_record)
    db.commit()
    
    return {"message": "Password has been reset successfully"}