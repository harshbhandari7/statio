from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
import random

from app.core import security
from app.db.session import get_db
from app.schemas.uptime import (
    UptimeMetric, UptimeMetricCreate, UptimeReport, UptimeStats, 
    UptimeGraphData, UptimeMetricsResponse
)
from app.models.uptime import UptimeMetric as UptimeMetricModel, UptimeReport as UptimeReportModel
from app.models.service import ServiceModel
from app.models.incident import IncidentModel
from app.models.user import UserModel

router = APIRouter()

@router.get("/services/{service_id}/metrics", response_model=UptimeMetricsResponse)
def get_service_uptime_metrics(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    period: str = Query("7d", regex="^(24h|7d|30d)$"),
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    """Get uptime metrics and graph data for a specific service."""
    
    # Verify user has access to this service
    service_query = db.query(ServiceModel).filter(ServiceModel.id == service_id)
    if not current_user.is_superuser:
        service_query = service_query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    service = service_query.first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Calculate time range
    now = datetime.utcnow()
    if period == "24h":
        start_time = now - timedelta(hours=24)
        data_points = 24  # Hourly data points
        interval = timedelta(hours=1)
    elif period == "7d":
        start_time = now - timedelta(days=7)
        data_points = 7 * 24  # Hourly data points for 7 days
        interval = timedelta(hours=1)
    else:  # 30d
        start_time = now - timedelta(days=30)
        data_points = 30  # Daily data points
        interval = timedelta(days=1)
    
    # Generate realistic uptime data (in production, this would come from actual monitoring)
    graph_data = []
    current_time = start_time
    
    while current_time <= now:
        # Simulate realistic uptime data based on service status
        base_uptime = {
            "operational": 99.9,
            "degraded": 95.0,
            "partial_outage": 75.0,
            "major_outage": 20.0,
            "maintenance": 0.0
        }.get(service.status.value, 99.9)
        
        # Add some realistic variance
        variance = random.uniform(-2.0, 2.0)
        uptime_percentage = max(0.0, min(100.0, base_uptime + variance))
        
        # Generate response time data
        base_response_time = {
            "operational": 150,
            "degraded": 500,
            "partial_outage": 1500,
            "major_outage": 5000,
            "maintenance": None
        }.get(service.status.value, 150)
        
        response_time = None
        if base_response_time:
            response_time = base_response_time + random.uniform(-50, 200)
        
        graph_data.append(UptimeGraphData(
            timestamp=current_time,
            uptime_percentage=uptime_percentage,
            status=service.status.value,
            response_time=response_time
        ))
        
        current_time += interval
    
    # Calculate uptime statistics
    recent_24h = [dp for dp in graph_data if dp.timestamp >= now - timedelta(hours=24)]
    recent_7d = [dp for dp in graph_data if dp.timestamp >= now - timedelta(days=7)]
    recent_30d = graph_data  # All data is within 30 days
    
    def calc_avg_uptime(data_points: List[UptimeGraphData]) -> float:
        if not data_points:
            return 100.0
        return sum(dp.uptime_percentage for dp in data_points) / len(data_points)
    
    def calc_avg_response_time(data_points: List[UptimeGraphData]) -> Optional[float]:
        response_times = [dp.response_time for dp in data_points if dp.response_time is not None]
        if not response_times:
            return None
        return sum(response_times) / len(response_times)
    
    # Count incidents (simplified - in production would be more sophisticated)
    incidents_24h = db.query(IncidentModel).filter(
        and_(
            IncidentModel.service_id == service_id,
            IncidentModel.created_at >= now - timedelta(hours=24)
        )
    ).count()
    
    incidents_7d = db.query(IncidentModel).filter(
        and_(
            IncidentModel.service_id == service_id,
            IncidentModel.created_at >= now - timedelta(days=7)
        )
    ).count()
    
    incidents_30d = db.query(IncidentModel).filter(
        and_(
            IncidentModel.service_id == service_id,
            IncidentModel.created_at >= now - timedelta(days=30)
        )
    ).count()
    
    # Get last incident
    last_incident = db.query(IncidentModel).filter(
        IncidentModel.service_id == service_id
    ).order_by(desc(IncidentModel.created_at)).first()
    
    current_stats = UptimeStats(
        service_id=service.id,
        service_name=service.name,
        current_uptime_percentage=calc_avg_uptime(recent_24h),
        uptime_24h=calc_avg_uptime(recent_24h),
        uptime_7d=calc_avg_uptime(recent_7d),
        uptime_30d=calc_avg_uptime(recent_30d),
        avg_response_time=calc_avg_response_time(recent_24h),
        total_incidents_24h=incidents_24h,
        total_incidents_7d=incidents_7d,
        total_incidents_30d=incidents_30d,
        current_status=service.status.value,
        last_incident=last_incident.created_at if last_incident else None
    )
    
    return UptimeMetricsResponse(
        service_id=service.id,
        service_name=service.name,
        current_stats=current_stats,
        graph_data=graph_data,
        period=period
    )

@router.get("/overview", response_model=List[UptimeStats])
def get_uptime_overview(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(security.all_authenticated_users()),
) -> Any:
    """Get uptime overview for all services in the organization."""
    
    # Get all services for the user's organization
    services_query = db.query(ServiceModel).filter(ServiceModel.is_active == True)
    if not current_user.is_superuser:
        services_query = services_query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    services = services_query.all()
    
    overview_stats = []
    now = datetime.utcnow()
    
    for service in services:
        # Count incidents for different periods
        incidents_24h = db.query(IncidentModel).filter(
            and_(
                IncidentModel.service_id == service.id,
                IncidentModel.created_at >= now - timedelta(hours=24)
            )
        ).count()
        
        incidents_7d = db.query(IncidentModel).filter(
            and_(
                IncidentModel.service_id == service.id,
                IncidentModel.created_at >= now - timedelta(days=7)
            )
        ).count()
        
        incidents_30d = db.query(IncidentModel).filter(
            and_(
                IncidentModel.service_id == service.id,
                IncidentModel.created_at >= now - timedelta(days=30)
            )
        ).count()
        
        # Calculate uptime based on service status and incidents
        base_uptime = {
            "operational": 99.9,
            "degraded": 95.0,
            "partial_outage": 75.0,
            "major_outage": 20.0,
            "maintenance": 0.0
        }.get(service.status.value, 99.9)
        
        # Adjust for incidents (simplified calculation)
        uptime_24h = max(0.0, base_uptime - (incidents_24h * 2.0))
        uptime_7d = max(0.0, base_uptime - (incidents_7d * 1.0))
        uptime_30d = max(0.0, base_uptime - (incidents_30d * 0.5))
        
        # Get last incident
        last_incident = db.query(IncidentModel).filter(
            IncidentModel.service_id == service.id
        ).order_by(desc(IncidentModel.created_at)).first()
        
        # Generate realistic response time
        base_response_time = {
            "operational": 150,
            "degraded": 500,
            "partial_outage": 1500,
            "major_outage": 5000,
            "maintenance": None
        }.get(service.status.value, 150)
        
        overview_stats.append(UptimeStats(
            service_id=service.id,
            service_name=service.name,
            current_uptime_percentage=uptime_24h,
            uptime_24h=uptime_24h,
            uptime_7d=uptime_7d,
            uptime_30d=uptime_30d,
            avg_response_time=base_response_time,
            total_incidents_24h=incidents_24h,
            total_incidents_7d=incidents_7d,
            total_incidents_30d=incidents_30d,
            current_status=service.status.value,
            last_incident=last_incident.created_at if last_incident else None
        ))
    
    return overview_stats

@router.post("/services/{service_id}/record-metric")
async def record_uptime_metric(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    metric_in: UptimeMetricCreate,
    current_user: UserModel = Depends(security.manager_or_admin()),
) -> Any:
    """Record a new uptime metric for a service (used by monitoring systems)."""
    
    # Verify user has access to this service
    service_query = db.query(ServiceModel).filter(ServiceModel.id == service_id)
    if not current_user.is_superuser:
        service_query = service_query.filter(ServiceModel.organization_id == current_user.organization_id)
    
    service = service_query.first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Create uptime metric
    metric_data = metric_in.dict()
    metric_data["service_id"] = service_id
    
    metric = UptimeMetricModel(**metric_data)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    
    return {"message": "Uptime metric recorded successfully", "metric_id": metric.id} 