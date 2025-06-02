from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base

class IncidentStatus(str, enum.Enum):
    INVESTIGATING = "investigating"
    IDENTIFIED = "identified"
    MONITORING = "monitoring"
    RESOLVED = "resolved"

class IncidentType(str, enum.Enum):
    INCIDENT = "incident"
    MAINTENANCE = "maintenance"

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.INVESTIGATING)
    type = Column(Enum(IncidentType), default=IncidentType.INCIDENT)
    service_id = Column(Integer, ForeignKey("services.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))

    service = relationship("ServiceModel", back_populates="incidents")
    organization = relationship("OrganizationModel", back_populates="incidents")
    updates = relationship("IncidentUpdateModel", back_populates="incident")

class IncidentUpdateModel(Base):
    __tablename__ = "incident_updates"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(IncidentStatus))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    incident = relationship("IncidentModel", back_populates="updates")
    organization = relationship("OrganizationModel", back_populates="incident_updates") 