"""Topic table

Revision ID: 7e2eb95ffe7c
Revises: b56f243a4f7d
Create Date: 2018-03-02 12:23:26.525887

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7e2eb95ffe7c'
down_revision = 'b56f243a4f7d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'topic',
        sa.Column('query', sa.String(250), primary_key=True),
        sa.Column('title', sa.String(1000), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('narrative', sa.Text, nullable=False),
    )


def downgrade():
    op.drop_table('topic')
