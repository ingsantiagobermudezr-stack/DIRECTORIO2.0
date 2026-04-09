from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.schemas.schemas import ResultadoCreate, ResultadoResponse
from api.models.models import Resultado
from api.db.conexion import get_db


router = APIRouter()

# RUTAS PARA TELEMETRIA DE BUSQUEDA
@router.post("/resultados/", response_model=ResultadoResponse)
async def create_resultado(resultado: ResultadoCreate, db: AsyncSession = Depends(get_db)):
    db_resultado = Resultado(**resultado.model_dump())
    db.add(db_resultado)
    await db.commit()
    await db.refresh(db_resultado)
    return db_resultado

@router.get("/resultados/", response_model=list[ResultadoResponse])
async def read_resultados(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resultado).order_by(Resultado.fecha_hora.desc()).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/resultados/{resultado_id}", response_model=ResultadoResponse)
async def read_resultado(resultado_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resultado).where(Resultado.id == resultado_id))
    resultado = result.scalars().first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    return resultado

@router.put("/resultados/{resultado_id}", response_model=ResultadoResponse)
async def update_resultado(resultado_id: int, resultado: ResultadoCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resultado).where(Resultado.id == resultado_id))
    db_resultado = result.scalars().first()
    if not db_resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    for key, value in resultado.model_dump().items():
        setattr(db_resultado, key, value)
    await db.commit()
    await db.refresh(db_resultado)
    return db_resultado

@router.delete("/resultados/{resultado_id}")
async def delete_resultado(resultado_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resultado).where(Resultado.id == resultado_id))
    resultado = result.scalars().first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    resultado.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Resultado desactivado correctamente"}
