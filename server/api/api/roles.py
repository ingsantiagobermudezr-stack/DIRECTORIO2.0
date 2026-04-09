from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from api.db.conexion import get_db
from api.models.models import Rol, Permiso
from api.schemas.schemas import RolCreate, RolResponse

router = APIRouter()


@router.get("/roles", response_model=List[RolResponse])
async def list_roles(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol).options(selectinload(Rol.permisos)).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/roles", response_model=RolResponse, status_code=201)
async def create_role(payload: RolCreate, db: AsyncSession = Depends(get_db)):
    db_role = Rol(nombre=payload.nombre, descripcion=payload.descripcion)
    if payload.permiso_ids:
        permisos_result = await db.execute(select(Permiso).where(Permiso.id.in_(payload.permiso_ids)))
        permisos = permisos_result.scalars().all()
        db_role.permisos = permisos
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    return db_role


@router.get("/roles/{id_rol}", response_model=RolResponse)
async def get_role(id_rol: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol).options(selectinload(Rol.permisos)).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/roles/{id_rol}", response_model=RolResponse)
async def update_role(id_rol: int, payload: RolCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol).options(selectinload(Rol.permisos)).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.nombre = payload.nombre
    role.descripcion = payload.descripcion
    if payload.permiso_ids:
        permisos_result = await db.execute(select(Permiso).where(Permiso.id.in_(payload.permiso_ids)))
        permisos = permisos_result.scalars().all()
        role.permisos = permisos
    await db.commit()
    await db.refresh(role)
    return role


@router.delete("/roles/{id_rol}")
async def delete_role(id_rol: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Role deactivated"}
