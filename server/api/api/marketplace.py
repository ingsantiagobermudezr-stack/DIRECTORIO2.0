
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from api.db.conexion import get_db
from api.models.models import Marketplace
from api.schemas.schemas import MarketplaceCreate, MarketplaceResponse

router = APIRouter()

# Listar productos/servicios marketplace
@router.get("/marketplace", response_model=List[MarketplaceResponse])
def get_marketplace(db: Session = Depends(get_db)):
    items = db.query(Marketplace).all()
    return items

# Obtener producto/servicio por ID
@router.get("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
def get_marketplace_item(id_marketplace: int, db: Session = Depends(get_db)):
    item = db.query(Marketplace).filter(Marketplace.id_marketplace == id_marketplace).first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    return item

# Crear producto/servicio
@router.post("/marketplace", response_model=MarketplaceResponse)
def create_marketplace(item: MarketplaceCreate, db: Session = Depends(get_db)):
    db_item = Marketplace(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Editar producto/servicio
@router.put("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
def update_marketplace(id_marketplace: int, item: MarketplaceCreate, db: Session = Depends(get_db)):
    db_item = db.query(Marketplace).filter(Marketplace.id_marketplace == id_marketplace).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

# Eliminar producto/servicio
@router.delete("/marketplace/{id_marketplace}")
def delete_marketplace(id_marketplace: int, db: Session = Depends(get_db)):
    db_item = db.query(Marketplace).filter(Marketplace.id_marketplace == id_marketplace).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Marketplace item deleted"}
