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
def read_maintenances(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: UserModel = Depends(security.get_current_user)):
    return db.query(MaintenanceModel).offset(skip).limit(limit).all()

@router.post("/", response_model=Maintenance)
def create_maintenance(*, db: Session = Depends(get_db), maintenance_in: MaintenanceCreate, current_user: UserModel = Depends(security.get_current_user)):
    maintenance = MaintenanceModel(**maintenance_in.model_dump())
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.get("/{maintenance_id}", response_model=Maintenance)
def read_maintenance(*, db: Session = Depends(get_db), maintenance_id: int, current_user: UserModel = Depends(security.get_current_user)):
    maintenance = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return maintenance

@router.put("/{maintenance_id}", response_model=Maintenance)
def update_maintenance(*, db: Session = Depends(get_db), maintenance_id: int, maintenance_in: MaintenanceUpdate, current_user: UserModel = Depends(security.get_current_user)):
    maintenance = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    for field, value in maintenance_in.model_dump(exclude_unset=True).items():
        setattr(maintenance, field, value)
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.delete("/{maintenance_id}", response_model=Maintenance)
def delete_maintenance(*, db: Session = Depends(get_db), maintenance_id: int, current_user: UserModel = Depends(security.get_current_user)):
    maintenance = db.query(MaintenanceModel).filter(MaintenanceModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    db.delete(maintenance)
    db.commit()
    return maintenance

# Public endpoint for active and recent maintenances
@router.get("/public/active", response_model=List[Maintenance])
def get_active_maintenances(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    recent_window = now - timedelta(days=7)
    maintenances = db.query(MaintenanceModel).filter(
        (MaintenanceModel.is_active == True) |
        (MaintenanceModel.scheduled_end >= recent_window)
    ).order_by(MaintenanceModel.scheduled_start.desc()).all()
    return maintenances 