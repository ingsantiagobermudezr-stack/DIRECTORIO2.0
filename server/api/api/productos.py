from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.models.models import Producto
from api.schemas.schemas import ProductoCreate, ProductoResponse

router = APIRouter()


@router.get("/productos", response_model=List[ProductoResponse])
def list_productos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Producto).offset(skip).limit(limit).all()


@router.post("/productos", response_model=ProductoResponse, status_code=201)
def create_producto(payload: ProductoCreate, db: Session = Depends(get_db)):
    db_p = Producto(**payload.dict())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.get("/productos/{id_producto}", response_model=ProductoResponse)
def get_producto(id_producto: int, db: Session = Depends(get_db)):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto not found")
    return p


@router.delete("/productos/{id_producto}")
def delete_producto(id_producto: int, db: Session = Depends(get_db)):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto not found")
    p.deleted_at = datetime.utcnow()
    db.commit()
    return {"detail": "Producto desactivado"}
