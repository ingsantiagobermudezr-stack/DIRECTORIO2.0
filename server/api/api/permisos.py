from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.models.models import Permiso
from api.schemas.schemas import PermisoResponse, PermisoBase

router = APIRouter()


@router.get("/permisos", response_model=List[PermisoResponse])
def list_permisos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Permiso).offset(skip).limit(limit).all()


@router.post("/permisos", response_model=PermisoResponse, status_code=201)
def create_permiso(payload: PermisoBase, db: Session = Depends(get_db)):
    db_perm = Permiso(key=payload.key, descripcion=payload.descripcion)
    db.add(db_perm)
    db.commit()
    db.refresh(db_perm)
    return db_perm


@router.get("/permisos/{id_permiso}", response_model=PermisoResponse)
def get_permiso(id_permiso: int, db: Session = Depends(get_db)):
    perm = db.query(Permiso).filter(Permiso.id == id_permiso).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    return perm


@router.put("/permisos/{id_permiso}", response_model=PermisoResponse)
def update_permiso(id_permiso: int, payload: PermisoBase, db: Session = Depends(get_db)):
    perm = db.query(Permiso).filter(Permiso.id == id_permiso).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    perm.key = payload.key
    perm.descripcion = payload.descripcion
    db.commit()
    db.refresh(perm)
    return perm


@router.delete("/permisos/{id_permiso}")
def delete_permiso(id_permiso: int, db: Session = Depends(get_db)):
    perm = db.query(Permiso).filter(Permiso.id == id_permiso).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso not found")
    perm.deleted_at = datetime.utcnow()
    db.commit()
    return {"detail": "Permiso deactivated"}
