"""add_gtfs_tables

Revision ID: b75de651142c
Revises: 057a405b6add
Create Date: 2024-05-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b75de651142c'
down_revision: Union[str, None] = '057a405b6add'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create trips table
    op.create_table('trips',
        sa.Column('trip_id', sa.String(), nullable=False),
        sa.Column('route_id', sa.String(), nullable=False),
        sa.Column('service_id', sa.String(), nullable=False),
        sa.Column('trip_headsign', sa.String(), nullable=True),
        sa.Column('direction_id', sa.Integer(), nullable=True),
        sa.Column('shape_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['route_id'], ['routes.route_id'], ),
        sa.PrimaryKeyConstraint('trip_id')
    )
    op.create_index(op.f('ix_trips_trip_id'), 'trips', ['trip_id'], unique=False)

    # Create stop_times table
    op.create_table('stop_times',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trip_id', sa.String(), nullable=False),
        sa.Column('arrival_time', sa.Time(), nullable=False),
        sa.Column('departure_time', sa.Time(), nullable=False),
        sa.Column('stop_id', sa.String(), nullable=False),
        sa.Column('stop_sequence', sa.Integer(), nullable=False),
        sa.Column('stop_headsign', sa.String(), nullable=True),
        sa.Column('pickup_type', sa.Integer(), nullable=True),
        sa.Column('drop_off_type', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['stop_id'], ['stops.stop_id'], ),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.trip_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stop_times_id'), 'stop_times', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_stop_times_id'), table_name='stop_times')
    op.drop_table('stop_times')
    op.drop_index(op.f('ix_trips_trip_id'), table_name='trips')
    op.drop_table('trips')
