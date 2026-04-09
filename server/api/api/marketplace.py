from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Marketplace
from api.schemas.schemas import MarketplaceCreate, MarketplaceResponse

router = APIRouter()

# Listar productos/servicios marketplace
@router.get("/marketplace", response_model=List[MarketplaceResponse])
async def get_marketplace(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Marketplace))
    return result.scalars().all()

# Obtener producto/servicio por ID
@router.get("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
async def get_marketplace_item(id_marketplace: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    return item

# Crear producto/servicio
@router.post("/marketplace", response_model=MarketplaceResponse, status_code=201)
async def create_marketplace(item: MarketplaceCreate, db: AsyncSession = Depends(get_db)):
    db_item = Marketplace(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

# Editar producto/servicio
@router.put("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
async def update_marketplace(id_marketplace: int, item: MarketplaceCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    await db.commit()
    await db.refresh(db_item)
    return db_item

# Eliminar producto/servicio
@router.delete("/marketplace/{id_marketplace}")
async def delete_marketplace(id_marketplace: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Marketplace item deactivated"}
