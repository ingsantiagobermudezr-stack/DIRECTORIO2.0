from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.schemas.schemas import PublicidadCreate, PublicidadResponse
from api.models.models import Publicidad
from api.db.conexion import get_db

router = APIRouter()

@router.post("/publicidades/", response_model=PublicidadResponse)
async def create_publicidad(publicidad: PublicidadCreate, db: AsyncSession = Depends(get_db)):
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
async def read_publicidades(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publicidad).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
async def read_publicidad(publicidad_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publicidad).where(Publicidad.id == publicidad_id))
    publicidad = result.scalars().first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    return publicidad

@router.put("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
async def update_publicidad(publicidad_id: int, publicidad: PublicidadCreate, db: AsyncSession = Depends(get_db)):
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
