from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy.orm import Session

from api.db.conexion import get_db
from api.models.models import ArchivoMensaje
from api.schemas.schemas import ArchivoMensajeCreate, ArchivoMensajeResponse

router = APIRouter()


@router.post("/archivos-mensajes/", response_model=ArchivoMensajeResponse, status_code=201)
def create_archivo_mensaje(payload: ArchivoMensajeCreate, db: Session = Depends(get_db)):
    db_item = ArchivoMensaje(**payload.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/archivos-mensajes/", response_model=list[ArchivoMensajeResponse])
def list_archivos_mensajes(
    skip: int = 0,
    limit: int = 50,
    id_mensaje: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(ArchivoMensaje)
    if id_mensaje is not None:
        query = query.filter(ArchivoMensaje.id_mensaje == id_mensaje)
    return query.offset(skip).limit(limit).all()


@router.get("/archivos-mensajes/{archivo_id}", response_model=ArchivoMensajeResponse)
def get_archivo_mensaje(archivo_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ArchivoMensaje).filter(ArchivoMensaje.id == archivo_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")
    return db_item


@router.put("/archivos-mensajes/{archivo_id}", response_model=ArchivoMensajeResponse)
def update_archivo_mensaje(archivo_id: int, payload: ArchivoMensajeCreate, db: Session = Depends(get_db)):
    db_item = db.query(ArchivoMensaje).filter(ArchivoMensaje.id == archivo_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/archivos-mensajes/{archivo_id}")
def delete_archivo_mensaje(archivo_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ArchivoMensaje).filter(ArchivoMensaje.id == archivo_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Archivo de mensaje no encontrado")

    db_item.deleted_at = datetime.utcnow()
    db.commit()
    return {"detail": "Archivo de mensaje desactivado"}
