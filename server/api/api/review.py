from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.schemas.schemas import ReviewCreate, ReviewResponse, ReviewResponseCreate
from api.models.models import Review
from api.db.conexion import get_db
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()

# RUTAS PARA REVIEW
@router.post("/reviews/", response_model=ReviewResponseCreate)
async def create_review(
    review: ReviewCreate,
    current_user = Depends(require_permission(Permisos.CREAR_REVIEWS)),
    db: AsyncSession = Depends(get_db)
):
    db_review = Review(**review.model_dump())
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
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
