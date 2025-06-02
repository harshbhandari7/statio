from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UptimeMetricBase(BaseModel):
    service_id: int
    status: str
    response_time: Optional[float] = None
    is_up: bool = True
    organization_id: int

class UptimeMetricCreate(UptimeMetricBase):
    pass

class UptimeMetric(UptimeMetricBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class UptimeReportBase(BaseModel):
    service_id: int
    organization_id: int
    start_date: datetime
    end_date: datetime
    uptime_percentage: float
    total_downtime_minutes: int = 0
    total_incidents: int = 0
    avg_response_time: Optional[float] = None
    period_type: str

class UptimeReportCreate(UptimeReportBase):
    pass

class UptimeReport(UptimeReportBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True

class UptimeStats(BaseModel):
    service_id: int
    service_name: str
    current_uptime_percentage: float
    uptime_24h: float
    uptime_7d: float
    uptime_30d: float
    avg_response_time: Optional[float] = None
    total_incidents_24h: int = 0
    total_incidents_7d: int = 0
    total_incidents_30d: int = 0
    current_status: str
    last_incident: Optional[datetime] = None

class UptimeGraphData(BaseModel):
    timestamp: datetime
    uptime_percentage: float
    status: str
    response_time: Optional[float] = None

class UptimeMetricsResponse(BaseModel):
    service_id: int
    service_name: str
    current_stats: UptimeStats
    graph_data: List[UptimeGraphData]
    period: str  # "24h", "7d", "30d" 