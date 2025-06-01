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
    IncidentUpdateCreate,
    IncidentUpdateInDB as IncidentUpdateSchema,
)
from app.models.incident import IncidentModel, IncidentUpdateModel
from app.models.user import UserModel

router = APIRouter()

@router.get("/", response_model=List[Incident])
def read_incidents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    incidents = db.query(IncidentModel).offset(skip).limit(limit).all()
    return incidents

@router.post("/", response_model=Incident)
def create_incident(
    *,
    db: Session = Depends(get_db),
    incident_in: IncidentCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    incident = IncidentModel(**incident_in.dict())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/{incident_id}", response_model=Incident)
def read_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist in the system",
        )
    return incident

@router.put("/{incident_id}", response_model=Incident)
def update_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    incident_in: IncidentUpdate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist in the system",
        )
    
    update_data = incident_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
    
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
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist in the system",
        )
    
    # Create the update
    update = IncidentUpdateModel(
        incident_id=incident_id,
        message=update_in.message,
        status=update_in.status
    )
    db.add(update)
    
    # Update the incident status if provided in the update
    if update_in.status:
        incident.status = update_in.status
        db.add(incident)
    
    db.commit()
    db.refresh(update)
    return update

@router.get("/{incident_id}/updates", response_model=List[IncidentUpdateSchema])
def read_incident_updates(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    updates = db.query(IncidentUpdateModel).filter(IncidentUpdateModel.incident_id == incident_id).all()
    return updates