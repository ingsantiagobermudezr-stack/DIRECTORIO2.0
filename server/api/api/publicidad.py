from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.schemas.schemas import PublicidadCreate, PublicidadResponse
from api.models.models import Publicidad
from api.db.conexion import get_db

router = APIRouter()

@router.post("/publicidades/", response_model=PublicidadResponse)
def create_publicidad(publicidad: PublicidadCreate, db: Session = Depends(get_db)):
    try:
        db_publicidad = Publicidad(**publicidad.dict())
        db.add(db_publicidad)
        db.commit()
        db.refresh(db_publicidad)
        return db_publicidad
    except Exception as e:
        print(f"Error al crear publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al crear la publicidad")

@router.get("/publicidades/", response_model=list[PublicidadResponse])
def read_publicidades(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Publicidad).offset(skip).limit(limit).all()

@router.get("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
def read_publicidad(publicidad_id: int, db: Session = Depends(get_db)):
    publicidad = db.query(Publicidad).filter(Publicidad.id_publicidad == publicidad_id).first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    return publicidad

@router.put("/publicidades/{publicidad_id}", response_model=PublicidadResponse)
def update_publicidad(publicidad_id: int, publicidad: PublicidadCreate, db: Session = Depends(get_db)):
    db_publicidad = db.query(Publicidad).filter(Publicidad.id_publicidad == publicidad_id).first()
    if not db_publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    try:
        for key, value in publicidad.dict().items():
            setattr(db_publicidad, key, value)
        db.commit()
        db.refresh(db_publicidad)
        return db_publicidad
    except Exception as e:
        print(f"Error al actualizar publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar la publicidad")

@router.delete("/publicidades/{publicidad_id}")
def delete_publicidad(publicidad_id: int, db: Session = Depends(get_db)):
    publicidad = db.query(Publicidad).filter(Publicidad.id_publicidad == publicidad_id).first()
    if not publicidad:
        raise HTTPException(status_code=404, detail="Publicidad no encontrada")
    try:
        db.delete(publicidad)
        db.commit()
        return {"message": "Publicidad eliminada correctamente"}
    except Exception as e:
        print(f"Error al eliminar publicidad: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar la publicidad")
