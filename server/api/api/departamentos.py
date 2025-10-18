from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.schemas.schemas import DepartamentoCreate, DepartamentoResponse
from api.models.models import Departamento
from api.db.conexion import get_db

router = APIRouter()

# RUTAS PARA DEPARTAMENTO
@router.post("/departamentos/", response_model=DepartamentoResponse)
def create_departamento(departamento: DepartamentoCreate, db: Session = Depends(get_db)):
    db_departamento = Departamento(**departamento.dict())
    db.add(db_departamento)
    db.commit()
    db.refresh(db_departamento)
    return db_departamento

@router.get("/departamentos/", response_model=list[DepartamentoResponse])
def read_departamentos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Departamento).offset(skip).limit(limit).all()

@router.get("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
def read_departamento(departamento_id: int, db: Session = Depends(get_db)):
    departamento = db.query(Departamento).filter(Departamento.id_departamento == departamento_id).first()
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return departamento

@router.put("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
def update_departamento(departamento_id: int, departamento: DepartamentoCreate, db: Session = Depends(get_db)):
    db_departamento = db.query(Departamento).filter(Departamento.id_departamento == departamento_id).first()
    if not db_departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    for key, value in departamento.dict().items():
        setattr(db_departamento, key, value)
    db.commit()
    db.refresh(db_departamento)
    return db_departamento

@router.delete("/departamentos/{departamento_id}")
def delete_departamento(departamento_id: int, db: Session = Depends(get_db)):
    departamento = db.query(Departamento).filter(Departamento.id_departamento == departamento_id).first()
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    db.delete(departamento)
    db.commit()
    return {"message": "Departamento eliminado correctamente"}
