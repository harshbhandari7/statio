from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MaintenanceBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "scheduled"
    scheduled_start: datetime
    scheduled_end: datetime
    organization_id: Optional[int] = None
    is_active: bool = True
    service_id: int

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(MaintenanceBase):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    organization_id: Optional[int] = None
    is_active: Optional[bool] = None
    service_id: Optional[int] = None

class MaintenanceInDBBase(MaintenanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Maintenance(MaintenanceInDBBase):
    pass 