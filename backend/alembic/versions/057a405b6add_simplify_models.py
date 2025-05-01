"""simplify_models

Revision ID: 057a405b6add
Revises: 
Create Date: 2024-05-01 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = '057a405b6add'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def drop_constraint_if_exists(table_name, constraint_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    for fk in inspector.get_foreign_keys(table_name):
        if fk['name'] == constraint_name:
            op.drop_constraint(constraint_name, table_name, type_='foreignkey')
            break

def drop_table_if_exists(table_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    if table_name in inspector.get_table_names():
        op.drop_table(table_name)

def upgrade() -> None:
    # Drop foreign key constraints if they exist
    drop_constraint_if_exists('routes', 'routes_agency_id_fkey')
    drop_constraint_if_exists('user_contributions', 'user_contributions_user_id_fkey')
    drop_constraint_if_exists('user_contributions', 'user_contributions_sighting_id_fkey')

    # Drop tables if they exist
    drop_table_if_exists('user_contributions')
    drop_table_if_exists('users')
    drop_table_if_exists('stop_times')
    drop_table_if_exists('trips')
    drop_table_if_exists('route_stats')
    drop_table_if_exists('agencies')
    
    # Remove columns from routes table
    with op.batch_alter_table('routes') as batch_op:
        for column in [
            'route_text_color',
            'agency_id',
            'route_desc',
            'is_circular',
            'route_color',
            'route_url'
        ]:
            batch_op.drop_column(column)
    
    # Remove columns from stops table
    with op.batch_alter_table('stops') as batch_op:
        for column in [
            'stop_desc',
            'stop_url',
            'zone_id',
            'parent_station',
            'location_type'
        ]:
            batch_op.drop_column(column)

def downgrade() -> None:
    # Add columns back to stops table
    with op.batch_alter_table('stops') as batch_op:
        batch_op.add_column(sa.Column('location_type', sa.INTEGER(), nullable=True))
        batch_op.add_column(sa.Column('parent_station', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('zone_id', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('stop_url', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('stop_desc', sa.VARCHAR(), nullable=True))

    # Add columns back to routes table
    with op.batch_alter_table('routes') as batch_op:
        batch_op.add_column(sa.Column('route_url', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('route_color', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('is_circular', sa.BOOLEAN(), nullable=True))
        batch_op.add_column(sa.Column('route_desc', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('agency_id', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('route_text_color', sa.VARCHAR(), nullable=True))

    # Recreate tables in correct order
    op.create_table('agencies',
        sa.Column('agency_id', sa.String(), nullable=False),
        sa.Column('agency_name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('agency_id')
    )
    
    # Create other tables and constraints only if we need to roll back
    tables = {
        'route_stats': [
            sa.Column('route_id', sa.String(), nullable=False),
            sa.Column('last_seen', sa.DateTime(timezone=True), nullable=True),
        ],
        'trips': [
            sa.Column('trip_id', sa.String(), nullable=False),
            sa.Column('route_id', sa.String(), nullable=False),
        ],
        'stop_times': [
            sa.Column('trip_id', sa.String(), nullable=False),
            sa.Column('stop_id', sa.String(), nullable=False),
            sa.Column('arrival_time', sa.Time(), nullable=True),
        ],
        'users': [
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
        ],
        'user_contributions': [
            sa.Column('contribution_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('sighting_id', sa.Integer(), nullable=False),
        ]
    }
    
    for table_name, columns in tables.items():
        op.create_table(table_name, *columns, sa.PrimaryKeyConstraint(columns[0].name))

    # Recreate foreign key constraints
    with op.batch_alter_table('routes') as batch_op:
        batch_op.create_foreign_key('routes_agency_id_fkey', 'agencies', ['agency_id'], ['agency_id'])

    with op.batch_alter_table('user_contributions') as batch_op:
        batch_op.create_foreign_key('user_contributions_user_id_fkey', 'users', ['user_id'], ['user_id'])
        batch_op.create_foreign_key('user_contributions_sighting_id_fkey', 'sightings', ['sighting_id'], ['sighting_id'])
