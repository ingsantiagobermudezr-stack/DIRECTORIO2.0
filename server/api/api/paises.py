from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.models.models import Pais, Departamento, Ciudad
from api.schemas.schemas import PaisResponse, PaisBase, CiudadResponse, CiudadBase

router = APIRouter()


@router.get("/paises", response_model=List[PaisResponse])
def list_paises(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Pais).offset(skip).limit(limit).all()


@router.post("/paises", response_model=PaisResponse, status_code=201)
def create_pais(payload: PaisBase, db: Session = Depends(get_db)):
    db_p = Pais(nombre=payload.nombre, codigo_iso=payload.codigo_iso)
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.get("/departamentos", response_model=List[dict])
def list_departamentos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    deps = db.query(Departamento).offset(skip).limit(limit).all()
    return [ {"id_departamento": d.id_departamento, "nombre": d.nombre, "id_pais": d.id_pais} for d in deps ]


@router.get("/ciudades", response_model=List[CiudadResponse])
def list_ciudades(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(Ciudad).offset(skip).limit(limit).all()
