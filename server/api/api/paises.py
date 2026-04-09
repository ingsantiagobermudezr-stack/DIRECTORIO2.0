from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.conexion import get_db
from api.models.models import Pais, Departamento, Municipio
from api.schemas.schemas import PaisResponse, PaisBase, MunicipioResponse

router = APIRouter()


@router.get("/paises", response_model=List[PaisResponse])
async def list_paises(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pais).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/paises", response_model=PaisResponse, status_code=201)
async def create_pais(payload: PaisBase, db: AsyncSession = Depends(get_db)):
    db_p = Pais(nombre=payload.nombre, codigo_iso=payload.codigo_iso)
    db.add(db_p)
    await db.commit()
    await db.refresh(db_p)
    return db_p


@router.get("/departamentos", response_model=List[dict])
async def list_departamentos(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    deps_result = await db.execute(select(Departamento).offset(skip).limit(limit))
    deps = deps_result.scalars().all()
    return [{"id": d.id, "nombre": d.nombre, "id_pais": d.id_pais} for d in deps]


@router.get("/ciudades", response_model=List[MunicipioResponse])
async def list_ciudades(skip: int = 0, limit: int = 200, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Municipio).offset(skip).limit(limit))
    return result.scalars().all()
