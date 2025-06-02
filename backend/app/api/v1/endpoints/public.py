# backend/app/api/v1/endpoints/public.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db.session import get_db
from app.models.service import ServiceModel
from app.models.incident import IncidentModel, IncidentUpdateModel
from app.models.maintenance import MaintenanceModel

from app.schemas.service import StatusOverview, TimelineEvent, Service as ServiceSchema
from app.schemas.incident import Incident as IncidentSchema
from app.schemas.maintenance import Maintenance as MaintenanceSchema

router = APIRouter()

@router.get("/status", response_model=StatusOverview)
def get_public_status(db: Session = Depends(get_db)):
    """
    Get the current status of all services, active incidents, 
    active/recent maintenances, and a timeline of recent events.
    This endpoint is public and does not require authentication.
    """
    # Get all active services with optimized query
    services = db.query(ServiceModel).filter(ServiceModel.is_active == True).all()
    
    # Get active incidents with their related service and updates
    incidents = (
        db.query(IncidentModel)
        .options(
            joinedload(IncidentModel.service),
            joinedload(IncidentModel.updates)
        )
        .filter(IncidentModel.is_active == True)
        .order_by(IncidentModel.created_at.desc())
        .all()
    )
    
    # Get active and recent maintenances with their related service
    now = datetime.utcnow()
    recent_window = now - timedelta(days=7)
    maintenances = (
        db.query(MaintenanceModel)
        .options(joinedload(MaintenanceModel.service))
        .filter(
            (MaintenanceModel.is_active == True) |
            (MaintenanceModel.scheduled_end >= recent_window)
        )
        .order_by(MaintenanceModel.scheduled_start.desc())
        .all()
    )
    
    # Build timeline with more detailed information
    timeline = []
    
    # Add incidents to timeline with more details
    for incident in incidents:
        timeline.append({
            "type": "incident",
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "timestamp": incident.created_at,
            "service_id": incident.service_id,
            "service_name": incident.service.name if incident.service else None,
        })
        
        # Add the most recent update for each incident if available
        if incident.updates and len(incident.updates) > 0:
            latest_update = sorted(incident.updates, key=lambda x: x.created_at, reverse=True)[0]
            timeline.append({
                "type": "incident_update",
                "id": latest_update.id,
                "title": f"Update: {incident.title}",
                "description": latest_update.message,
                "status": latest_update.status,
                "timestamp": latest_update.created_at,
                "service_id": incident.service_id,
                "service_name": incident.service.name if incident.service else None,
                "parent_id": incident.id,
            })
    
    # Add maintenances to timeline
    for maintenance in maintenances:
        timeline.append({
            "type": "maintenance",
            "id": maintenance.id,
            "title": maintenance.title,
            "description": maintenance.description,
            "status": maintenance.status,
            "timestamp": maintenance.scheduled_start,
            "service_id": maintenance.service_id,
            "service_name": maintenance.service.name if maintenance.service else None,
            "end_time": maintenance.scheduled_end,
        })
    
    # Sort timeline by timestamp (newest first) and limit to 30 items
    timeline = sorted(timeline, key=lambda x: x["timestamp"], reverse=True)[:30]
    
    # Calculate overall system status based on service statuses
    overall_status = calculate_overall_status(services)
    
    # Return the complete status overview
    return {
        "services": services,
        "incidents": incidents,
        "maintenances": maintenances,
        "timeline": timeline,
        "overall_status": overall_status,
        "last_updated": datetime.utcnow(),
    }

@router.get("/services", response_model=List[ServiceSchema])
def get_public_services(db: Session = Depends(get_db)):
    """
    Get all active services with their current status.
    This endpoint is public and does not require authentication.
    """
    services = db.query(ServiceModel).filter(ServiceModel.is_active == True).all()
    return services

