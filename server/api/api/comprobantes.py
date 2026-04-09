from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.db.conexion import get_db
from api.models.models import Comprobante, ArchivoMensaje, Mensaje
from api.schemas.schemas import ComprobanteCreate, ComprobanteResponse
from api.api.auth import can_view_deleted_records, require_permission, get_current_user, is_admin_user
from api.api.notificaciones import create_business_notification
from api.utils.uploads import ensure_upload_dir, save_upload_file, build_public_url, get_upload_root
from seeders.seed_permisos import Permisos

router = APIRouter()


def _is_admin(user) -> bool:
    return is_admin_user(user)


def _puede_resolver_comprobante(user, comprobante: Comprobante) -> bool:
    return _is_admin(user) or user.id == comprobante.id_empleado_evaluador


async def _notificar_estado_comprobante(
    db: AsyncSession,
    *,
    comprobante: Comprobante,
    estado: str,
    actor_id: int,
) -> None:
    archivo_result = await db.execute(
        select(ArchivoMensaje)
        .options(joinedload(ArchivoMensaje.mensaje_rel))
        .where(ArchivoMensaje.id == comprobante.id_archivo, ArchivoMensaje.deleted_at.is_(None))
    )
    archivo = archivo_result.scalars().first()
    mensaje: Mensaje | None = getattr(archivo, "mensaje_rel", None)
    if not mensaje:
        return

    recipients = {
        mensaje.id_usuario_creador_chat,
        mensaje.id_usuario_enviador_mensaje,
    }
    recipients.discard(actor_id)

    if not recipients:
        return

    contenido = f"Tu comprobante fue {estado}"
    tipo = "comprobante_aprobado" if estado == "aprobado" else "comprobante_rechazado"

    for recipient_id in recipients:
        try:
            await create_business_notification(
                db,
                id_usuario_destinatario=recipient_id,
                tipo=tipo,
                contenido=contenido,
                id_usuario_remitente=actor_id,
            )
        except HTTPException:
            continue


@router.post("/comprobantes/", response_model=ComprobanteResponse, status_code=201)
async def create_comprobante(payload: ComprobanteCreate, db: AsyncSession = Depends(get_db)):
    db_item = Comprobante(**payload.model_dump(), estado="pendiente", fecha_resolucion=None)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.get("/comprobantes/", response_model=list[ComprobanteResponse])
async def list_comprobantes(
    skip: int = 0,
    limit: int = 50,
    id_archivo: int | None = Query(default=None),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Comprobante)
    if not can_view_deleted:
        query = query.where(Comprobante.deleted_at.is_(None))
    if id_archivo is not None:
        query = query.where(Comprobante.id_archivo == id_archivo)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
async def get_comprobante(
    comprobante_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Comprobante).where(Comprobante.id == comprobante_id)
    if not can_view_deleted:
        query = query.where(Comprobante.deleted_at.is_(None))
    result = await db.execute(query)
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return db_item


