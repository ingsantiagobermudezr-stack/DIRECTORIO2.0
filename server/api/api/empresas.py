from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.schemas.schemas import EmpresaCreate, EmpresaResponse, EmpresaResponseGet
from api.models.models import Empresa, Categoria, Municipio
from api.db.conexion import get_db

router = APIRouter()

# Crear empresa
@router.post("/empresas/", response_model=EmpresaResponse, status_code=201)
async def create_empresa(empresa: EmpresaCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Verificar unicidad de NIT
        nit_result = await db.execute(select(Empresa).where(Empresa.nit == empresa.nit))
        existing_nit = nit_result.scalars().first()
        if existing_nit:
            raise HTTPException(status_code=409, detail="Ya existe una empresa con este NIT")

        # Verificar si existe la categoría
        categoria_result = await db.execute(select(Categoria).where(Categoria.id == empresa.id_categoria))
        categoria = categoria_result.scalars().first()
        if not categoria:
            raise HTTPException(status_code=404, detail="La categoría especificada no existe")
        
        # Verificar si existe el municipio
        municipio_result = await db.execute(select(Municipio).where(Municipio.id == empresa.id_municipio))
        municipio = municipio_result.scalars().first()
        if not municipio:
            raise HTTPException(status_code=404, detail="El municipio especificado no existe")
        
        # Crear la empresa
        db_empresa = Empresa(**empresa.model_dump())
        db.add(db_empresa)
        await db.commit()
        await db.refresh(db_empresa)
        return {"success": True, "id": db_empresa.id}
    except HTTPException as he:
        raise he
    except IntegrityError as ie:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto al crear empresa: posible NIT duplicado")
    except Exception as e:
        # Rollback y normalizar como conflicto de NIT (evita exponer detalles DB)
        try:
            await db.rollback()
        except Exception:
            pass
        print(f"Error al crear empresa: {str(e)}")
        raise HTTPException(status_code=409, detail="Conflicto al crear empresa: posible NIT duplicado")

# Leer todas las empresas
@router.get("/empresas/", response_model=list[EmpresaResponseGet])
async def read_empresas(skip: int = 0, limit: int = 10,
    nombre: str | None = Query(default=None, description="Filtrar por nombre de empresa"),
    db: AsyncSession = Depends(get_db)):

    query = select(Empresa)

    if nombre:
        query = query.where(Empresa.nombre.ilike(f"%{nombre}%"))

    query = query.options(joinedload(Empresa.categoria))
    query = query.options(joinedload(Empresa.municipio))

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

# Leer una empresa específica
@router.get("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
async def read_empresa(empresa_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Empresa)
        .options(joinedload(Empresa.categoria), joinedload(Empresa.municipio))
        .where(Empresa.id == empresa_id)
    )
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

# Actualizar una empresa
@router.put("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
async def update_empresa(empresa_id: int, empresa: EmpresaCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
    db_empresa = result.scalars().first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    for key, value in empresa.model_dump().items():
        setattr(db_empresa, key, value)
    await db.commit()
    result = await db.execute(
        select(Empresa)
        .options(joinedload(Empresa.categoria), joinedload(Empresa.municipio))
        .where(Empresa.id == empresa_id)
    )
    empresa_actualizada = result.scalars().first()
    return empresa_actualizada

# Eliminar una empresa
@router.delete("/empresas/{empresa_id}")
async def delete_empresa(empresa_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    empresa.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Empresa desactivada correctamente"}
