from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.service import ServiceStatus

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ServiceStatus = ServiceStatus.OPERATIONAL
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    status: Optional[ServiceStatus] = None
    is_active: Optional[bool] = None

class ServiceInDBBase(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Service(ServiceInDBBase):
    pass 