from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Marketplace
from api.schemas.schemas import MarketplaceCreate, MarketplaceResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()

# Listar productos/servicios marketplace
@router.get("/marketplace", response_model=List[MarketplaceResponse])
async def get_marketplace(
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Marketplace)
    if not can_view_deleted:
        query = query.where(Marketplace.deleted_at.is_(None))
    result = await db.execute(query)
    return result.scalars().all()

# Obtener producto/servicio por ID
@router.get("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
async def get_marketplace_item(
    id_marketplace: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Marketplace).where(Marketplace.id == id_marketplace)
    if not can_view_deleted:
        query = query.where(Marketplace.deleted_at.is_(None))
    result = await db.execute(query)
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


@router.patch("/marketplace/{id_marketplace}/restore")
async def restore_marketplace(
    id_marketplace: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")

    item.deleted_at = None
    await db.commit()
    return {"detail": "Marketplace item restored"}
