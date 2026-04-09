from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.api.auth import can_view_deleted_records
from api.db.conexion import get_db
from api.models.models import EstadoMarketplace, TipoAnuncio
from api.schemas.schemas import EstadoMarketplaceResponse, TipoAnuncioResponse

router = APIRouter()


@router.get("/catalogos/estados-marketplace", response_model=list[EstadoMarketplaceResponse])
async def list_estados_marketplace(
    skip: int = 0,
    limit: int = 100,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(EstadoMarketplace)
    if not can_view_deleted:
        query = query.where(EstadoMarketplace.deleted_at.is_(None))
    result = await db.execute(query.order_by(EstadoMarketplace.nombre.asc()).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/catalogos/tipos-anuncio", response_model=list[TipoAnuncioResponse])
async def list_tipos_anuncio(
    skip: int = 0,
    limit: int = 100,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(TipoAnuncio)
    if not can_view_deleted:
        query = query.where(TipoAnuncio.deleted_at.is_(None))
    result = await db.execute(query.order_by(TipoAnuncio.nombre.asc()).offset(skip).limit(limit))
    return result.scalars().all()
