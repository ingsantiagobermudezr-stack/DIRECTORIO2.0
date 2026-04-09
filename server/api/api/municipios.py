from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Municipio
from api.schemas.schemas import MunicipioCreate, MunicipioResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()


@router.post("/municipios/", response_model=MunicipioResponse)
async def create_municipio(
    municipio: MunicipioCreate,
    current_user = Depends(require_permission(Permisos.CREAR_MUNICIPIOS)),
    db: AsyncSession = Depends(get_db)
):
    db_municipio = Municipio(**municipio.model_dump())
    db.add(db_municipio)
    await db.commit()
    await db.refresh(db_municipio)
    return db_municipio


@router.get("/municipios/", response_model=list[MunicipioResponse])
async def read_municipios(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Municipio)
    if not can_view_deleted:
        query = query.where(Municipio.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/municipios/{municipio_id}", response_model=MunicipioResponse)
async def read_municipio(
    municipio_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Municipio).where(Municipio.id == municipio_id)
    if not can_view_deleted:
        query = query.where(Municipio.deleted_at.is_(None))
    result = await db.execute(query)
    municipio = result.scalars().first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")
    return municipio


@router.put("/municipios/{municipio_id}", response_model=MunicipioResponse)
async def update_municipio(
    municipio_id: int,
    municipio: MunicipioCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_MUNICIPIOS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Municipio).where(Municipio.id == municipio_id))
    db_municipio = result.scalars().first()
    if not db_municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    for key, value in municipio.model_dump().items():
        setattr(db_municipio, key, value)

    await db.commit()
    await db.refresh(db_municipio)
    return db_municipio


@router.delete("/municipios/{municipio_id}")
async def delete_municipio(municipio_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Municipio).where(Municipio.id == municipio_id))
    municipio = result.scalars().first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    municipio.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Municipio desactivado correctamente"}


@router.patch("/municipios/{municipio_id}/restore")
async def restore_municipio(
    municipio_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Municipio).where(Municipio.id == municipio_id))
    municipio = result.scalars().first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    municipio.deleted_at = None
    await db.commit()
    return {"message": "Municipio restaurado correctamente"}