@router.get("/services/{service_id}", response_model=ServiceSchema)
def get_public_service_by_id(service_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific service by ID.
    This endpoint is public and does not require authentication.
    """
    service = db.query(ServiceModel).filter(
        ServiceModel.id == service_id,
        ServiceModel.is_active == True
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service

@router.get("/incidents/active", response_model=List[IncidentSchema])
def get_public_active_incidents(db: Session = Depends(get_db)):
    """
    Get all active incidents with their related service and updates.
    This endpoint is public and does not require authentication.
    """
    incidents = (
        db.query(IncidentModel)
        .options(
            joinedload(IncidentModel.service),
            joinedload(IncidentModel.updates)
        )
        .filter(IncidentModel.is_active == True)
        .order_by(IncidentModel.created_at.desc())
        .all()
    )
    return incidents

@router.get("/incidents/{incident_id}", response_model=IncidentSchema)
def get_public_incident_by_id(incident_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific incident by ID, including all its updates.
    This endpoint is public and does not require authentication.
    """
    incident = (
        db.query(IncidentModel)
        .options(
            joinedload(IncidentModel.service),
            joinedload(IncidentModel.updates)
        )
        .filter(IncidentModel.id == incident_id)
        .first()
    )
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident

@router.get("/maintenances/active", response_model=List[MaintenanceSchema])
def get_public_active_maintenances(db: Session = Depends(get_db)):
    """
    Get all active and upcoming maintenances with their related service.
    This endpoint is public and does not require authentication.
    """
    now = datetime.utcnow()
    maintenances = (
        db.query(MaintenanceModel)
        .options(joinedload(MaintenanceModel.service))
        .filter(
            (MaintenanceModel.is_active == True) &
            (MaintenanceModel.scheduled_end >= now)
        )
        .order_by(MaintenanceModel.scheduled_start.asc())
        .all()
    )
    return maintenances

@router.get("/maintenances/{maintenance_id}", response_model=MaintenanceSchema)
def get_public_maintenance_by_id(maintenance_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific maintenance by ID.
    This endpoint is public and does not require authentication.
    """
    maintenance = (
        db.query(MaintenanceModel)
        .options(joinedload(MaintenanceModel.service))
        .filter(MaintenanceModel.id == maintenance_id)
        .first()
    )
    
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    
    return maintenance

@router.get("/timeline", response_model=List[TimelineEvent])
def get_public_timeline(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get a paginated timeline of recent events (incidents, maintenances, service status changes).
    This endpoint is public and does not require authentication.
    
    Parameters:
    - skip: Number of items to skip (for pagination)
    - limit: Maximum number of items to return (max 100)
    """
    # Get the data needed for the timeline
    now = datetime.utcnow()
    recent_window = now - timedelta(days=30)  # Extend window to 30 days for timeline
    
    # Get active incidents with their related service and updates
    incidents = (
        db.query(IncidentModel)
        .options(joinedload(IncidentModel.service))
        .filter(IncidentModel.created_at >= recent_window)
        .all()
    )
    
    # Get incident updates
    incident_updates = (
        db.query(IncidentUpdateModel)
        .join(IncidentModel)
        .options(joinedload(IncidentUpdateModel.incident))
        .filter(IncidentUpdateModel.created_at >= recent_window)
        .all()
    )
    
    # Get active and recent maintenances
    maintenances = (
        db.query(MaintenanceModel)
        .options(joinedload(MaintenanceModel.service))
        .filter(
            (MaintenanceModel.scheduled_start >= recent_window) |
            (MaintenanceModel.scheduled_end >= recent_window)
        )
        .all()
    )
    
    # Get services with status changes
    services = (
        db.query(ServiceModel)
        .filter(ServiceModel.updated_at >= recent_window)
        .all()
    )
    
    # Build timeline
    timeline = []
    
    # Add incidents to timeline
    for incident in incidents:
        timeline.append({
            "type": "incident",
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "timestamp": incident.created_at,
            "service_id": incident.service_id,
            "service_name": incident.service.name if incident.service else None,
        })
    
    # Add incident updates to timeline
    for update in incident_updates:
        if update.incident:
            timeline.append({
                "type": "incident_update",
                "id": update.id,
                "title": f"Update: {update.incident.title}",
                "description": update.message,
                "status": update.status,
                "timestamp": update.created_at,
                "service_id": update.incident.service_id,
                "service_name": update.incident.service.name if update.incident.service else None,
                "parent_id": update.incident_id,
            })
    
    # Add maintenances to timeline
    for maintenance in maintenances:
        timeline.append({
            "type": "maintenance",
            "id": maintenance.id,
            "title": maintenance.title,
            "description": maintenance.description,
            "status": maintenance.status,
            "timestamp": maintenance.scheduled_start,
            "service_id": maintenance.service_id,
            "service_name": maintenance.service.name if maintenance.service else None,
            "end_time": maintenance.scheduled_end,
        })
    
    # Sort timeline by timestamp (newest first)
    timeline = sorted(timeline, key=lambda x: x["timestamp"], reverse=True)
    
    # Apply pagination
    paginated_timeline = timeline[skip:skip+limit]
    
    return paginated_timeline

def calculate_overall_status(services: List[ServiceModel]) -> str:
    """
    Calculate the overall system status based on the status of all services.
    Returns one of: operational, degraded, partial_outage, major_outage, maintenance
    """
    if not services:
        return "unknown"
    
    status_counts = {
        "operational": 0,
        "degraded": 0,
        "partial_outage": 0,
        "major_outage": 0,
        "maintenance": 0
    }
    
    for service in services:
        if service.status in status_counts:
            status_counts[service.status] += 1
    
    # Determine overall status based on the most severe status
    if status_counts["major_outage"] > 0:
        return "major_outage"
    elif status_counts["partial_outage"] > 0:
        return "partial_outage"
    elif status_counts["degraded"] > 0:
        return "degraded"
    elif status_counts["maintenance"] > 0:
        return "maintenance"
    else:
        return "operational"
