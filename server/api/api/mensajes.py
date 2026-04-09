from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.db.conexion import get_db
from api.models.models import Mensaje
from api.schemas.schemas import MensajeCreate, MensajeResponse

router = APIRouter()


@router.post("/mensajes/", response_model=MensajeResponse, status_code=201)
def create_mensaje(payload: MensajeCreate, db: Session = Depends(get_db)):
    db_item = Mensaje(**payload.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/mensajes/", response_model=list[MensajeResponse])
def list_mensajes(
    skip: int = 0,
    limit: int = 50,
    id_marketplace: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Mensaje)
    if id_marketplace is not None:
        query = query.filter(Mensaje.id_marketplace == id_marketplace)
    return query.order_by(Mensaje.fecha_hora.desc()).offset(skip).limit(limit).all()


@router.get("/mensajes/{mensaje_id}", response_model=MensajeResponse)
def get_mensaje(mensaje_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Mensaje).filter(Mensaje.id == mensaje_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return db_item


@router.put("/mensajes/{mensaje_id}", response_model=MensajeResponse)
def update_mensaje(mensaje_id: int, payload: MensajeCreate, db: Session = Depends(get_db)):
    db_item = db.query(Mensaje).filter(Mensaje.id == mensaje_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/mensajes/{mensaje_id}")
def delete_mensaje(mensaje_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Mensaje).filter(Mensaje.id == mensaje_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    db.delete(db_item)
    db.commit()
    return {"detail": "Mensaje eliminado"}
