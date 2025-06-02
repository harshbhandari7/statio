from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.maintenance import MaintenanceModel
from app.schemas.maintenance import Maintenance, MaintenanceCreate, MaintenanceUpdate
from app.models.user import UserModel
from app.core import security

router = APIRouter()

@router.get("/", response_model=List[Maintenance])
def read_maintenances(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100, 
    current_user: UserModel = Depends(security.all_authenticated_users())
):
    """Get maintenances filtered by organization."""
    if current_user.is_superuser:
        # Superuser sees all maintenances
        maintenances = db.query(MaintenanceModel).offset(skip).limit(limit).all()
    else:
        # Regular users see only their organization's maintenances
        maintenances = (
            db.query(MaintenanceModel)
            .filter(MaintenanceModel.organization_id == current_user.organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return maintenances

@router.post("/", response_model=Maintenance)
def create_maintenance(
    *, 
    db: Session = Depends(get_db), 
    maintenance_in: MaintenanceCreate, 
    current_user: UserModel = Depends(security.manager_or_admin())
):
    """Create a new maintenance in the user's organization."""
    maintenance_data = maintenance_in.dict()
    
    # Set organization_id to current user's organization unless superuser specifies otherwise
    if not current_user.is_superuser:
        maintenance_data["organization_id"] = current_user.organization_id
    elif maintenance_data.get("organization_id") is None:
        maintenance_data["organization_id"] = current_user.organization_id
    
    maintenance = MaintenanceModel(**maintenance_data)
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.get("/{maintenance_id}", response_model=Maintenance)
def read_maintenance(
    *, 
    db: Session = Depends(get_db), 
    maintenance_id: int, 
    current_user: UserModel = Depends(security.all_authenticated_users())
):
    """Get a specific maintenance if user has access to it."""
    query = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(MaintenanceModel.organization_id == current_user.organization_id)
    
    maintenance = query.first()
    if not maintenance:
        raise HTTPException(
            status_code=404, 
            detail="The maintenance with this ID does not exist or you don't have access to it"
        )
    return maintenance

@router.put("/{maintenance_id}", response_model=Maintenance)
def update_maintenance(
    *, 
    db: Session = Depends(get_db), 
    maintenance_id: int, 
    maintenance_in: MaintenanceUpdate, 
    current_user: UserModel = Depends(security.manager_or_admin())
):
    """Update a maintenance if user has access to it."""
    query = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(MaintenanceModel.organization_id == current_user.organization_id)
    
    maintenance = query.first()
    if not maintenance:
        raise HTTPException(
            status_code=404, 
            detail="The maintenance with this ID does not exist or you don't have access to it"
        )
    
    update_data = maintenance_in.dict(exclude_unset=True)
    
    # Prevent regular users from changing organization_id
    if not current_user.is_superuser and "organization_id" in update_data:
        del update_data["organization_id"]
    
    for field, value in update_data.items():
        setattr(maintenance, field, value)
    
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.delete("/{maintenance_id}", response_model=Maintenance)
def delete_maintenance(
    *, 
    db: Session = Depends(get_db), 
    maintenance_id: int, 
    current_user: UserModel = Depends(security.manager_or_admin())
):
    """Delete a maintenance if user has access to it."""
    query = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(MaintenanceModel.organization_id == current_user.organization_id)
    
    maintenance = query.first()
    if not maintenance:
        raise HTTPException(
            status_code=404, 
            detail="The maintenance with this ID does not exist or you don't have access to it"
        )
    
    db.delete(maintenance)
    db.commit()
    return maintenance

# Public endpoint for active and recent maintenances
@router.get("/public/active", response_model=List[Maintenance])
def get_active_maintenances(db: Session = Depends(get_db)):
    """Public endpoint - returns all active maintenances across organizations."""
    now = datetime.utcnow()
    recent_window = now - timedelta(days=7)
    maintenances = db.query(MaintenanceModel).filter(
        (MaintenanceModel.is_active == True) |
        (MaintenanceModel.scheduled_end >= recent_window)
    ).order_by(MaintenanceModel.scheduled_start.desc()).all()
    return maintenances 