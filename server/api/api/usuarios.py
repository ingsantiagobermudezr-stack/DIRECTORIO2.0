from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.schemas.schemas import UsuarioUpdate, UsuarioResponse, UsuarioBase
from api.models.models import Usuario
from api.db.conexion import get_db


router = APIRouter()

@router.post("/usuarios/", response_model=UsuarioResponse)
def create_usuario(usuario: UsuarioBase, db: Session = Depends(get_db)):
    db_usuario = Usuario(**usuario.dict())
    print(db_usuario)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

# RUTAS PARA USUARIO
@router.get("/usuarios/", response_model=list[UsuarioResponse])
def read_usuarios(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Usuario).offset(skip).limit(limit).all()

@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(usuario_id: int, usuario: UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for key, value in usuario.dict(exclude_unset=True).items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/usuarios/{usuario_id}")
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
