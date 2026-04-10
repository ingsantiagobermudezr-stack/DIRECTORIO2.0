from datetime import datetime, time

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, case, cast, func, Numeric, select, String
from sqlalchemy.ext.asyncio import AsyncSession
from api.api.auth import require_permission
from api.db.conexion import get_db
from api.models.models import ArchivoMensaje, Comprobante, Empresa, EventoMarketplace, EstadoFlujo, Marketplace, Mensaje, Resultado, Review, TipoEvento, Usuario
from seeders.seed_permisos import Permisos

router = APIRouter()


def _normalize_date_range(desde: datetime | None, hasta: datetime | None) -> tuple[datetime | None, datetime | None]:
    """Normaliza fechas para cubrir el dia completo cuando llegan sin hora."""
    if desde and desde.time() == time(0, 0, 0):
        desde = datetime.combine(desde.date(), time.min)
    if hasta and hasta.time() == time(0, 0, 0):
        hasta = datetime.combine(hasta.date(), time.max)
    return desde, hasta


def _safe_rate(numerator: int, denominator: int) -> float:
    return round((numerator / denominator) * 100, 2) if denominator else 0.0


@router.get("/reportes/transacciones/resumen")
async def reporte_transacciones_resumen(
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    id_empresa: int | None = Query(default=None),
    _: object = Depends(require_permission(Permisos.VER_REPORTES)),
    db: AsyncSession = Depends(get_db),
):
    """
    Resumen operativo de transacciones:
    - total_transacciones
    - monto_total_valido (suma de cantidad_recibida en comprobantes validos)
    - tasa_validez_porcentaje
    - detalle opcional por empresa
    """
    desde, hasta = _normalize_date_range(desde, hasta)

    base_filters = [
        Comprobante.deleted_at.is_(None),
        ArchivoMensaje.deleted_at.is_(None),
        Mensaje.deleted_at.is_(None),
        Marketplace.deleted_at.is_(None),
        Empresa.deleted_at.is_(None),
    ]

    if desde is not None:
        base_filters.append(Comprobante.fecha_creacion >= desde)
    if hasta is not None:
        base_filters.append(Comprobante.fecha_creacion <= hasta)
    if id_empresa is not None:
        base_filters.append(Empresa.id == id_empresa)

    total_q = (
        select(func.count(Comprobante.id))
        .join(ArchivoMensaje, ArchivoMensaje.id == Comprobante.id_archivo)
        .join(Mensaje, Mensaje.id == ArchivoMensaje.id_mensaje)
        .join(Marketplace, Marketplace.id == Mensaje.id_marketplace)
        .join(Empresa, Empresa.id == Marketplace.id_empresa)
        .where(and_(*base_filters))
    )
    total_result = await db.execute(total_q)
    total_transacciones = int(total_result.scalar() or 0)

    valid_filters = list(base_filters)
    valid_filters.append(Comprobante.recibo_valido.is_(True))

    valid_q = (
        select(
            func.count(Comprobante.id),
            func.coalesce(func.sum(Comprobante.cantidad_recibida), 0.0),
        )
        .join(ArchivoMensaje, ArchivoMensaje.id == Comprobante.id_archivo)
        .join(Mensaje, Mensaje.id == ArchivoMensaje.id_mensaje)
        .join(Marketplace, Marketplace.id == Mensaje.id_marketplace)
        .join(Empresa, Empresa.id == Marketplace.id_empresa)
        .where(and_(*valid_filters))
    )
    valid_result = await db.execute(valid_q)
    valid_count, monto_total_valido = valid_result.one()
    valid_count = int(valid_count or 0)
    monto_total_valido = float(monto_total_valido or 0.0)

    tasa_validez_porcentaje = round((valid_count / total_transacciones) * 100, 2) if total_transacciones else 0.0

    by_empresa_q = (
        select(
            Empresa.id.label("id_empresa"),
            Empresa.nombre.label("empresa"),
            func.count(Comprobante.id).label("total_transacciones"),
            func.sum(case((Comprobante.recibo_valido.is_(True), 1), else_=0)).label("validas"),
            func.coalesce(
                func.sum(
                    case(
                        (Comprobante.recibo_valido.is_(True), Comprobante.cantidad_recibida),
                        else_=0.0,
                    )
                ),
                0.0,
            ).label("monto_total_valido"),
        )
        .join(Marketplace, Marketplace.id_empresa == Empresa.id)
        .join(Mensaje, Mensaje.id_marketplace == Marketplace.id)
        .join(ArchivoMensaje, ArchivoMensaje.id_mensaje == Mensaje.id)
        .join(Comprobante, Comprobante.id_archivo == ArchivoMensaje.id)
        .where(and_(*base_filters))
        .group_by(Empresa.id, Empresa.nombre)
        .order_by(func.coalesce(func.sum(Comprobante.cantidad_recibida), 0.0).desc())
    )
    by_empresa_result = await db.execute(by_empresa_q)

    detalle_por_empresa = []
    for row in by_empresa_result.all():
        total_emp = int(row.total_transacciones or 0)
        valid_emp = int(row.validas or 0)
        detalle_por_empresa.append(
            {
                "id_empresa": row.id_empresa,
                "empresa": row.empresa,
                "total_transacciones": total_emp,
                "monto_total_valido": float(row.monto_total_valido or 0.0),
                "tasa_validez_porcentaje": round((valid_emp / total_emp) * 100, 2) if total_emp else 0.0,
            }
        )

    return {
        "filtros": {
            "desde": desde.isoformat() if desde else None,
            "hasta": hasta.isoformat() if hasta else None,
            "id_empresa": id_empresa,
        },
        "resumen_global": {
            "total_transacciones": total_transacciones,
            "monto_total_valido": monto_total_valido,
            "tasa_validez_porcentaje": tasa_validez_porcentaje,
        },
        "detalle_por_empresa": detalle_por_empresa,
    }


