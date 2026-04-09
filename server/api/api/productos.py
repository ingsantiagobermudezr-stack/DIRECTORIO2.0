from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.conexion import get_db
from api.models.models import Producto
from api.schemas.schemas import ProductoCreate, ProductoResponse

router = APIRouter()


@router.get("/productos", response_model=List[ProductoResponse])
async def list_productos(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Producto).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/productos", response_model=ProductoResponse, status_code=201)
async def create_producto(payload: ProductoCreate, db: AsyncSession = Depends(get_db)):
    db_p = Producto(**payload.model_dump())
    db.add(db_p)
    await db.commit()
    await db.refresh(db_p)
    return db_p


@router.get("/productos/{id_producto}", response_model=ProductoResponse)
async def get_producto(id_producto: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Producto).where(Producto.id == id_producto))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto not found")
    return p


@router.delete("/productos/{id_producto}")
async def delete_producto(id_producto: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Producto).where(Producto.id == id_producto))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto not found")
    p.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Producto desactivado"}
