from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.schemas.schemas import ReviewCreate, ReviewResponse, ReviewResponseCreate
from api.models.models import Review
from api.db.conexion import get_db

router = APIRouter()

# RUTAS PARA REVIEW
@router.post("/reviews/", response_model=ReviewResponseCreate)
async def create_review(review: ReviewCreate, db: AsyncSession = Depends(get_db)):
    db_review = Review(**review.model_dump())
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review

@router.get("/reviews/", response_model=list[ReviewResponse])
async def read_reviews(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.usuario))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/reviews/{id_empresa}", response_model=list[ReviewResponse])
async def read_review(id_empresa: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review)
        .where(Review.id_empresa == id_empresa)
        .options(joinedload(Review.usuario))
    )
    review = result.scalars().all()
    if not review:
        return []
    return review

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(review_id: int, review: ReviewCreate, db: AsyncSession = Depends(get_db)):
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
