from app.db.base_class import Base

# Import all models here for Alembic to detect them
from app.models.user import UserModel
from app.models.service import ServiceModel
from app.models.incident import IncidentModel, IncidentUpdateModel 
