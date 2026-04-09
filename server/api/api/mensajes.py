from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Mensaje
from api.schemas.schemas import MensajeCreate, MensajeResponse

router = APIRouter()


@router.post("/mensajes/", response_model=MensajeResponse, status_code=201)
async def create_mensaje(payload: MensajeCreate, db: AsyncSession = Depends(get_db)):
    db_item = Mensaje(**payload.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.get("/mensajes/", response_model=list[MensajeResponse])
async def list_mensajes(
    skip: int = 0,
    limit: int = 50,
    id_marketplace: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Mensaje)
    if id_marketplace is not None:
        query = query.where(Mensaje.id_marketplace == id_marketplace)
    query = query.order_by(Mensaje.fecha_hora.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def get_mensaje(mensaje_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return db_item


@router.put("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def update_mensaje(mensaje_id: int, payload: MensajeCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.delete("/mensajes/{mensaje_id}")
async def delete_mensaje(mensaje_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Mensaje desactivado"}
