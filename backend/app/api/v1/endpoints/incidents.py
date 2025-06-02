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
    """Get incidents filtered by organization."""
    if current_user.is_superuser:
        # Superuser sees all incidents
        incidents = db.query(IncidentModel).offset(skip).limit(limit).all()
    else:
        # Regular users see only their organization's incidents
        incidents = (
            db.query(IncidentModel)
            .filter(IncidentModel.organization_id == current_user.organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return incidents

@router.post("/", response_model=Incident)
def create_incident(
    *,
    db: Session = Depends(get_db),
    incident_in: IncidentCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Create a new incident in the user's organization."""
    incident_data = incident_in.dict()
    
    # Set organization_id to current user's organization unless superuser specifies otherwise
    if not current_user.is_superuser:
        incident_data["organization_id"] = current_user.organization_id
    elif incident_data.get("organization_id") is None:
        incident_data["organization_id"] = current_user.organization_id
    
    incident = IncidentModel(**incident_data)
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
    """Get a specific incident if user has access to it."""
    query = db.query(IncidentModel).filter(IncidentModel.id == incident_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(IncidentModel.organization_id == current_user.organization_id)
    
    incident = query.first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist or you don't have access to it",
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
    """Update an incident if user has access to it."""
    query = db.query(IncidentModel).filter(IncidentModel.id == incident_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(IncidentModel.organization_id == current_user.organization_id)
    
    incident = query.first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist or you don't have access to it",
        )
    
    update_data = incident_in.dict(exclude_unset=True)
    
    # Prevent regular users from changing organization_id
    if not current_user.is_superuser and "organization_id" in update_data:
        del update_data["organization_id"]
    
    for field, value in update_data.items():
        setattr(incident, field, value)
    
    # Set resolved_at timestamp if status is resolved
    if incident.status.value == "resolved" and incident.resolved_at is None:
        incident.resolved_at = datetime.utcnow()
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    return incident

@router.delete("/{incident_id}", response_model=Incident)
def delete_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Delete an incident if user has access to it."""
    query = db.query(IncidentModel).filter(IncidentModel.id == incident_id)
    
    # Filter by organization unless superuser
    if not current_user.is_superuser:
        query = query.filter(IncidentModel.organization_id == current_user.organization_id)
    
    incident = query.first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist or you don't have access to it",
        )
    
    db.delete(incident)
    db.commit()
    return incident

@router.get("/{incident_id}/updates", response_model=List[IncidentUpdateSchema])
def read_incident_updates(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    """Get incident updates if user has access to the incident."""
    # First verify user has access to the incident
    incident_query = db.query(IncidentModel).filter(IncidentModel.id == incident_id)
    if not current_user.is_superuser:
        incident_query = incident_query.filter(IncidentModel.organization_id == current_user.organization_id)
    
    incident = incident_query.first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist or you don't have access to it",
        )
    
    updates = (
        db.query(IncidentUpdateModel)
        .filter(IncidentUpdateModel.incident_id == incident_id)
        .order_by(IncidentUpdateModel.created_at.desc())
        .all()
    )
    return updates

@router.post("/{incident_id}/updates", response_model=IncidentUpdateSchema)
def create_incident_update(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    update_in: IncidentUpdateCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Create an incident update if user has access to the incident."""
    # First verify user has access to the incident
    incident_query = db.query(IncidentModel).filter(IncidentModel.id == incident_id)
    if not current_user.is_superuser:
        incident_query = incident_query.filter(IncidentModel.organization_id == current_user.organization_id)
    
    incident = incident_query.first()
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="The incident with this ID does not exist or you don't have access to it",
        )
    
    update_data = update_in.dict()
    update_data["incident_id"] = incident_id
    update_data["organization_id"] = incident.organization_id
    
    incident_update = IncidentUpdateModel(**update_data)
    db.add(incident_update)
    
    # Update the incident status if provided
    if update_in.status:
        incident.status = update_in.status
        if update_in.status.value == "resolved" and incident.resolved_at is None:
            incident.resolved_at = datetime.utcnow()
        db.add(incident)
    
    db.commit()
    db.refresh(incident_update)
    
    return incident_update