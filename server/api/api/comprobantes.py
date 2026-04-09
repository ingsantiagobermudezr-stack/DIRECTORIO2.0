from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.db.conexion import get_db
from api.models.models import Comprobante
from api.schemas.schemas import ComprobanteCreate, ComprobanteResponse

router = APIRouter()


@router.post("/comprobantes/", response_model=ComprobanteResponse, status_code=201)
def create_comprobante(payload: ComprobanteCreate, db: Session = Depends(get_db)):
    db_item = Comprobante(**payload.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/comprobantes/", response_model=list[ComprobanteResponse])
def list_comprobantes(
    skip: int = 0,
    limit: int = 50,
    id_archivo: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Comprobante)
    if id_archivo is not None:
        query = query.filter(Comprobante.id_archivo == id_archivo)
    return query.offset(skip).limit(limit).all()


@router.get("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
def get_comprobante(comprobante_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return db_item


@router.put("/comprobantes/{comprobante_id}", response_model=ComprobanteResponse)
def update_comprobante(comprobante_id: int, payload: ComprobanteCreate, db: Session = Depends(get_db)):
    db_item = db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/comprobantes/{comprobante_id}")
def delete_comprobante(comprobante_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    db.delete(db_item)
    db.commit()
    return {"detail": "Comprobante eliminado"}
