"""Rename start_stop/end_stop to start_stop_id/end_stop_id and add FKs

Revision ID: 20250503a
Revises: b75de651142c
Create Date: 2025-05-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250503a'
down_revision = 'b75de651142c'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('routes') as batch_op:
        batch_op.alter_column('start_stop', new_column_name='start_stop_id')
        batch_op.alter_column('end_stop', new_column_name='end_stop_id')
        batch_op.create_foreign_key('fk_routes_start_stop_id', 'stops', ['start_stop_id'], ['stop_id'])
        batch_op.create_foreign_key('fk_routes_end_stop_id', 'stops', ['end_stop_id'], ['stop_id'])

def downgrade():
    with op.batch_alter_table('routes') as batch_op:
        batch_op.drop_constraint('fk_routes_start_stop_id', type_='foreignkey')
        batch_op.drop_constraint('fk_routes_end_stop_id', type_='foreignkey')
        batch_op.alter_column('start_stop_id', new_column_name='start_stop')
        batch_op.alter_column('end_stop_id', new_column_name='end_stop')
