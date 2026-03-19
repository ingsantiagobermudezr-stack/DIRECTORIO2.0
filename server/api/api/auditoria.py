from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.models.models import Auditoria
from api.schemas.schemas import AuditoriaResponse

router = APIRouter()


@router.get("/auditoria", response_model=List[AuditoriaResponse])
def list_auditoria(db: Session = Depends(get_db)):
    return db.query(Auditoria).order_by(Auditoria.fecha.desc()).limit(200).all()
