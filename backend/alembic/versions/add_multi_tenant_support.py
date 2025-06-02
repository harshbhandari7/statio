"""Add multi-tenant support - organization_id to services, incidents, maintenances

Revision ID: add_multi_tenant_support
Revises: 7a4b8c9d0e1f
Create Date: 2024-12-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_multi_tenant_support'
down_revision = '7a4b8c9d0e1f'
branch_labels = None
depends_on = None

def upgrade():
    # Add organization_id to services table
    op.add_column('services', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_services_organization_id', 'services', 'organizations', ['organization_id'], ['id'])
    
    # Add organization_id to incidents table
    op.add_column('incidents', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_incidents_organization_id', 'incidents', 'organizations', ['organization_id'], ['id'])
    
    # Add organization_id to maintenances table (if it exists)
    try:
        op.add_column('maintenances', sa.Column('organization_id', sa.Integer(), nullable=True))
        op.create_foreign_key('fk_maintenances_organization_id', 'maintenances', 'organizations', ['organization_id'], ['id'])
    except:
        # Table might not exist yet
        pass

def downgrade():
    # Remove foreign key constraints and columns
    try:
        op.drop_constraint('fk_maintenances_organization_id', 'maintenances', type_='foreignkey')
        op.drop_column('maintenances', 'organization_id')
    except:
        pass
        
    op.drop_constraint('fk_incidents_organization_id', 'incidents', type_='foreignkey')
    op.drop_column('incidents', 'organization_id')
    
    op.drop_constraint('fk_services_organization_id', 'services', type_='foreignkey')
    op.drop_column('services', 'organization_id') 