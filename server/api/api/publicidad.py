from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.schemas.schemas import PublicidadCreate, PublicidadResponse
from api.models.models import Publicidad
from api.db.conexion import get_db
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()

@router.post("/publicidades/", response_model=PublicidadResponse)
async def create_publicidad(
    publicidad: PublicidadCreate,
    current_user = Depends(require_permission(Permisos.CREAR_PUBLICIDADES)),
    db: AsyncSession = Depends(get_db)
):
    try:
        db_publicidad = Publicidad(**publicidad.model_dump())
        db.add(db_publicidad)
        await db.commit()
        await db.refresh(db_publicidad)
        return db_publicidad
    except Exception as e:
        print(f"Error al crear publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al crear la publicidad")

@router.get("/publicidades/", response_model=list[PublicidadResponse])
async def read_publicidades(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Publicidad)
    if not can_view_deleted:
        query = query.where(Publicidad.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
async def read_publicidad(
    publicidad_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Publicidad).where(Publicidad.id == publicidad_id)
    if not can_view_deleted:
        query = query.where(Publicidad.deleted_at.is_(None))
    result = await db.execute(query)
    publicidad = result.scalars().first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    return publicidad

@router.put("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
async def update_publicidad(
    publicidad_id: int,
    publicidad: PublicidadCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_PUBLICIDADES)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Publicidad).where(Publicidad.id == publicidad_id))
    db_publicidad = result.scalars().first()
    if not db_publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    try:
        for key, value in publicidad.model_dump().items():
            setattr(db_publicidad, key, value)
        await db.commit()
        await db.refresh(db_publicidad)
        return db_publicidad
    except Exception as e:
        print(f"Error al actualizar publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar la publicidad")

@router.delete("/publicidades/{publicidad_id}")
async def delete_publicidad(publicidad_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publicidad).where(Publicidad.id == publicidad_id))
    publicidad = result.scalars().first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    try:
        publicidad.deleted_at = datetime.utcnow()
        await db.commit()
        return {"message": "Publicidad desactivada correctamente"}
    except Exception as e:
        print(f"Error al eliminar publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar la publicidad")


@router.patch("/publicidades/{publicidad_id}/restore")
async def restore_publicidad(
    publicidad_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Publicidad).where(Publicidad.id == publicidad_id))
    publicidad = result.scalars().first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")

    publicidad.deleted_at = None
    await db.commit()
    return {"message": "Publicidad restaurada correctamente"}
