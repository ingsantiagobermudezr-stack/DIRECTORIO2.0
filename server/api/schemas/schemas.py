from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

# Esquemas para Marketplace
class MarketplaceBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    precio: Optional[float] = 0.0
    stock: Optional[float] = 0.0
    id_estado: Optional[int] = None
    id_empresa: int
    id_categoria: Optional[int] = None

class MarketplaceCreate(MarketplaceBase):
    pass

class MarketplaceResponse(MarketplaceBase):
    """
    Respuesta del marketplace con detalles completos del producto/servicio
    """
    id: int
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
    id_usuario_creador: Optional[int] = None
    logo_url: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(BaseModel):
    id: int
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
    id: int

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
    id: int

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
    id: int

    model_config = {"from_attributes": True}

# Esquemas para Publicidad
class PublicidadBase(BaseModel):
    id_empresa: int
    id_tipo_anuncio: int
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None

class PublicidadCreate(PublicidadBase):
    pass

class PublicidadResponse(PublicidadBase):
    """
    Respuesta para publicidad con su identificador
    """
    id: int

    model_config = {"from_attributes": True}


class ImagenPublicidadBase(BaseModel):
    id_publicidad: int
    imagen_url: str


class ImagenPublicidadCreate(ImagenPublicidadBase):
    pass


class ImagenPublicidadResponse(ImagenPublicidadBase):
    id: int

    model_config = {"from_attributes": True}


class TipoAnuncioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class TipoAnuncioCreate(TipoAnuncioBase):
    pass


class TipoAnuncioResponse(TipoAnuncioBase):
    id: int

    model_config = {"from_attributes": True}


class EstadoMarketplaceBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class EstadoMarketplaceCreate(EstadoMarketplaceBase):
    pass


class EstadoMarketplaceResponse(EstadoMarketplaceBase):
    id: int

    model_config = {"from_attributes": True}


class ImagenMarketplaceBase(BaseModel):
    id_marketplace: int
    imagen_url: str


class ImagenMarketplaceCreate(ImagenMarketplaceBase):
    pass


class ImagenMarketplaceResponse(ImagenMarketplaceBase):
    id: int

    model_config = {"from_attributes": True}

# Esquemas para Usuario
class UsuarioBase(BaseModel):
    nombre: constr(min_length=1, max_length=100)
    apellido: constr(min_length=1, max_length=100)
    correo: EmailStr
    password: Optional[str] = None  # Cambiado a Optional para Response
    rol: Optional[str] = None
    id_rol: Optional[int] = None
    id_empresa: Optional[int] = None

class UsuarioCreate(BaseModel):
    nombre: constr(min_length=1, max_length=100)
    apellido: constr(min_length=1, max_length=100)
    correo: EmailStr
    password: constr(min_length=8, max_length=128)
    id_rol: Optional[int] = None
    id_empresa: Optional[int] = None

class UsuarioRegister(BaseModel):
    nombre: constr(min_length=1, max_length=100)
    apellido: constr(min_length=1, max_length=100)
    correo: EmailStr
    password: constr(min_length=8, max_length=128)

class UsuarioUpdate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    rol: Optional[str] = None
    id_rol: Optional[int] = None
    id_empresa: Optional[int] = None

class UsuarioResponse(BaseModel):
    """
    Respuesta para usuarios con todos sus detalles excepto la contraseña
    """
    id: int
    nombre: str
    apellido: str
    correo: str
    rol: Optional[str] = None
    id_rol: Optional[int] = None
    id_empresa: Optional[int] = None

    model_config = {"from_attributes": True}

class SigninResponse(BaseModel):
    access_token: str
    rol: Optional[str] = None
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
    id: int
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
    id: int

    model_config = {"from_attributes": True}

class CiudadBase(BaseModel):
    nombre: str
    id_departamento: int

class CiudadResponse(CiudadBase):
    id: int

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
    id: int
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
    id: int
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
    id: int
    categoria: CategoriaBase 
    municipio: MunicipioBase

    model_config = {"from_attributes": True}


# Esquemas para Mensajes y Comprobantes
class MensajeBase(BaseModel):
    id_marketplace: int
    id_usuario_creador_chat: int
    id_usuario_enviador_mensaje: int
    mensaje: str


class MensajeCreate(MensajeBase):
    pass


class MensajeResponse(MensajeBase):
    id: int
    fecha_hora: datetime

    model_config = {"from_attributes": True}


class ArchivoMensajeBase(BaseModel):
    id_mensaje: int
    url_imagen: str


class ArchivoMensajeCreate(ArchivoMensajeBase):
    pass


class ArchivoMensajeResponse(ArchivoMensajeBase):
    id: int

    model_config = {"from_attributes": True}


# Esquemas para Favoritos (Wishlist)
class UsuarioFavoritoBase(BaseModel):
    id_usuario: int
    id_marketplace: int


class UsuarioFavoritoCreate(UsuarioFavoritoBase):
    pass


class UsuarioFavoritoResponse(UsuarioFavoritoBase):
    """
    Respuesta para favoritos con detalles del producto
    """
    id: int
    fecha_agregado: datetime

    model_config = {"from_attributes": True}


class UsuarioFavoritoResponseDetallado(BaseModel):
    """
    Respuesta detallada del favorito incluyendo datos del marketplace
    """
    id: int
    id_usuario: int
    id_marketplace: int
    fecha_agregado: datetime
    marketplace: MarketplaceResponse

    model_config = {"from_attributes": True}


class ComprobanteBase(BaseModel):
    id_archivo: int
    id_empleado_evaluador: int
    recibo_valido: bool
    cantidad_recibida: float


class ComprobanteCreate(ComprobanteBase):
    pass


class ComprobanteResponse(ComprobanteBase):
    id: int
    estado: str
    fecha_creacion: datetime
    fecha_resolucion: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ComprobanteEstadoUpdate(BaseModel):
    observacion: Optional[str] = None

# Esquemas para Notificaciones (Sistema de notificaciones en tiempo real)
class NotificacionBase(BaseModel):
    id_usuario_remitente: Optional[int] = None
    id_usuario_destinatario: int
    tipo: str
    contenido: str
    leido: bool = False


class NotificacionCreate(BaseModel):
    id_usuario_remitente: Optional[int] = None
    id_usuario_destinatario: int
    tipo: str
    contenido: str


class NotificacionResponse(NotificacionBase):
    """Respuesta de notificación"""
    id: int
    fecha_creacion: datetime

    model_config = {"from_attributes": True}


class NotificacionResponseDetallado(BaseModel):
    """Respuesta detallada de notificación con info del remitente"""
    id: int
    id_usuario_remitente: Optional[int] = None
    id_usuario_destinatario: int
    tipo: str
    contenido: str
    leido: bool
    fecha_creacion: datetime
    usuario_remitente: Optional[UsuarioBase] = None

    model_config = {"from_attributes": True}
