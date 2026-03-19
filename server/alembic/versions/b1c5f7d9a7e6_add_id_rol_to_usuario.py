"""add id_rol column to usuario

Revision ID: b1c5f7d9a7e6
Revises: a9f3d1c4b2e4
Create Date: 2026-03-18 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c5f7d9a7e6'
down_revision: Union[str, Sequence[str], None] = 'a9f3d1c4b2e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('usuario', sa.Column('id_rol', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_usuario_rol', 'usuario', 'rol', ['id_rol'], ['id_rol'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('fk_usuario_rol', 'usuario', type_='foreignkey')
    op.drop_column('usuario', 'id_rol')
