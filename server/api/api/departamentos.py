from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Departamento
from api.schemas.schemas import DepartamentoCreate, DepartamentoResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()


@router.post("/departamentos/", response_model=DepartamentoResponse)
async def create_departamento(departamento: DepartamentoCreate, db: AsyncSession = Depends(get_db)):
    db_departamento = Departamento(**departamento.model_dump())
    db.add(db_departamento)
    await db.commit()
    await db.refresh(db_departamento)
    return db_departamento


@router.get("/departamentos/", response_model=list[DepartamentoResponse])
async def read_departamentos(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Departamento)
    if not can_view_deleted:
        query = query.where(Departamento.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
async def read_departamento(
    departamento_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Departamento).where(Departamento.id == departamento_id)
    if not can_view_deleted:
        query = query.where(Departamento.deleted_at.is_(None))
    result = await db.execute(query)
    departamento = result.scalars().first()
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return departamento


@router.put("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
async def update_departamento(departamento_id: int, departamento: DepartamentoCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Departamento).where(Departamento.id == departamento_id))
    db_departamento = result.scalars().first()
    if not db_departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")

    for key, value in departamento.model_dump().items():
        setattr(db_departamento, key, value)

    await db.commit()
    await db.refresh(db_departamento)
    return db_departamento


@router.delete("/departamentos/{departamento_id}")
async def delete_departamento(departamento_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Departamento).where(Departamento.id == departamento_id))
    departamento = result.scalars().first()
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")

    departamento.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Departamento desactivado correctamente"}


@router.patch("/departamentos/{departamento_id}/restore")
async def restore_departamento(
    departamento_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Departamento).where(Departamento.id == departamento_id))
    departamento = result.scalars().first()
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")

    departamento.deleted_at = None
    await db.commit()
    return {"message": "Departamento restaurado correctamente"}
