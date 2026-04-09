from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Dict
import os

from api.models import models
from api.db import conexion
from api.schemas.schemas import UsuarioCreate, SigninResponse

# Configuración de seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")  # usar variable de entorno en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)  # 1 hora por defecto

# Configuración de bcrypt para encriptar contraseñas
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/signin")

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
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependencia para obtener el usuario actual
def get_user(db: Session, correo: str):
    return db.query(models.Usuario).filter(models.Usuario.correo == correo).first()

def authenticate_user(db: Session, correo: str, password: str):
    user = get_user(db, correo)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Ruta para autenticación de usuarios (login)
@router.post("/signin", response_model=SigninResponse)
async def login(form_data: Dict, response: Response, db: Session = Depends(conexion.get_db)):

    user = authenticate_user(db, form_data.get('correo'), form_data.get('password'))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token con el correo en el campo `sub` para facilitar la recuperación
    user_sub = user.correo
    # recoger permisos desde la relación rol_obj
    permisos = []
    try:
        if getattr(user, 'rol_obj', None) and getattr(user.rol_obj, 'permisos', None):
            permisos = [p.nombre for p in user.rol_obj.permisos]
    except Exception:
        permisos = []

    access_token = create_access_token(data={"sub": user_sub, "rol": user.rol, "id_usuario": user.id_usuario, "id_rol": getattr(user, 'id_rol', None)})

    # Establecer cookies para que el SSR y el cliente las reciban.
    # Token como HttpOnly; rol y permisos accesibles si es necesario.
    secure_flag = True if os.getenv('ENV', '').lower() == 'production' else False
    # token (HttpOnly)
    response.set_cookie(key='token', value=access_token, httponly=True, path='/', samesite='none', secure=secure_flag)
    # rol (no HttpOnly para facilitar SSR y JS si se desea)
    response.set_cookie(key='rol', value=str(user.rol), httponly=False, path='/', samesite='none', secure=secure_flag)
    # id_usuario
    response.set_cookie(key='id_usuario', value=str(user.id_usuario), httponly=False, path='/', samesite='none', secure=secure_flag)
    # permisos (serializar como JSON)
    try:
        import json
        permisos_val = json.dumps(permisos)
    except Exception:
        permisos_val = '[]'
    response.set_cookie(key='permisos', value=permisos_val, httponly=False, path='/', samesite='none', secure=secure_flag)

    return {"access_token": access_token, "rol": user.rol, "id_usuario": user.id_usuario, "id_rol": getattr(user, 'id_rol', None), "permisos": permisos}

@router.post("/signup", response_model=SigninResponse)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(conexion.get_db)):
    # Crear usuario con password hasheada
    data_usuario = {
        **usuario.dict(),
        "telefono": '',
        "password": hash_password(usuario.password)
    }

    db_usuario = models.Usuario(**data_usuario)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    permisos = []
    try:
        if getattr(db_usuario, 'rol_obj', None) and getattr(db_usuario.rol_obj, 'permisos', None):
            permisos = [p.nombre for p in db_usuario.rol_obj.permisos]
    except Exception:
        permisos = []

    access_token = create_access_token(data={"sub": db_usuario.correo, "rol": db_usuario.rol, "id_usuario": db_usuario.id_usuario, "id_rol": getattr(db_usuario, 'id_rol', None)})
    return {"access_token": access_token, "rol": db_usuario.rol, "id_usuario": db_usuario.id_usuario, "id_rol": getattr(db_usuario, 'id_rol', None), "permisos": permisos }

# Función para verificar el token y obtener el usuario actual
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(conexion.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, correo)
    if user is None:
        raise credentials_exception
    return user


async def require_admin(current_user: models.Usuario = Depends(get_current_user)):
    # Permitimos administrador por nombre de rol o por relación normalizada
    if getattr(current_user, 'rol', None) == 'admin':
        return current_user
    if getattr(current_user, 'rol_obj', None) and getattr(current_user.rol_obj, 'nombre', None) == 'admin':
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requieren privilegios de administrador")


@router.get("/me/permisos")
async def me_permisos(current_user: models.Usuario = Depends(get_current_user)):
    """Devuelve la lista de permisos asociados al rol del usuario autenticado."""
    permisos = []
    try:
        if getattr(current_user, 'rol_obj', None) and getattr(current_user.rol_obj, 'permisos', None):
            permisos = [p.nombre for p in current_user.rol_obj.permisos]
    except Exception:
        permisos = []
    return {"permisos": permisos}
