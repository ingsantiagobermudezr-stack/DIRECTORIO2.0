from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session

from api.schemas.schemas import ResultadoCreate, ResultadoResponse
from api.models.models import Resultado
from api.db.conexion import get_db


router = APIRouter()

# RUTAS PARA TELEMETRIA DE BUSQUEDA
@router.post("/resultados/", response_model=ResultadoResponse)
def create_resultado(resultado: ResultadoCreate, db: Session = Depends(get_db)):
    db_resultado = Resultado(**resultado.model_dump())
    db.add(db_resultado)
    db.commit()
    db.refresh(db_resultado)
    return db_resultado

@router.get("/resultados/", response_model=list[ResultadoResponse])
def read_resultados(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Resultado).order_by(Resultado.fecha_hora.desc()).offset(skip).limit(limit).all()

@router.get("/resultados/{resultado_id}", response_model=ResultadoResponse)
def read_resultado(resultado_id: int, db: Session = Depends(get_db)):
    resultado = db.query(Resultado).filter(Resultado.id == resultado_id).first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    return resultado

@router.put("/resultados/{resultado_id}", response_model=ResultadoResponse)
def update_resultado(resultado_id: int, resultado: ResultadoCreate, db: Session = Depends(get_db)):
    db_resultado = db.query(Resultado).filter(Resultado.id == resultado_id).first()
    if not db_resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    for key, value in resultado.model_dump().items():
        setattr(db_resultado, key, value)
    db.commit()
    db.refresh(db_resultado)
    return db_resultado

@router.delete("/resultados/{resultado_id}")
def delete_resultado(resultado_id: int, db: Session = Depends(get_db)):
    resultado = db.query(Resultado).filter(Resultado.id == resultado_id).first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    resultado.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Resultado desactivado correctamente"}
