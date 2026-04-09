from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from api.schemas.schemas import ReviewCreate, ReviewResponse, ReviewResponseCreate
from api.models.models import Review
from api.db.conexion import get_db

router = APIRouter()

# RUTAS PARA REVIEW
@router.post("/reviews/", response_model=ReviewResponseCreate)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/reviews/", response_model=list[ReviewResponse])
def read_reviews(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Review).offset(skip).limit(limit).all()

@router.get("/reviews/{id_empresa}", response_model=list[ReviewResponse])
def read_review(id_empresa: int, db: Session = Depends(get_db)):
    review = (db.query(Review)
        .filter(Review.id_empresa == id_empresa)
        .options(joinedload(Review.usuario)).all())
    if not review:
        return []
    return review

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, review: ReviewCreate, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id_review == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    for key, value in review.dict().items():
        setattr(db_review, key, value)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    review.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Review desactivada correctamente"}
