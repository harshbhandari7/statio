from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import security
from app.db.session import get_db
from app.schemas.service import Service, ServiceCreate, ServiceUpdate
from app.models.service import ServiceModel
from app.models.user import UserModel

router = APIRouter()

@router.get("/", response_model=List[Service])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    """Get services filtered by organization."""
    if current_user.is_superuser:
        # Superuser sees all services
        services = db.query(ServiceModel).offset(skip).limit(limit).all()
    else:
        # Regular users see only their organization's services
        services = (
            db.query(ServiceModel)
            .filter(ServiceModel.organization_id == current_user.organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return services

@router.post("/", response_model=Service)
def create_service(
    *,
    db: Session = Depends(get_db),
    service_in: ServiceCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Create new service in the user's organization."""
    service_data = service_in.dict()
    
    # Set organization_id to current user's organization unless superuser specifies otherwise
    if not current_user.is_superuser:
        service_data["organization_id"] = current_user.organization_id
    elif service_data.get("organization_id") is None:
        service_data["organization_id"] = current_user.organization_id
    
    service = ServiceModel(**service_data)
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.get("/{service_id}", response_model=Service)
def read_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    """Get service by ID if user has access to it."""
    query = db.query(ServiceModel).filter(ServiceModel.id == service_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    service = query.first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist or you don't have access to it",
        )
    return service

@router.put("/{service_id}", response_model=Service)
def update_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    service_in: ServiceUpdate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Update service if user has access to it."""
    query = db.query(ServiceModel).filter(ServiceModel.id == service_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    service = query.first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist or you don't have access to it",
        )
    
    update_data = service_in.dict(exclude_unset=True)
    
    # Prevent regular users from changing organization_id
    if not current_user.is_superuser and "organization_id" in update_data:
        del update_data["organization_id"]
    
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.delete("/{service_id}", response_model=Service)
def delete_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Delete service if user has access to it."""
    query = db.query(ServiceModel).filter(ServiceModel.id == service_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    service = query.first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist or you don't have access to it",
        )
    
    db.delete(service)
    db.commit()
    return service