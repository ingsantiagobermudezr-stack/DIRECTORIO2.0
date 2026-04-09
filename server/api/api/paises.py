from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.conexion import get_db
from api.models.models import Pais, Departamento, Municipio
from api.schemas.schemas import PaisResponse, PaisBase, MunicipioResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()


@router.get("/paises", response_model=List[PaisResponse])
async def list_paises(
    skip: int = 0,
    limit: int = 50,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Pais)
    if not can_view_deleted:
        query = query.where(Pais.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/paises", response_model=PaisResponse, status_code=201)
async def create_pais(
    payload: PaisBase,
    current_user = Depends(require_permission(Permisos.CREAR_PAISES)),
    db: AsyncSession = Depends(get_db)
):
    db_p = Pais(nombre=payload.nombre, codigo_iso=payload.codigo_iso)
    db.add(db_p)
    await db.commit()
    await db.refresh(db_p)
    return db_p


@router.put("/paises/{pais_id}", response_model=PaisResponse)
async def update_pais(
    pais_id: int,
    payload: PaisBase,
    current_user = Depends(require_permission(Permisos.MODIFICAR_PAISES)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Pais).where(Pais.id == pais_id))
    db_p = result.scalars().first()
    if not db_p:
        raise HTTPException(status_code=404, detail="País no encontrado")
    
    db_p.nombre = payload.nombre
    db_p.codigo_iso = payload.codigo_iso
    await db.commit()
    await db.refresh(db_p)
    return db_p


@router.get("/departamentos", response_model=List[dict])
async def list_departamentos(
    skip: int = 0,
    limit: int = 100,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Departamento)
    if not can_view_deleted:
        query = query.where(Departamento.deleted_at.is_(None))
    deps_result = await db.execute(query.offset(skip).limit(limit))
    deps = deps_result.scalars().all()
    return [{"id": d.id, "nombre": d.nombre, "id_pais": d.id_pais} for d in deps]


@router.get("/ciudades", response_model=List[MunicipioResponse])
async def list_ciudades(
    skip: int = 0,
    limit: int = 200,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Municipio)
    if not can_view_deleted:
        query = query.where(Municipio.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()
