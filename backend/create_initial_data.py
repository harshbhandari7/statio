#!/usr/bin/env python
"""
Script to create initial data for the Statio application.
Run this after deployment to set up sample organizations and services.
"""
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import UserModel, UserRole
from app.models.organization import OrganizationModel
from app.models.service import ServiceModel, ServiceStatus
from app.models.incident import IncidentModel, IncidentSeverity, IncidentStatus
from app.models.maintenance import MaintenanceModel

def create_initial_data():
    """Create initial organizations, services, and sample data."""
    db = SessionLocal()
    try:
        # Check if we already have data
        if db.query(OrganizationModel).count() > 0:
            print("Initial data already exists. Skipping...")
            return
        
        print("Creating initial data...")
        
        # Create a default organization
        default_org = OrganizationModel(
            name="Default Organization",
            slug="default",
            description="Default organization for Statio",
            is_active=True
        )
        db.add(default_org)
        db.commit()
        db.refresh(default_org)
        
        # Create sample services
        services = [
            {
                "name": "Main Website",
                "description": "Primary customer-facing website",
                "url": "https://example.com",
                "status": ServiceStatus.OPERATIONAL,
                "organization_id": default_org.id
            },
            {
                "name": "API Gateway",
                "description": "Main API gateway service",
                "url": "https://api.example.com",
                "status": ServiceStatus.OPERATIONAL,
                "organization_id": default_org.id
            },
            {
                "name": "Database",
                "description": "Primary database service",
                "url": "https://db.example.com",
                "status": ServiceStatus.OPERATIONAL,
                "organization_id": default_org.id
            },
            {
                "name": "CDN",
                "description": "Content delivery network",
                "url": "https://cdn.example.com",
                "status": ServiceStatus.OPERATIONAL,
                "organization_id": default_org.id
            }
        ]
        
        for service_data in services:
            service = ServiceModel(**service_data)
            db.add(service)
        
        db.commit()
        
        # Create a sample incident
        sample_incident = IncidentModel(
            title="Scheduled Database Maintenance",
            description="Routine database maintenance to improve performance",
            severity=IncidentSeverity.MEDIUM,
            status=IncidentStatus.RESOLVED,
            service_id=3,  # Database service
            organization_id=default_org.id,
            is_active=False,
            created_at=datetime.utcnow() - timedelta(days=2),
            resolved_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(sample_incident)
        
        # Create a sample maintenance
        sample_maintenance = MaintenanceModel(
            title="System Upgrade",
            description="Upgrading system components for better performance",
            scheduled_start=datetime.utcnow() + timedelta(days=7),
            scheduled_end=datetime.utcnow() + timedelta(days=7, hours=2),
            service_id=1,  # Main Website
            organization_id=default_org.id,
            is_active=True
        )
        db.add(sample_maintenance)
        
        db.commit()
        
        print("Initial data created successfully!")
        print(f"- Created organization: {default_org.name}")
        print(f"- Created {len(services)} services")
        print("- Created sample incident and maintenance")
        
    except Exception as e:
        print(f"Error creating initial data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data() 