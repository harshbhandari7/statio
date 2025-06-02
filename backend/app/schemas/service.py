from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from app.models.service import ServiceStatus
from app.schemas.incident import Incident
from app.schemas.maintenance import Maintenance

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ServiceStatus = ServiceStatus.OPERATIONAL
    organization_id: Optional[int] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    status: Optional[ServiceStatus] = None
    organization_id: Optional[int] = None
    is_active: Optional[bool] = None

class ServiceInDBBase(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Service(ServiceInDBBase):
    pass

class TimelineEvent(BaseModel):
    type: str
    id: int
    title: str
    description: Optional[str] = None
    status: Optional[str] = "unknown"
    timestamp: datetime
    service_id: Optional[int] = None
    service_name: Optional[str] = None
    parent_id: Optional[int] = None
    end_time: Optional[datetime] = None

class StatusOverview(BaseModel):
    services: List[Service]
    incidents: List[Incident]
    maintenances: List[Maintenance]
    timeline: List[TimelineEvent]
    overall_status: str
    last_updated: datetime