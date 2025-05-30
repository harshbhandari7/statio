from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core import security
from app.db.session import get_db
from app.schemas.incident import (
    Incident,
    IncidentCreate,
    IncidentUpdate,
    IncidentUpdate as IncidentUpdateSchema,
    IncidentUpdateCreate,
)
from app.models.incident import IncidentModel, IncidentUpdateModel
from app.models.user import UserModel

router = APIRouter()

@router.get("/", response_model=List[Incident])
def read_incidents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    incidents = db.query(IncidentModel).offset(skip).limit(limit).all()
    return incidents

@router.post("/", response_model=Incident)
def create_incident(
    *,
    db: Session = Depends(get_db),
    incident_in: IncidentCreate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    incident = IncidentModel(**incident_in.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/{incident_id}", response_model=Incident)
def read_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return incident

@router.put("/{incident_id}", response_model=Incident)
def update_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    incident_in: IncidentUpdate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    
    for field, value in incident_in.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)
    
    if incident_in.status == "resolved":
        incident.resolved_at = datetime.utcnow()
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{incident_id}/updates", response_model=IncidentUpdateSchema)
def create_incident_update(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    update_in: IncidentUpdateCreate,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    
    update = IncidentUpdateModel(
        incident_id=incident_id,
        message=update_in.message,
        status=update_in.status,
    )
    
    if update_in.status:
        incident.status = update_in.status
        if update_in.status == "resolved":
            incident.resolved_at = datetime.utcnow()
    
    db.add(update)
    db.add(incident)
    db.commit()
    db.refresh(update)
    return update

@router.get("/{incident_id}/updates", response_model=List[IncidentUpdateSchema])
def read_incident_updates(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.get_current_user),
) -> Any:
    updates = db.query(IncidentUpdateModel).filter(
        IncidentUpdateModel.incident_id == incident_id
    ).all()
    return updates 