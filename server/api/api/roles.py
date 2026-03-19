from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.models.models import Rol, Permiso
from api.schemas.schemas import RolCreate, RolResponse

router = APIRouter()


@router.get("/roles", response_model=List[RolResponse])
def list_roles(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Rol).offset(skip).limit(limit).all()


@router.post("/roles", response_model=RolResponse, status_code=201)
def create_role(payload: RolCreate, db: Session = Depends(get_db)):
    db_role = Rol(nombre=payload.nombre, descripcion=payload.descripcion)
    if payload.permiso_ids:
        permisos = db.query(Permiso).filter(Permiso.id_permiso.in_(payload.permiso_ids)).all()
        db_role.permisos = permisos
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


@router.get("/roles/{id_rol}", response_model=RolResponse)
def get_role(id_rol: int, db: Session = Depends(get_db)):
    role = db.query(Rol).filter(Rol.id_rol == id_rol).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/roles/{id_rol}", response_model=RolResponse)
def update_role(id_rol: int, payload: RolCreate, db: Session = Depends(get_db)):
    role = db.query(Rol).filter(Rol.id_rol == id_rol).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.nombre = payload.nombre
    role.descripcion = payload.descripcion
    if payload.permiso_ids:
        permisos = db.query(Permiso).filter(Permiso.id_permiso.in_(payload.permiso_ids)).all()
        role.permisos = permisos
    db.commit()
    db.refresh(role)
    return role


@router.delete("/roles/{id_rol}")
def delete_role(id_rol: int, db: Session = Depends(get_db)):
    role = db.query(Rol).filter(Rol.id_rol == id_rol).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return {"detail": "Role deleted"}
