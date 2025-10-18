"""create marketplace table\n\nRevision ID: add_marketplace_table\nRevises: 940f55bd334b\nCreate Date: 2025-09-02\n"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'add_marketplace_table'
down_revision: Union[str, None] = '940f55bd334b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'marketplace',
        sa.Column('id_marketplace', sa.Integer, primary_key=True, index=True),
        sa.Column('nombre', sa.String(100), nullable=False),
        sa.Column('descripcion', sa.Text, nullable=True),
        sa.Column('precio', sa.Float, nullable=True),
        sa.Column('imagen_url', sa.String(255), nullable=True),
        sa.Column('fecha_publicacion', sa.DateTime, nullable=False),
        sa.Column('estado', sa.String(20), nullable=False, server_default='activo'),
        sa.Column('id_empresa', sa.Integer, sa.ForeignKey('empresa.id_empresa', ondelete='CASCADE'), nullable=False),
        sa.Column('id_categoria', sa.Integer, sa.ForeignKey('categoria.id_categoria', ondelete='SET NULL'), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('marketplace')
