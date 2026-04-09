from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session

from api.schemas.schemas import CategoriaCreate, CategoriaResponse
from api.models.models import Categoria
from api.db.conexion import get_db

router = APIRouter()

# RUTAS PARA CATEGORIA
@router.post("/categorias/", response_model=CategoriaResponse,
    summary="Crear nueva categoría",
    description="Crea una nueva categoría en el sistema",
    response_description="La categoría creada")
def create_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
):
    """
    Crear una nueva categoría con la siguiente información:
    
    - **nombre**: nombre de la categoría
    - **descripcion**: descripción detallada de la categoría
    """
    db_categoria = Categoria(**categoria.dict())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.get("/categorias/", response_model=list[CategoriaResponse],
    summary="Obtener categorías",
    description="Obtiene la lista de todas las categorías",
    response_description="Lista de categorías")
def read_categorias(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return db.query(Categoria).offset(skip).limit(limit).all()


@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
def read_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
def update_categoria(categoria_id: int, categoria: CategoriaCreate, db: Session = Depends(get_db)):
    db_categoria = db.query(Categoria).filter(Categoria.id_categoria == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for key, value in categoria.dict().items():
        setattr(db_categoria, key, value)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.delete("/categorias/{categoria_id}")
def delete_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    categoria.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Categoría desactivada correctamente"}
