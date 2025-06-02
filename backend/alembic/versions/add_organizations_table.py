"""add_organizations_table

Revision ID: 7a4b8c9d0e1f
Revises: d7499849413d
Create Date: 2025-06-02 16:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a4b8c9d0e1f'
down_revision = 'd7499849413d'
branch_labels = None
depends_on = None


def upgrade():
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    
    # Add organization_id column to users table
    op.add_column('users', sa.Column('organization_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_users_organization_id',
        'users',
        'organizations',
        ['organization_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_users_organization_id', 'users', type_='foreignkey')
    
    # Drop organization_id column from users table
    op.drop_column('users', 'organization_id')
    
    # Drop organizations table
    op.drop_table('organizations')
