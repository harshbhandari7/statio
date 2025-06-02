"""add_role_column_to_users

Revision ID: b4f2a9d7e521
Revises: 2b43a2c7a30e
Create Date: 2025-06-01 20:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b4f2a9d7e521'
down_revision = '2b43a2c7a30e'
branch_labels = None
depends_on = None


def upgrade():
    # Create the enum type first
    user_role = postgresql.ENUM('ADMIN', 'MANAGER', 'VIEWER', name='userrole')
    user_role.create(op.get_bind())
    
    # Add the role column with a default value of 'VIEWER'
    op.add_column('users', sa.Column('role', sa.Enum('ADMIN', 'MANAGER', 'VIEWER', name='userrole'), 
                                     nullable=False, server_default='VIEWER'))


def downgrade():
    # Drop the role column
    op.drop_column('users', 'role')
    
    # Drop the enum type
    op.execute('DROP TYPE userrole')
