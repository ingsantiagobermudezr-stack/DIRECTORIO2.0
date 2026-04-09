from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Departamento
from api.schemas.schemas import DepartamentoCreate, DepartamentoResponse

router = APIRouter()


@router.post("/departamentos/", response_model=DepartamentoResponse)
async def create_departamento(departamento: DepartamentoCreate, db: AsyncSession = Depends(get_db)):
    db_departamento = Departamento(**departamento.model_dump())
    db.add(db_departamento)
    await db.commit()
    await db.refresh(db_departamento)
    return db_departamento


@router.get("/departamentos/", response_model=list[DepartamentoResponse])
async def read_departamentos(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Departamento).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
async def read_departamento(departamento_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Departamento).where(Departamento.id == departamento_id))
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
