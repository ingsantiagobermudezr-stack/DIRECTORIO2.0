from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from seeders.seed_permisos import Permisos
from typing import Optional
import os

from api.models import models
from api.db import conexion
from api.schemas.schemas import UsuarioRegister, SigninResponse, UsuarioResponse, PerfilUpdate

# Configuración de seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")  # usar variable de entorno en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)  # 1 hora por defecto

# Configuración de bcrypt para encriptar contraseñas
pwd_context = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/signin", auto_error=False)

router = APIRouter()

# Función para encriptar contraseñas
def hash_password(password: str):
    return pwd_context.hash(password)

# Función para verificar la contraseña
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Función para crear tokens JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependencia para obtener el usuario actual
async def get_user(db: AsyncSession, correo: str):
    result = await db.execute(
        select(models.Usuario)
        .options(selectinload(models.Usuario.rol_obj).selectinload(models.Rol.permisos))
        .where(models.Usuario.correo == correo)
    )
    return result.scalars().first()


def _extract_auth_context(user: models.Usuario) -> tuple[str | None, list[str]]:
    rol_nombre = None
    permisos: list[str] = []
    if getattr(user, "rol_obj", None):
        rol_nombre = getattr(user.rol_obj, "nombre", None)
        permisos = [p.key for p in (user.rol_obj.permisos or []) if getattr(p, "key", None)]
    return rol_nombre, permisos


def _has_permission(current_user: Optional[models.Usuario], permission_key: str) -> bool:
    if not current_user:
        return False
    _, permisos = _extract_auth_context(current_user)
    return permission_key in permisos


def is_admin_user(current_user: Optional[models.Usuario]) -> bool:
    """Admin de negocio: rol admin + permiso crítico de administración."""
    if not current_user:
        return False

    rol_nombre, permisos = _extract_auth_context(current_user)
    critical_permission = Permisos.MODIFICAR_ROLES.value
    return str(rol_nombre or "").lower() == "admin" and critical_permission in permisos

async def authenticate_user(db: AsyncSession, correo: str, password: str):
    user = await get_user(db, correo)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Ruta para autenticación de usuarios (login)
@router.post("/signin", response_model=SigninResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(conexion.get_db),
):

    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token con el correo en el campo `sub` para facilitar la recuperación
    user_sub = user.correo
    rol_nombre, permisos = _extract_auth_context(user)
    access_token = create_access_token(data={"sub": user_sub, "rol": rol_nombre, "id_usuario": user.id, "id_rol": getattr(user, 'id_rol', None)})

    # Establecer cookies para que el SSR y el cliente las reciban.
    # Token como HttpOnly; rol y permisos accesibles si es necesario.
    secure_flag = True if os.getenv('ENV', '').lower() == 'production' else False
    # token (HttpOnly)
    response.set_cookie(key='token', value=access_token, httponly=True, path='/', samesite='none', secure=secure_flag)
    # rol (no HttpOnly para facilitar SSR y JS si se desea)
    response.set_cookie(key='rol', value=str(rol_nombre), httponly=False, path='/', samesite='none', secure=secure_flag)
    # id_usuario
    response.set_cookie(key='id_usuario', value=str(user.id), httponly=False, path='/', samesite='none', secure=secure_flag)
    # permisos (serializar como JSON)
    try:
        import json
        permisos_val = json.dumps(permisos)
    except Exception:
        permisos_val = '[]'
    response.set_cookie(key='permisos', value=permisos_val, httponly=False, path='/', samesite='none', secure=secure_flag)

    return {"access_token": access_token, "rol": rol_nombre, "id_usuario": user.id, "id_rol": getattr(user, 'id_rol', None), "permisos": permisos}

