from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session

from api.schemas.schemas import MunicipioCreate, MunicipioResponse
from api.models.models import Municipio
from api.db.conexion import get_db

router = APIRouter()


# RUTAS PARA MUNICIPIO
@router.post("/municipios/", response_model=MunicipioResponse)
def create_municipio(municipio: MunicipioCreate, db: Session = Depends(get_db)):
    db_municipio = Municipio(**municipio.dict())
    db.add(db_municipio)
    db.commit()
    db.refresh(db_municipio)
    return db_municipio

@router.get("/municipios/", response_model=list[MunicipioResponse])
def read_municipios(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Municipio).offset(skip).limit(limit).all()

@router.get("/municipios/{municipio_id}", response_model=MunicipioResponse)
def read_municipio(municipio_id: int, db: Session = Depends(get_db)):
    municipio = db.query(Municipio).filter(Municipio.id_municipio == municipio_id).first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")
    return municipio

@router.put("/municipios/{municipio_id}", response_model=MunicipioResponse)
def update_municipio(municipio_id: int, municipio: MunicipioCreate, db: Session = Depends(get_db)):
    db_municipio = db.query(Municipio).filter(Municipio.id_municipio == municipio_id).first()
    if not db_municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")
    for key, value in municipio.dict().items():
        setattr(db_municipio, key, value)
    db.commit()
    db.refresh(db_municipio)
    return db_municipio

@router.delete("/municipios/{municipio_id}")
def delete_municipio(municipio_id: int, db: Session = Depends(get_db)):
    municipio = db.query(Municipio).filter(Municipio.id == municipio_id).first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")
    municipio.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Municipio desactivado correctamente"}