@router.put("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
async def update_comprobante(comprobante_id: int, payload: ComprobanteCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    # Edición de payload no debe cerrar el flujo de estado
    if db_item.estado in ("aprobado", "rechazado"):
        raise HTTPException(status_code=409, detail="El comprobante ya fue resuelto y no puede editarse")

    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.delete("/comprobantes/{comprobante_id}")
async def delete_comprobante(comprobante_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Comprobante desactivado"}


@router.patch("/comprobantes/{comprobante_id}/restore")
async def restore_comprobante(
    comprobante_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Comprobante).where(Comprobante.id == comprobante_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    db_item.deleted_at = None
    await db.commit()
    return {"detail": "Comprobante restaurado"}


@router.post("/comprobantes/registrar-desde-archivo", status_code=201)
async def registrar_comprobante_desde_archivo(
    id_mensaje: int = Form(...),
    id_empleado_evaluador: int = Form(...),
    recibo_valido: bool = Form(...),
    cantidad_recibida: float = Form(...),
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Flujo completo:
    1) Sube imagen del comprobante
    2) Crea registro en archivos_mensajes
    3) Crea comprobante asociado
    """
    upload_dir = ensure_upload_dir(get_upload_root(), "comprobantes")
    file_name = await save_upload_file(archivo, upload_dir)
    file_url = build_public_url(file_name, "comprobantes")

    archivo_item = ArchivoMensaje(id_mensaje=id_mensaje, url_imagen=file_url)
    db.add(archivo_item)
    await db.flush()

    comprobante = Comprobante(
        id_archivo=archivo_item.id,
        id_empleado_evaluador=id_empleado_evaluador,
        recibo_valido=recibo_valido,
        cantidad_recibida=cantidad_recibida,
        estado="pendiente",
        fecha_resolucion=None,
    )
    db.add(comprobante)
    await db.commit()
    await db.refresh(comprobante)

    return {
        "message": "Comprobante registrado correctamente",
        "comprobante": {
            "id": comprobante.id,
            "id_archivo": comprobante.id_archivo,
            "id_empleado_evaluador": comprobante.id_empleado_evaluador,
            "recibo_valido": comprobante.recibo_valido,
            "cantidad_recibida": comprobante.cantidad_recibida,
        },
        "archivo": {
            "id": archivo_item.id,
            "id_mensaje": archivo_item.id_mensaje,
            "url_imagen": archivo_item.url_imagen,
        },
    }


@router.post("/comprobantes/{comprobante_id}/aprobar")
async def aprobar_comprobante(
    comprobante_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comprobante).where(Comprobante.id == comprobante_id, Comprobante.deleted_at.is_(None))
    )
    comprobante = result.scalars().first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    if not _puede_resolver_comprobante(current_user, comprobante):
        raise HTTPException(status_code=403, detail="Solo el evaluador asignado o un admin puede aprobar")

    if comprobante.estado in ("aprobado", "rechazado"):
        raise HTTPException(status_code=409, detail="El comprobante ya fue resuelto")

    comprobante.estado = "aprobado"
    comprobante.recibo_valido = True
    comprobante.fecha_resolucion = datetime.utcnow()
    await db.commit()
    await db.refresh(comprobante)

    await _notificar_estado_comprobante(
        db,
        comprobante=comprobante,
        estado="aprobado",
        actor_id=current_user.id,
    )

    return {"message": "Comprobante aprobado", "id": comprobante.id, "estado": comprobante.estado}


@router.post("/comprobantes/{comprobante_id}/rechazar")
async def rechazar_comprobante(
    comprobante_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comprobante).where(Comprobante.id == comprobante_id, Comprobante.deleted_at.is_(None))
    )
    comprobante = result.scalars().first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    if not _puede_resolver_comprobante(current_user, comprobante):
        raise HTTPException(status_code=403, detail="Solo el evaluador asignado o un admin puede rechazar")

    if comprobante.estado in ("aprobado", "rechazado"):
        raise HTTPException(status_code=409, detail="El comprobante ya fue resuelto")

    comprobante.estado = "rechazado"
    comprobante.recibo_valido = False
    comprobante.fecha_resolucion = datetime.utcnow()
    await db.commit()
    await db.refresh(comprobante)

    await _notificar_estado_comprobante(
        db,
        comprobante=comprobante,
        estado="rechazado",
        actor_id=current_user.id,
    )

    return {"message": "Comprobante rechazado", "id": comprobante.id, "estado": comprobante.estado}


@router.get("/comprobantes/{comprobante_id}/timeline")
async def timeline_comprobante(
    comprobante_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Comprobante)
        .options(joinedload(Comprobante.archivo).joinedload(ArchivoMensaje.mensaje_rel))
        .where(Comprobante.id == comprobante_id)
    )
    if not can_view_deleted:
        query = query.where(Comprobante.deleted_at.is_(None))

    result = await db.execute(query)
    comprobante = result.scalars().first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    mensaje = comprobante.archivo.mensaje_rel if comprobante.archivo else None

    timeline = [
        {
            "paso": "compra_solicitada",
            "estado": "completado" if mensaje else "pendiente",
            "fecha": getattr(mensaje, "fecha_hora", None),
            "descripcion": "El comprador inició conversación sobre el producto",
        },
        {
            "paso": "comprobante_registrado",
            "estado": "completado",
            "fecha": comprobante.fecha_creacion,
            "descripcion": "Se cargó el comprobante y quedó pendiente de validación",
        },
        {
            "paso": "validacion_pago",
            "estado": comprobante.estado,
            "fecha": comprobante.fecha_resolucion,
            "descripcion": "Resultado final de la validación del comprobante",
        },
    ]

    return {
        "comprobante_id": comprobante.id,
        "estado_actual": comprobante.estado,
        "timeline": timeline,
    }
