from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.conexion import get_db
from api.models.models import Permiso
from api.schemas.schemas import PermisoResponse, PermisoBase

router = APIRouter()


@router.get("/permisos", response_model=List[PermisoResponse])
async def list_permisos(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Permiso).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/permisos", response_model=PermisoResponse, status_code=201)
async def create_permiso(payload: PermisoBase, db: AsyncSession = Depends(get_db)):
    db_perm = Permiso(key=payload.key, descripcion=payload.descripcion)
    db.add(db_perm)
    await db.commit()
    await db.refresh(db_perm)
    return db_perm


@router.get("/permisos/{id_permiso}", response_model=PermisoResponse)
async def get_permiso(id_permiso: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Permiso).where(Permiso.id == id_permiso))
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    return perm


@router.put("/permisos/{id_permiso}", response_model=PermisoResponse)
async def update_permiso(id_permiso: int, payload: PermisoBase, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Permiso).where(Permiso.id == id_permiso))
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    perm.key = payload.key
    perm.descripcion = payload.descripcion
    await db.commit()
    await db.refresh(perm)
    return perm


@router.delete("/permisos/{id_permiso}")
async def delete_permiso(id_permiso: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Permiso).where(Permiso.id == id_permiso))
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    perm.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Permiso deactivated"}
