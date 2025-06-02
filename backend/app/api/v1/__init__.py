from fastapi import APIRouter
from app.api.v1.endpoints import users, services, incidents, maintenances, status, public, organizations, uptime

api_router = APIRouter()

# Protected routes (require authentication)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(maintenances.router, prefix="/maintenances", tags=["maintenances"])
api_router.include_router(uptime.router, prefix="/uptime", tags=["uptime"])
api_router.include_router(status.router, tags=["status"])

# Public routes (no authentication required)
api_router.include_router(public.router, prefix="/public", tags=["public"])
