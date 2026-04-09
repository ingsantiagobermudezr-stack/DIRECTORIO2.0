from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.schemas.schemas import ReviewCreate, ReviewResponse, ReviewResponseCreate
from api.models.models import Review, Mensaje, Marketplace, Comprobante, ArchivoMensaje, Empresa
from api.db.conexion import get_db
from api.api.auth import can_view_deleted_records, require_permission
from api.api.notificaciones import create_business_notification
from seeders.seed_permisos import Permisos

router = APIRouter()


async def _has_interaccion_previa(db: AsyncSession, id_usuario: int, id_empresa: int) -> bool:
    """Valida interacción previa por mensaje o comprobante válido asociado a la empresa."""
    mensaje_interaccion_q = (
        select(Mensaje.id)
        .join(Marketplace, Marketplace.id == Mensaje.id_marketplace)
        .where(
            Marketplace.id_empresa == id_empresa,
            Marketplace.deleted_at.is_(None),
            Mensaje.deleted_at.is_(None),
            or_(
                Mensaje.id_usuario_creador_chat == id_usuario,
                Mensaje.id_usuario_enviador_mensaje == id_usuario,
            ),
        )
        .limit(1)
    )
    mensaje_interaccion = await db.execute(mensaje_interaccion_q)
    if mensaje_interaccion.scalar_one_or_none() is not None:
        return True

    comprobante_interaccion_q = (
        select(Comprobante.id)
        .join(ArchivoMensaje, ArchivoMensaje.id == Comprobante.id_archivo)
        .join(Mensaje, Mensaje.id == ArchivoMensaje.id_mensaje)
        .join(Marketplace, Marketplace.id == Mensaje.id_marketplace)
        .where(
            Marketplace.id_empresa == id_empresa,
            Marketplace.deleted_at.is_(None),
            Mensaje.deleted_at.is_(None),
            ArchivoMensaje.deleted_at.is_(None),
            Comprobante.deleted_at.is_(None),
            Comprobante.recibo_valido.is_(True),
            or_(
                Mensaje.id_usuario_creador_chat == id_usuario,
                Mensaje.id_usuario_enviador_mensaje == id_usuario,
            ),
        )
        .limit(1)
    )
    comprobante_interaccion = await db.execute(comprobante_interaccion_q)
    return comprobante_interaccion.scalar_one_or_none() is not None


async def _ensure_review_rules(
    db: AsyncSession,
    review: ReviewCreate,
    review_id_to_exclude: int | None = None,
) -> None:
    duplicate_q = select(Review).where(
        Review.id_empresa == review.id_empresa,
        Review.id_usuario == review.id_usuario,
        Review.deleted_at.is_(None),
    )
    if review_id_to_exclude is not None:
        duplicate_q = duplicate_q.where(Review.id != review_id_to_exclude)

    duplicate = await db.execute(duplicate_q.limit(1))
    if duplicate.scalars().first():
        raise HTTPException(
            status_code=409,
            detail="Ya existe una review activa de este usuario para esta empresa",
        )

    has_interaccion_previa = await _has_interaccion_previa(
        db=db,
        id_usuario=review.id_usuario,
        id_empresa=review.id_empresa,
    )
    if not has_interaccion_previa:
        raise HTTPException(
            status_code=400,
            detail="Solo puedes crear una review si existe interacción previa (mensaje o comprobante válido)",
        )

# RUTAS PARA REVIEW
@router.post("/reviews/", response_model=ReviewResponseCreate)
async def create_review(
    review: ReviewCreate,
    current_user = Depends(require_permission(Permisos.CREAR_REVIEWS)),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_review_rules(db=db, review=review)
    db_review = Review(**review.model_dump())
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)

    empresa_result = await db.execute(
        select(Empresa).where(Empresa.id == db_review.id_empresa, Empresa.deleted_at.is_(None))
    )
    empresa = empresa_result.scalars().first()
    empresa_owner_id = getattr(empresa, "id_usuario_creador", None)

    if empresa_owner_id and empresa_owner_id != db_review.id_usuario:
        try:
            await create_business_notification(
                db,
                id_usuario_destinatario=empresa_owner_id,
                tipo="new_review",
                contenido=f"Recibiste una nueva review con calificación {db_review.calificacion}",
                id_usuario_remitente=db_review.id_usuario,
            )
        except HTTPException:
            # La reseña ya fue creada; no bloqueamos por fallo de notificación.
            pass

    return db_review

@router.get("/reviews/", response_model=list[ReviewResponse])
async def read_reviews(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Review).options(joinedload(Review.usuario))
    if not can_view_deleted:
        query = query.where(Review.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/reviews/{id_empresa}", response_model=list[ReviewResponse])
async def read_review(
    id_empresa: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Review)
        .where(Review.id_empresa == id_empresa)
        .options(joinedload(Review.usuario))
    )
    if not can_view_deleted:
        query = query.where(Review.deleted_at.is_(None))
    result = await db.execute(query)
    review = result.scalars().all()
    if not review:
        return []
    return review

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review: ReviewCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_REVIEWS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    db_review = result.scalars().first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    await _ensure_review_rules(db=db, review=review, review_id_to_exclude=review_id)

    for key, value in review.model_dump().items():
        setattr(db_review, key, value)
    await db.commit()
    result = await db.execute(select(Review).options(joinedload(Review.usuario)).where(Review.id == review_id))
    updated_review = result.scalars().first()
    return updated_review

@router.delete("/reviews/{review_id}")
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    review.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Review desactivada correctamente"}


@router.patch("/reviews/{review_id}/restore")
async def restore_review(
    review_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    review.deleted_at = None
    await db.commit()
    return {"message": "Review restaurada correctamente"}
