from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
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
    services = db.query(ServiceModel).offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=Service)
def create_service(
    *,
    db: Session = Depends(get_db),
    service_in: ServiceCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    service = ServiceModel(**service_in.dict())
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
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist in the system",
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
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist in the system",
        )
    
    update_data = service_in.dict(exclude_unset=True)
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
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=404,
            detail="The service with this ID does not exist in the system",
        )
    
    db.delete(service)
    db.commit()
    return service