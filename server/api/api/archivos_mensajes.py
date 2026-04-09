from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import ArchivoMensaje, Mensaje
from api.schemas.schemas import ArchivoMensajeCreate, ArchivoMensajeResponse
from api.api.auth import can_view_deleted_records, require_permission
from api.utils.uploads import ensure_upload_dir, save_upload_file, build_public_url, get_upload_root
from seeders.seed_permisos import Permisos

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
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(ArchivoMensaje)
    if not can_view_deleted:
        query = query.where(ArchivoMensaje.deleted_at.is_(None))
    if id_mensaje is not None:
        query = query.where(ArchivoMensaje.id_mensaje == id_mensaje)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/archivos-mensajes/{archivo_id}", response_model=ArchivoMensajeResponse)
async def get_archivo_mensaje(
    archivo_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(ArchivoMensaje).where(ArchivoMensaje.id == archivo_id)
    if not can_view_deleted:
        query = query.where(ArchivoMensaje.deleted_at.is_(None))
    result = await db.execute(query)
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


@router.patch("/archivos-mensajes/{archivo_id}/restore")
async def restore_archivo_mensaje(
    archivo_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ArchivoMensaje).where(ArchivoMensaje.id == archivo_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")

    db_item.deleted_at = None
    await db.commit()
    return {"detail": "Archivo de mensaje restaurado"}


@router.post("/archivos-mensajes/upload", response_model=ArchivoMensajeResponse, status_code=201)
async def upload_archivo_mensaje(
    id_mensaje: int = Form(...),
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Sube archivo para un mensaje y crea registro en `archivos_mensajes`."""
    result_msg = await db.execute(
        select(Mensaje).where(Mensaje.id == id_mensaje, Mensaje.deleted_at.is_(None))
    )
    mensaje = result_msg.scalars().first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    upload_dir = ensure_upload_dir(get_upload_root(), "mensajes")
    file_name = await save_upload_file(archivo, upload_dir)
    file_url = build_public_url(file_name, "mensajes")

    db_item = ArchivoMensaje(id_mensaje=id_mensaje, url_imagen=file_url)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item
