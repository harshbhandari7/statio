from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class UptimeMetric(Base):
    __tablename__ = "uptime_metrics"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), nullable=False)  # operational, degraded, partial_outage, outage
    response_time = Column(Float, nullable=True)  # in milliseconds
    is_up = Column(Boolean, nullable=False, default=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Relationships
    service = relationship("ServiceModel", back_populates="uptime_metrics")
    organization = relationship("OrganizationModel")

class UptimeReport(Base):
    __tablename__ = "uptime_reports"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Time period
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Metrics
    uptime_percentage = Column(Float, nullable=False)  # 0.0 to 100.0
    total_downtime_minutes = Column(Integer, nullable=False, default=0)
    total_incidents = Column(Integer, nullable=False, default=0)
    avg_response_time = Column(Float, nullable=True)
    
    # Additional metadata
    generated_at = Column(DateTime, default=datetime.utcnow)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Relationships
    service = relationship("ServiceModel")
    organization = relationship("OrganizationModel") 