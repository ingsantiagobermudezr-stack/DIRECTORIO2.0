from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Categoria
from api.schemas.schemas import CategoriaCreate, CategoriaResponse

router = APIRouter()


@router.post(
    "/categorias/",
    response_model=CategoriaResponse,
    summary="Crear nueva categoría",
    description="Crea una nueva categoría en el sistema",
    response_description="La categoría creada",
)
async def create_categoria(categoria: CategoriaCreate, db: AsyncSession = Depends(get_db)):
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    await db.commit()
    await db.refresh(db_categoria)
    return db_categoria


@router.get(
    "/categorias/",
    response_model=list[CategoriaResponse],
    summary="Obtener categorías",
    description="Obtiene la lista de todas las categorías",
    response_description="Lista de categorías",
)
async def read_categorias(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Categoria).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def read_categoria(categoria_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Categoria).where(Categoria.id == categoria_id))
    categoria = result.scalars().first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def update_categoria(categoria_id: int, categoria: CategoriaCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Categoria).where(Categoria.id == categoria_id))
    db_categoria = result.scalars().first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    for key, value in categoria.model_dump().items():
        setattr(db_categoria, key, value)

    await db.commit()
    await db.refresh(db_categoria)
    return db_categoria


@router.delete("/categorias/{categoria_id}")
async def delete_categoria(categoria_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Categoria).where(Categoria.id == categoria_id))
    categoria = result.scalars().first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    categoria.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Categoría desactivada correctamente"}
