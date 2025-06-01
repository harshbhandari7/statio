# backend/app/api/v1/endpoints/status.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db.session import get_db
from app.models.service import ServiceModel
from app.models.incident import IncidentModel
from app.models.maintenance import MaintenanceModel

from app.schemas.service import StatusOverview, TimelineEvent

router = APIRouter()

@router.get("/status", response_model=StatusOverview)
def get_status(db: Session = Depends(get_db)):
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
    
    # Add service status changes to timeline
    for service in services:
        if service.updated_at and service.updated_at >= recent_window:
            timeline.append({
                "type": "service_status_change",
                "id": service.id,
                "title": service.name,
                "description": f"Status changed to {service.status}",
                "status": service.status,
                "timestamp": service.updated_at,
                "service_id": service.id,
                "service_name": service.name,
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