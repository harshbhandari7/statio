from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from slugify import slugify as slugify_original
import re

# Create a Python 3 compatible slugify function
def slugify(text):
    # Convert to string if not already
    if not isinstance(text, str):
        text = str(text)
    # Convert to lowercase
    text = text.lower()
    # Remove non-word characters (alphanumerics and underscores)
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace spaces with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text

from app.core import security
from app.db.session import get_db
from app.schemas.organization import Organization, OrganizationCreate, OrganizationUpdate
from app.models.organization import OrganizationModel
from app.models.user import UserModel, UserRole

router = APIRouter()

@router.post("/", response_model=Organization)
def create_organization(
    *,
    db: Session = Depends(get_db),
    organization_in: OrganizationCreate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    """
    Create a new organization.
    """
    # Only superusers can create organizations
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create an organization",
        )
    
    # Generate slug if not provided or ensure uniqueness
    if not organization_in.slug:
        slug = slugify(organization_in.name)
    else:
        slug = slugify(organization_in.slug)
    
    # Check if slug is already taken
    existing_org = db.query(OrganizationModel).filter(OrganizationModel.slug == slug).first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists",
        )
    
    # Create organization
    from datetime import datetime
    current_time = datetime.now()
    
    organization = OrganizationModel(
        name=organization_in.name,
        slug=slug,
        description=organization_in.description,
        logo_url=organization_in.logo_url,
        is_active=organization_in.is_active,
        updated_at=current_time
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization

@router.get("/", response_model=List[Organization])
def read_organizations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    """
    Retrieve organizations.
    """
    # Superusers can see all organizations
    if current_user.is_superuser:
        organizations = db.query(OrganizationModel).offset(skip).limit(limit).all()
    # Regular users can only see their own organization
    elif current_user.organization_id:
        organizations = [db.query(OrganizationModel).filter(OrganizationModel.id == current_user.organization_id).first()]
    else:
        organizations = []
    
    return organizations

@router.get("/{organization_id}", response_model=Organization)
def read_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    """
    Get organization by ID.
    """
    # Check if user has permission to access this organization
    if not current_user.is_superuser and current_user.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this organization",
        )
    
    organization = db.query(OrganizationModel).filter(OrganizationModel.id == organization_id).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    return organization

@router.put("/{organization_id}", response_model=Organization)
def update_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    organization_in: OrganizationUpdate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    """
    Update an organization.
    """
    # Check if user has permission to update this organization
    if not current_user.is_superuser and (current_user.organization_id != organization_id or current_user.role != UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this organization",
        )
    
    organization = db.query(OrganizationModel).filter(OrganizationModel.id == organization_id).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    
    # Update organization fields
    if organization_in.name is not None:
        organization.name = organization_in.name
    if organization_in.description is not None:
        organization.description = organization_in.description
    if organization_in.logo_url is not None:
        organization.logo_url = organization_in.logo_url
    if organization_in.is_active is not None:
        organization.is_active = organization_in.is_active
    
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization

@router.delete("/{organization_id}", response_model=Organization)
def delete_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: UserModel = Depends(security.admin_only()),
) -> Any:
    """
    Delete an organization.
    """
    # Only superusers can delete organizations
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete an organization",
        )
    
    organization = db.query(OrganizationModel).filter(OrganizationModel.id == organization_id).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    
    # Delete organization
    db.delete(organization)
    db.commit()
    return organization
