from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.conexion import get_db
from api.models.models import Rol, Usuario, Empresa
from api.schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from api.api.auth import can_view_deleted_records, require_permission, is_admin_user, get_current_user
from seeders.seed_permisos import Permisos

router = APIRouter()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


@router.post("/usuarios/", response_model=UsuarioResponse, status_code=201)
async def create_usuario(
    usuario: UsuarioCreate,
    current_user = Depends(require_permission(Permisos.CREAR_USUARIOS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Usuario).where(Usuario.correo == usuario.correo))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ya existe un usuario registrado con este correo electrónico")

    hashed = pwd_context.hash(usuario.password)
    data = {**usuario.model_dump(exclude={"password"}), "password": hashed}
    db_usuario = Usuario(**data)

    if usuario.id_rol:
        role_result = await db.execute(select(Rol).where(Rol.id == usuario.id_rol))
        role = role_result.scalars().first()
        if role:
            db_usuario.id_rol = role.id

    db.add(db_usuario)
    await db.commit()
    await db.refresh(db_usuario)
    return db_usuario


@router.get("/usuarios/", response_model=list[UsuarioResponse])
async def read_usuarios(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Usuario)
    if not can_view_deleted:
        query = query.where(Usuario.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def read_usuario(
    usuario_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Usuario).where(Usuario.id == usuario_id)
    if not can_view_deleted:
        query = query.where(Usuario.deleted_at.is_(None))
    result = await db.execute(query)
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: int,
    usuario: UsuarioUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Allow admins OR empresa owners to update their team members
    is_admin = is_admin_user(current_user)
    
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    db_usuario = result.scalars().first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # If not admin, check if current user owns the empresa the user belongs to
    if not is_admin:
        if not db_usuario.id_empresa:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para modificar este usuario"
            )
        
        empresa_result = await db.execute(
            select(Empresa).where(
                Empresa.id == db_usuario.id_empresa,
                Empresa.id_usuario_creador == current_user.id,
                Empresa.deleted_at.is_(None)
            )
        )
        empresa = empresa_result.scalars().first()
        if not empresa:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para modificar este usuario"
            )

    update_data = usuario.model_dump(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data and update_data["password"]:
        update_data["password"] = pwd_context.hash(update_data["password"])
    
    if "id_rol" in update_data:
        new_id_rol = update_data.pop("id_rol")
        if new_id_rol is not None and is_admin:
            role_result = await db.execute(select(Rol).where(Rol.id == new_id_rol))
            role = role_result.scalars().first()
            if role:
                db_usuario.id_rol = role.id

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    await db.commit()
    await db.refresh(db_usuario)
    return db_usuario


@router.delete("/usuarios/{usuario_id}")
async def delete_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Usuario desactivado correctamente"}


@router.patch("/usuarios/{usuario_id}/restore")
async def restore_usuario(
    usuario_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.deleted_at = None
    await db.commit()
    return {"message": "Usuario restaurado correctamente"}
