"""create relevance table

Revision ID: baf936e5e2c7
Revises:
Create Date: 2018-02-28 15:55:21.795979

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'baf936e5e2c7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'relevance',
        sa.Column('user_name', sa.String(50), primary_key=True),
        sa.Column('query', sa.String(250), primary_key=True),
        sa.Column('document_id', sa.String(60), primary_key=True),
        sa.Column('judgment', sa.Integer)
    )


def downgrade():
    op.drop_table('relevance')