@router.post("/signup", response_model=SigninResponse)
async def create_usuario(usuario: UsuarioRegister, db: AsyncSession = Depends(conexion.get_db)):
    # Validación longitud de contraseña
    if len(usuario.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    # Validación de correo único
    result = await db.execute(select(models.Usuario).where(models.Usuario.correo == usuario.correo))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ya existe un usuario registrado con este correo electrónico")

    # Crear usuario con password hasheada
    data_usuario = {
        **usuario.dict(),
        "id_rol": 2, # ROL USUARIO por defecto
        "password": hash_password(usuario.password)
    }

    db_usuario = models.Usuario(**data_usuario)
    db.add(db_usuario)
    await db.commit()
    await db.refresh(db_usuario)

    created_user_result = await db.execute(
        select(models.Usuario)
        .options(selectinload(models.Usuario.rol_obj).selectinload(models.Rol.permisos))
        .where(models.Usuario.id == db_usuario.id)
    )
    created_user = created_user_result.scalars().first()
    if not created_user:
        raise HTTPException(status_code=500, detail="No se pudo recuperar el usuario recién creado")

    rol_nombre, permisos = _extract_auth_context(created_user)
    access_token = create_access_token(
        data={
            "sub": created_user.correo,
            "rol": rol_nombre,
            "id_usuario": created_user.id,
            "id_rol": getattr(created_user, "id_rol", None),
        }
    )
    return {
        "access_token": access_token,
        "rol": rol_nombre,
        "id_usuario": created_user.id,
        "id_rol": getattr(created_user, "id_rol", None),
        "permisos": permisos,
    }

# Función para verificar el token y obtener el usuario actual
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: AsyncSession = Depends(conexion.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado. Inicia sesión para continuar.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(db, correo)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(conexion.get_db),
):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            return None
    except JWTError:
        return None
    return await get_user(db, correo)


async def can_view_deleted_records(current_user: Optional[models.Usuario] = Depends(get_current_user_optional)) -> bool:
    return _has_permission(current_user, Permisos.VER_REGISTROS_ELIMINADOS.value)


async def require_admin(current_user: models.Usuario = Depends(get_current_user)):
    if is_admin_user(current_user):
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requieren privilegios de administrador")

def require_permission(permission_name: Permisos):
    async def dependency(current_user: models.Usuario = Depends(get_current_user)):
        required_permission = permission_name.value if isinstance(permission_name, Permisos) else str(permission_name)

        if _has_permission(current_user, required_permission):
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Se requiere el permiso '{required_permission}'",
        )

    return dependency

@router.get("/me/permisos")
async def me_permisos(current_user: models.Usuario = Depends(get_current_user)):
    """Devuelve la lista de permisos asociados al rol del usuario autenticado."""
    _, permisos = _extract_auth_context(current_user)
    return {"permisos": permisos}


@router.put("/me/perfil", response_model=UsuarioResponse)
async def actualizar_mi_perfil(
    perfil: PerfilUpdate,
    current_user: models.Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(conexion.get_db),
):
    """
    Permite a un usuario autenticado actualizar su propia información personal.
    
    Campos actualizables: nombre, apellido, correo, password.
    El JWT NO se invalida al cambiar la contraseña (comportamiento estándar).
    """
    # Verificar si el correo ya está en uso por otro usuario
    if perfil.correo and perfil.correo != current_user.correo:
        result = await db.execute(
            select(models.Usuario).where(models.Usuario.correo == perfil.correo)
        )
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="El correo ya está registrado por otro usuario"
            )

    # Actualizar campos
    update_data = perfil.model_dump(exclude_unset=True)
    
    # Si hay contraseña nueva, hashearla
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])

    for key, value in update_data.items():
        setattr(current_user, key, value)

    await db.commit()
    await db.refresh(current_user)

    # Obtener datos completos del usuario actualizado
    user_result = await db.execute(
        select(models.Usuario)
        .options(selectinload(models.Usuario.rol_obj).selectinload(models.Rol.permisos))
        .where(models.Usuario.id == current_user.id)
    )
    user_completo = user_result.scalars().first()
    
    _, permisos = _extract_auth_context(user_completo)
    
    return {
        "id": user_completo.id,
        "nombre": user_completo.nombre,
        "apellido": user_completo.apellido,
        "correo": user_completo.correo,
        "rol": getattr(user_completo.rol_obj, "nombre", None) if user_completo.rol_obj else None,
        "id_rol": user_completo.id_rol,
        "id_empresa": user_completo.id_empresa,
    }


# @router.get('/puede')
# async def puede_tener_permiso(current_user: models.Usuario = Depends(require_permission(Permisos.CREAR_EMPRESA))):
#     """Ruta de prueba para verificar permisos específicos."""
#     return {"message": "Tienes el permiso requerido para acceder a esta ruta."}
