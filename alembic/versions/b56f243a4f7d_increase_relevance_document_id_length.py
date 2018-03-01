"""Increase relevance.document_id length

Revision ID: b56f243a4f7d
Revises: baf936e5e2c7
Create Date: 2018-03-01 14:52:02.779014

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b56f243a4f7d'
down_revision = 'baf936e5e2c7'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('relevance', 'document_id', type_=sa.String(1000))


def downgrade():
    op.alter_column('relevance', 'document_id', type_=sa.String(60))
