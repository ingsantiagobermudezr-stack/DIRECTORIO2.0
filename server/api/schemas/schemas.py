from pydantic import BaseModel
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

    class Config:
        from_attributes = True

# Esquemas para Empresa
class EmpresaBase(BaseModel):
    nombre: str
    nit: str
    correo: str
    direccion: str
    telefono: str
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

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

# Esquemas para Usuario
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: str
    telefono: Optional[str] = None
    password: Optional[str] = None  # Cambiado a Optional para Response
    rol: Optional[str] = None

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    password: str

class UsuarioUpdate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    rol: str

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

    class Config:
        from_attributes = True

class SigninResponse(BaseModel):
    access_token: str
    rol: str
    id_usuario: int

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

    class Config:
        from_attributes = True

class ReviewResponseCreate(BaseModel):
    """
    Respuesta para la creación de una nueva reseña
    """
    id_empresa: int
    id_usuario: int
    comentario: str
    calificacion: float

    class Config:
        from_attributes = True

# Esquemas para Resultado
class ResultadoBase(BaseModel):
    id_usuario: int
    criterio: str

class ResultadoCreate(ResultadoBase):
    pass

class ResultadoResponse(ResultadoBase):
    """
    Respuesta para resultados de búsqueda
    """
    id_resultado: int

    class Config:
        from_attributes = True

class EmpresaResponseGet(EmpresaBase):
    """
    Respuesta detallada de empresa incluyendo su categoría y municipio
    """
    id_empresa: int
    categoria: CategoriaBase 
    municipio: MunicipioBase

    class Config:
        from_attributes = True