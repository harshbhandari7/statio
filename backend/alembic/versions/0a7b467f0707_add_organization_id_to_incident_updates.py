"""add_organization_id_to_incident_updates

Revision ID: 0a7b467f0707
Revises: add_multi_tenant_support
Create Date: 2025-06-02 21:51:15.978548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0a7b467f0707'
down_revision: Union[str, None] = 'add_multi_tenant_support'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add organization_id to incident_updates table
    op.add_column('incident_updates', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_incident_updates_organization_id', 'incident_updates', 'organizations', ['organization_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remove foreign key constraint and column
    op.drop_constraint('fk_incident_updates_organization_id', 'incident_updates', type_='foreignkey')
    op.drop_column('incident_updates', 'organization_id')
