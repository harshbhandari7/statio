from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.incident import IncidentStatus, IncidentType

class IncidentUpdateBase(BaseModel):
    message: str
    status: Optional[IncidentStatus] = None
    organization_id: Optional[int] = None

class IncidentUpdateCreate(IncidentUpdateBase):
    pass

class IncidentUpdateInDB(IncidentUpdateBase):
    id: int
    incident_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: IncidentStatus = IncidentStatus.INVESTIGATING
    type: IncidentType = IncidentType.INCIDENT
    service_id: int
    organization_id: Optional[int] = None
    is_active: bool = True

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(IncidentBase):
    title: Optional[str] = None
    status: Optional[IncidentStatus] = None
    type: Optional[IncidentType] = None
    service_id: Optional[int] = None
    organization_id: Optional[int] = None
    is_active: Optional[bool] = None

class IncidentInDBBase(IncidentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    updates: List[IncidentUpdateInDB] = []

    class Config:
        from_attributes = True

class Incident(IncidentInDBBase):
    pass