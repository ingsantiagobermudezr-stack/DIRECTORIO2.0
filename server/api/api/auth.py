from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Dict

from api.models import models
from api.db import conexion
from api.schemas.schemas import UsuarioCreate, SigninResponse


# Configuración de seguridad
SECRET_KEY = "supersecretkey"  # Cambia esto por una clave segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de bcrypt para encriptar contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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
    print(correo,password )
    user = get_user(db, correo)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Ruta para autenticación de usuarios (login)
@router.post("/signin", response_model=SigninResponse)
async def login(form_data: Dict, db: Session = Depends(conexion.get_db)):

    user = authenticate_user(db, form_data.get('correo'), form_data.get('password'))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_sub = {
        "rol": user.rol,
        "id_usuario": user.id_usuario,
        "correo": user.correo,
    }

    access_token = create_access_token(data={"sub": user_sub})
    return {"access_token": access_token, "rol": user.rol, "id_usuario": user.id_usuario}

@router.post("/signup", response_model=SigninResponse)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(conexion.get_db)):
    print(usuario)
    
    data_usuario = {
        **usuario.dict(),
        "telefono": '',
        "password": hash_password(usuario.password)
    }

    db_usuario = models.Usuario(**data_usuario)


    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    user_sub = {
        "rol": db_usuario.rol,
        "id_usuario": db_usuario.id_usuario,
        "correo": db_usuario.correo,
    }

    access_token = create_access_token(data={"sub": user_sub})
    print(access_token)
    return {"access_token": access_token, "rol": db_usuario.rol, "id_usuario": db_usuario.id_usuario }

# Función para verificar el token y obtener el usuario actual
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(conexion.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user
