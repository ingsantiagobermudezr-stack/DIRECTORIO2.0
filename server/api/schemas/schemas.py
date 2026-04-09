from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional
from datetime import datetime

# Esquemas para Marketplace
class MarketplaceBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    precio: Optional[float] = 0.0
    imagen_url: Optional[str] = ""
    estado: Optional[str] = "activo"
    id_empresa: int
    id_categoria: Optional[int] = None

class MarketplaceCreate(MarketplaceBase):
    pass

class MarketplaceResponse(MarketplaceBase):
    """
    Respuesta del marketplace con detalles completos del producto/servicio
    """
    id_marketplace: int
    fecha_publicacion: datetime

    model_config = {"from_attributes": True}

# Esquemas para Empresa
class EmpresaBase(BaseModel):
    nombre: constr(min_length=2, max_length=100)
    nit: constr(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9\-]+$")
    correo: EmailStr
    direccion: constr(min_length=3, max_length=255)
    telefono: constr(min_length=7, max_length=20)
    id_categoria: int
    id_municipio: int
    logo: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(BaseModel):
    id_empresa: int
    success: bool

# Esquemas para Categoria
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    """
    Respuesta para categorías con su identificador
    """
    id_categoria: int

    model_config = {"from_attributes": True}

# Esquemas para Municipio
class MunicipioBase(BaseModel):
    nombre: str
    id_departamento: int

class MunicipioCreate(MunicipioBase):
    pass

class MunicipioResponse(MunicipioBase):
    """
    Respuesta para municipios con su identificador
    """
    id_municipio: int

    model_config = {"from_attributes": True}

# Esquemas para Departamento
class DepartamentoBase(BaseModel):
    nombre: str

class DepartamentoCreate(DepartamentoBase):
    pass

class DepartamentoResponse(DepartamentoBase):
    """
    Respuesta para departamentos con su identificador
    """
    id_departamento: int

    model_config = {"from_attributes": True}

# Esquemas para Publicidad
class PublicidadBase(BaseModel):
    id_empresa: int
    tipo_anuncio: str
    descripcion: str
    duracion: int
    fecha_inicio: datetime
    fecha_fin: datetime

class PublicidadCreate(PublicidadBase):
    pass

class PublicidadResponse(PublicidadBase):
    """
    Respuesta para publicidad con su identificador
    """
    id_publicidad: int

    model_config = {"from_attributes": True}

# Esquemas para Usuario
class UsuarioBase(BaseModel):
    nombre: constr(min_length=1, max_length=100)
    apellido: constr(min_length=1, max_length=100)
    correo: EmailStr
    telefono: Optional[constr(min_length=7, max_length=20)] = None
    password: Optional[str] = None  # Cambiado a Optional para Response
    rol: Optional[str] = None
    id_rol: Optional[int] = None

class UsuarioCreate(BaseModel):
    nombre: constr(min_length=1, max_length=100)
    apellido: constr(min_length=1, max_length=100)
    correo: EmailStr
    password: constr(min_length=8, max_length=128)
    id_rol: Optional[int] = None

class UsuarioUpdate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    rol: str
    id_rol: Optional[int] = None

class UsuarioResponse(BaseModel):
    """
    Respuesta para usuarios con todos sus detalles excepto la contraseña
    """
    id_usuario: int
    nombre: str
    apellido: str
    correo: str
    telefono: Optional[str] = None
    rol: str
    id_rol: Optional[int] = None

    model_config = {"from_attributes": True}

class SigninResponse(BaseModel):
    access_token: str
    rol: str
    id_usuario: int
    id_rol: Optional[int] = None
    permisos: Optional[list[str]] = None

# Esquemas para Review
class ReviewBase(BaseModel):
    id_empresa: int
    id_usuario: int
    comentario: str
    calificacion: float
    fecha: datetime

class ReviewCreate(BaseModel):
    id_empresa: int
    id_usuario: int
    comentario: str
    calificacion: float

class ReviewResponse(ReviewBase):
    """
    Respuesta para reseñas con detalles del usuario
    """
    id_review: int
    usuario: UsuarioBase

    model_config = {"from_attributes": True}

class ReviewResponseCreate(BaseModel):
    """
    Respuesta para la creación de una nueva reseña
    """
    id_empresa: int
    id_usuario: int
    comentario: str
    calificacion: float

    model_config = {"from_attributes": True}

# Esquemas para Resultado
class ResultadoBase(BaseModel):
    id_usuario: Optional[int] = None
    termino_busqueda: str
    cantidad_resultados: int = 0
    ip_origen: Optional[str] = None
    user_agent: Optional[str] = None

class ResultadoCreate(ResultadoBase):
    pass

class ResultadoResponse(ResultadoBase):
    """
    Respuesta para telemetría de búsquedas
    """
    id: int
    fecha_hora: datetime

    model_config = {"from_attributes": True}


# Schemas para País, Departamento y Ciudad
class PaisBase(BaseModel):
    nombre: str
    codigo_iso: Optional[str] = None

class PaisResponse(PaisBase):
    id_pais: int

    model_config = {"from_attributes": True}

class CiudadBase(BaseModel):
    nombre: str
    id_departamento: int

class CiudadResponse(CiudadBase):
    id_ciudad: int

    model_config = {"from_attributes": True}


# Schemas para Rol y Permiso
class PermisoBase(BaseModel):
    key: str
    descripcion: Optional[str] = None

class PermisoResponse(PermisoBase):
    id: int

    model_config = {"from_attributes": True}

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class RolCreate(RolBase):
    permiso_ids: Optional[list[int]] = []

class RolResponse(RolBase):
    id_rol: int
    permisos: Optional[list[PermisoResponse]] = []

    model_config = {"from_attributes": True}


# Schema para Auditoría
class AuditoriaBase(BaseModel):
    tabla: str
    operacion: str
    id_registro: Optional[int] = None
    id_usuario: Optional[int] = None
    descripcion: Optional[str] = None

class AuditoriaResponse(AuditoriaBase):
    id_auditoria: int
    fecha: datetime

    model_config = {"from_attributes": True}


# Schemas para Producto
class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = 0.0
    stock: Optional[int] = 0
    sku: Optional[str] = None
    id_empresa: Optional[int] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id_producto: int
    fecha_creacion: datetime

    model_config = {"from_attributes": True}

class EmpresaResponseGet(EmpresaBase):
    """
    Respuesta detallada de empresa incluyendo su categoría y municipio
    """
    id_empresa: int
    categoria: CategoriaBase 
    municipio: MunicipioBase

    model_config = {"from_attributes": True}