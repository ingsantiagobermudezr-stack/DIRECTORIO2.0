from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Comprobante
from api.schemas.schemas import ComprobanteCreate, ComprobanteResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()


@router.post("/comprobantes/", response_model=ComprobanteResponse, status_code=201)
async def create_comprobante(payload: ComprobanteCreate, db: AsyncSession = Depends(get_db)):
    db_item = Comprobante(**payload.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.get("/comprobantes/", response_model=list[ComprobanteResponse])
async def list_comprobantes(
    skip: int = 0,
    limit: int = 50,
    id_archivo: int | None = Query(default=None),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Comprobante)
    if not can_view_deleted:
        query = query.where(Comprobante.deleted_at.is_(None))
    if id_archivo is not None:
        query = query.where(Comprobante.id_archivo == id_archivo)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
async def get_comprobante(
    comprobante_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Comprobante).where(Comprobante.id == comprobante_id)
    if not can_view_deleted:
        query = query.where(Comprobante.deleted_at.is_(None))
    result = await db.execute(query)
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return db_item


@router.put("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
async def update_comprobante(comprobante_id: int, payload: ComprobanteCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.delete("/comprobantes/{comprobante_id}")
async def delete_comprobante(comprobante_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Comprobante desactivado"}


@router.patch("/comprobantes/{comprobante_id}/restore")
async def restore_comprobante(
    comprobante_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    db_item.deleted_at = None
    await db.commit()
    return {"detail": "Comprobante restaurado"}
