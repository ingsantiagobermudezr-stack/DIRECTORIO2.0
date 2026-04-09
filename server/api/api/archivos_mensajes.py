from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import ArchivoMensaje
from api.schemas.schemas import ArchivoMensajeCreate, ArchivoMensajeResponse

router = APIRouter()


@router.post("/archivos-mensajes/", response_model=ArchivoMensajeResponse, status_code=201)
async def create_archivo_mensaje(payload: ArchivoMensajeCreate, db: AsyncSession = Depends(get_db)):
    db_item = ArchivoMensaje(**payload.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.get("/archivos-mensajes/", response_model=list[ArchivoMensajeResponse])
async def list_archivos_mensajes(
    skip: int = 0,
    limit: int = 50,
    id_mensaje: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = select(ArchivoMensaje)
    if id_mensaje is not None:
        query = query.where(ArchivoMensaje.id_mensaje == id_mensaje)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/archivos-mensajes/{archivo_id}", response_model=ArchivoMensajeResponse)
async def get_archivo_mensaje(archivo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ArchivoMensaje).where(ArchivoMensaje.id == archivo_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")
    return db_item


@router.put("/archivos-mensajes/{archivo_id}", response_model=ArchivoMensajeResponse)
async def update_archivo_mensaje(archivo_id: int, payload: ArchivoMensajeCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ArchivoMensaje).where(ArchivoMensaje.id == archivo_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.delete("/archivos-mensajes/{archivo_id}")
async def delete_archivo_mensaje(archivo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ArchivoMensaje).where(ArchivoMensaje.id == archivo_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")

    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Archivo de mensaje desactivado"}
