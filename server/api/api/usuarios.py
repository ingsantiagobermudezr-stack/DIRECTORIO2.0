from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from api.schemas.schemas import UsuarioUpdate, UsuarioResponse, UsuarioCreate
from api.models.models import Usuario, Rol
from api.db.conexion import get_db
from api.utils.audit import log_auditoria


router = APIRouter()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


@router.post("/usuarios/", response_model=UsuarioResponse, status_code=201)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe un usuario con ese correo
    existing_user = db.query(Usuario).filter(Usuario.correo == usuario.correo).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario registrado con este correo electrónico"
        )
    # Hashear contraseña antes de almacenar
    hashed = pwd_context.hash(usuario.password)
    data = {**usuario.dict(exclude={"password"}), "password": hashed}
    db_usuario = Usuario(**data)

    # Si se proporcionó id_rol, asignarlo y actualizar campo legible
    if usuario.id_rol:
        role = db.query(Rol).filter(Rol.id_rol == usuario.id_rol).first()
        if role:
            db_usuario.id_rol = role.id_rol
            db_usuario.rol = role.nombre

    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    # Auditoría
    try:
        log_auditoria(db, tabla='usuario', operacion='create', id_registro=db_usuario.id_usuario, descripcion=f'Usuario creado: {db_usuario.correo}')
    except Exception:
        pass

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

    update_data = usuario.dict(exclude_unset=True)
    # Manejar id_rol explícitamente
    if 'id_rol' in update_data:
        new_id_rol = update_data.pop('id_rol')
        if new_id_rol is not None:
            role = db.query(Rol).filter(Rol.id_rol == new_id_rol).first()
            if role:
                db_usuario.id_rol = role.id_rol
                db_usuario.rol = role.nombre
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)

    try:
        log_auditoria(db, tabla='usuario', operacion='update', id_registro=db_usuario.id_usuario, descripcion=f'Usuario actualizado: {db_usuario.correo}')
    except Exception:
        pass

    return db_usuario


@router.delete("/usuarios/{usuario_id}")
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()

    try:
        log_auditoria(db, tabla='usuario', operacion='delete', id_registro=usuario_id, descripcion=f'Usuario eliminado: id {usuario_id}')
    except Exception:
        pass

    return {"message": "Usuario eliminado correctamente"}