@router.get("/reportes/comprobantes/tasa-aprobacion-evaluadores")
async def reporte_tasa_aprobacion_evaluadores(
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=200),
    _: object = Depends(require_permission(Permisos.VER_REPORTES)),
    db: AsyncSession = Depends(get_db),
):
    """Tasa de aprobacion de comprobantes por evaluador."""
    desde, hasta = _normalize_date_range(desde, hasta)

    filters = [Comprobante.deleted_at.is_(None)]
    if desde is not None:
        filters.append(Comprobante.fecha_creacion >= desde)
    if hasta is not None:
        filters.append(Comprobante.fecha_creacion <= hasta)

    query = (
        select(
            Usuario.id.label("id_evaluador"),
            Usuario.nombre.label("nombre"),
            Usuario.apellido.label("apellido"),
            func.count(Comprobante.id).label("total"),
            func.sum(case((EstadoFlujo.clave == "aprobado", 1), else_=0)).label("aprobados"),
            func.sum(case((EstadoFlujo.clave == "rechazado", 1), else_=0)).label("rechazados"),
            func.sum(case((EstadoFlujo.clave == "pendiente", 1), else_=0)).label("pendientes"),
        )
        .join(Comprobante, Comprobante.id_empleado_evaluador == Usuario.id)
        .join(EstadoFlujo, EstadoFlujo.id == Comprobante.id_estado_flujo)
        .where(and_(*filters))
        .group_by(Usuario.id, Usuario.nombre, Usuario.apellido)
        .order_by(func.sum(case((EstadoFlujo.clave == "aprobado", 1), else_=0)).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    data = []
    for row in result.all():
        total = int(row.total or 0)
        aprobados = int(row.aprobados or 0)
        data.append(
            {
                "id_evaluador": row.id_evaluador,
                "evaluador": f"{row.nombre} {row.apellido}".strip(),
                "total_comprobantes": total,
                "aprobados": aprobados,
                "rechazados": int(row.rechazados or 0),
                "pendientes": int(row.pendientes or 0),
                "tasa_aprobacion_porcentaje": round((aprobados / total) * 100, 2) if total else 0.0,
            }
        )

    return {"items": data}


@router.get("/reportes/marketplace/top-productos-chats")
async def reporte_top_productos_chats(
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    _: object = Depends(require_permission(Permisos.VER_REPORTES)),
    db: AsyncSession = Depends(get_db),
):
    """Top productos con mas chats iniciados (aprox por usuarios iniciadores unicos)."""
    desde, hasta = _normalize_date_range(desde, hasta)

    filters = [
        Mensaje.deleted_at.is_(None),
        Marketplace.deleted_at.is_(None),
        Empresa.deleted_at.is_(None),
    ]
    if desde is not None:
        filters.append(Mensaje.fecha_hora >= desde)
    if hasta is not None:
        filters.append(Mensaje.fecha_hora <= hasta)

    query = (
        select(
            Marketplace.id.label("id_marketplace"),
            Marketplace.nombre.label("producto"),
            Empresa.id.label("id_empresa"),
            Empresa.nombre.label("empresa"),
            func.count(Mensaje.id).label("total_mensajes"),
            func.count(func.distinct(cast(Mensaje.id_usuario_creador_chat, String))).label("chats_iniciados"),
        )
        .join(Empresa, Empresa.id == Marketplace.id_empresa)
        .join(Mensaje, Mensaje.id_marketplace == Marketplace.id)
        .where(and_(*filters))
        .group_by(Marketplace.id, Marketplace.nombre, Empresa.id, Empresa.nombre)
        .order_by(func.count(func.distinct(cast(Mensaje.id_usuario_creador_chat, String))).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    return {
        "items": [
            {
                "id_marketplace": row.id_marketplace,
                "producto": row.producto,
                "id_empresa": row.id_empresa,
                "empresa": row.empresa,
                "chats_iniciados": int(row.chats_iniciados or 0),
                "total_mensajes": int(row.total_mensajes or 0),
            }
            for row in result.all()
        ]
    }


@router.get("/reportes/empresas/top-rating-reviews")
async def reporte_top_empresas_rating_reviews(
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Top empresas por rating promedio y volumen de reviews."""
    desde, hasta = _normalize_date_range(desde, hasta)

    filters = [
        Review.deleted_at.is_(None),
        Empresa.deleted_at.is_(None),
    ]
    if desde is not None:
        filters.append(Review.fecha >= desde)
    if hasta is not None:
        filters.append(Review.fecha <= hasta)

    query = (
        select(
            Empresa.id.label("id_empresa"),
            Empresa.nombre.label("empresa"),
            func.round(cast(func.avg(Review.calificacion), Numeric), 2).label("rating_promedio"),
            func.count(Review.id).label("total_reviews"),
        )
        .join(Review, Review.id_empresa == Empresa.id)
        .where(and_(*filters))
        .group_by(Empresa.id, Empresa.nombre)
        .order_by(func.avg(Review.calificacion).desc(), func.count(Review.id).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    return {
        "items": [
            {
                "id_empresa": row.id_empresa,
                "empresa": row.empresa,
                "rating_promedio": float(row.rating_promedio or 0.0),
                "total_reviews": int(row.total_reviews or 0),
            }
            for row in result.all()
        ]
    }


@router.get("/reportes/funnel")
async def reporte_funnel_comercial(
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    _: object = Depends(require_permission(Permisos.VER_REPORTES)),
    db: AsyncSession = Depends(get_db),
):
    """Embudo comercial por periodo con métricas disponibles en el modelo actual."""
    desde, hasta = _normalize_date_range(desde, hasta)

    # 1) Búsquedas
    search_filters = [Resultado.deleted_at.is_(None)]
    if desde is not None:
        search_filters.append(Resultado.fecha_hora >= desde)
    if hasta is not None:
        search_filters.append(Resultado.fecha_hora <= hasta)

    busquedas_q = select(func.count(Resultado.id)).where(and_(*search_filters))
    busquedas_result = await db.execute(busquedas_q)
    busquedas = int(busquedas_result.scalar() or 0)

    # 2) Vistas y clics de producto (tracking dedicado)
    evento_filters = [EventoMarketplace.deleted_at.is_(None)]
    if desde is not None:
        evento_filters.append(EventoMarketplace.fecha_hora >= desde)
    if hasta is not None:
        evento_filters.append(EventoMarketplace.fecha_hora <= hasta)

    vistas_q = (
        select(func.count(EventoMarketplace.id))
        .join(TipoEvento, TipoEvento.id == EventoMarketplace.id_tipo_evento)
        .where(and_(*evento_filters, TipoEvento.clave == "vista"))
    )
    vistas_result = await db.execute(vistas_q)
    productos_vistos = int(vistas_result.scalar() or 0)

    clicks_q = (
        select(func.count(EventoMarketplace.id))
        .join(TipoEvento, TipoEvento.id == EventoMarketplace.id_tipo_evento)
        .where(and_(*evento_filters, TipoEvento.clave == "click"))
    )
    clicks_result = await db.execute(clicks_q)
    clics_producto = int(clicks_result.scalar() or 0)

    # 3) Chats iniciados (aproximado por combinación marketplace + usuario creador_chat)
    chat_key = cast(Mensaje.id_marketplace, String) + ":" + cast(Mensaje.id_usuario_creador_chat, String)
    chat_filters = [Mensaje.deleted_at.is_(None)]
    if desde is not None:
        chat_filters.append(Mensaje.fecha_hora >= desde)
    if hasta is not None:
        chat_filters.append(Mensaje.fecha_hora <= hasta)

    chats_q = select(func.count(func.distinct(chat_key))).where(and_(*chat_filters))
    chats_result = await db.execute(chats_q)
    chats_iniciados = int(chats_result.scalar() or 0)

    # 4) Comprobantes registrados y 5) comprobantes válidos
    comprobante_filters = [Comprobante.deleted_at.is_(None)]
    if desde is not None:
        comprobante_filters.append(Comprobante.fecha_creacion >= desde)
    if hasta is not None:
        comprobante_filters.append(Comprobante.fecha_creacion <= hasta)

    comprobantes_q = select(func.count(Comprobante.id)).where(and_(*comprobante_filters))
    comprobantes_result = await db.execute(comprobantes_q)
    comprobantes_registrados = int(comprobantes_result.scalar() or 0)

    comprobantes_validos_q = select(func.count(Comprobante.id)).where(
        and_(*comprobante_filters, Comprobante.recibo_valido.is_(True))
    )
    comprobantes_validos_result = await db.execute(comprobantes_validos_q)
    comprobantes_validos = int(comprobantes_validos_result.scalar() or 0)

    return {
        "filtros": {
            "desde": desde.isoformat() if desde else None,
            "hasta": hasta.isoformat() if hasta else None,
        },
        "metricas": {
            "busquedas": busquedas,
            "productos_vistos": productos_vistos,
            "clics_producto": clics_producto,
            "clics_productos_vistos": productos_vistos + clics_producto,
            "chats_iniciados": chats_iniciados,
            "comprobantes_registrados": comprobantes_registrados,
            "comprobantes_validos": comprobantes_validos,
        },
        "conversiones": {
            "busqueda_a_vista_porcentaje": _safe_rate(productos_vistos, busquedas),
            "vista_a_click_porcentaje": _safe_rate(clics_producto, productos_vistos),
            "click_a_chat_porcentaje": _safe_rate(chats_iniciados, clics_producto),
            "busqueda_a_chat_porcentaje": _safe_rate(chats_iniciados, busquedas),
            "chat_a_comprobante_porcentaje": _safe_rate(comprobantes_registrados, chats_iniciados),
            "comprobante_a_valido_porcentaje": _safe_rate(comprobantes_validos, comprobantes_registrados),
            "busqueda_a_valido_porcentaje": _safe_rate(comprobantes_validos, busquedas),
        },
    }
