from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class OrganizationModel(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("UserModel", back_populates="organization")
    services = relationship("ServiceModel", back_populates="organization")
    incidents = relationship("IncidentModel", back_populates="organization")
    incident_updates = relationship("IncidentUpdateModel", back_populates="organization")
    maintenances = relationship("MaintenanceModel", back_populates="organization")
