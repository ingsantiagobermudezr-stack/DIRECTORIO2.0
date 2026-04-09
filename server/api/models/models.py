from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.db.conexion import Base


# Modelo para País
class Pais(Base):
    __tablename__ = 'paises'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo_iso = Column(String(10), nullable=True)
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete

    departamentos = relationship("Departamento", back_populates="pais", cascade="all, delete-orphan")


# Modelo de Categoría para clasificar empresas por tipo o sector de servicio
class Categoria(Base):
    __tablename__ = 'categorias'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)

    # Relación inversa con Empresa y Marketplace
    empresas = relationship("Empresa", back_populates="categoria", cascade="all, delete-orphan")
    marketplaces = relationship("Marketplace", back_populates="categoria", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo de Roles y Permisos
class Rol(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete

    permisos = relationship('Permiso', back_populates='rol', cascade='all, delete-orphan')
    usuarios = relationship('Usuario', back_populates='rol_obj')


class Permiso(Base):
    __tablename__ = 'permisos'

    id = Column(Integer, primary_key=True, index=True)
    id_rol = Column(Integer, ForeignKey('roles.id'), nullable=False)
    tabla = Column(String(100), nullable=False)
    leer = Column(Boolean, nullable=False, default=False)
    crear = Column(Boolean, nullable=False, default=False)
    editar = Column(Boolean, nullable=False, default=False)
    eliminar = Column(Boolean, nullable=False, default=False)

    rol = relationship('Rol', back_populates='permisos')
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo de Departamento para agrupar municipios
class Departamento(Base):
    __tablename__ = 'departamentos'

    id = Column(Integer, primary_key=True, index=True)
    id_pais = Column(Integer, ForeignKey('paises.id'), nullable=True)
    nombre = Column(String(100), nullable=False)
    codigo_iso = Column(String(10), nullable=True)
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete

    # Relación inversa con Municipio y Ciudad
    municipios = relationship("Municipio", back_populates="departamento", cascade="all, delete-orphan")
    ciudades = relationship("Ciudad", back_populates="departamento", cascade="all, delete-orphan")
    pais = relationship("Pais", back_populates="departamentos")

# Modelo de Municipio para organización geográfica
class Municipio(Base):
    __tablename__ = 'municipios'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo_iso = Column(String(10), nullable=True)
    id_departamento = Column(Integer, ForeignKey('departamentos.id'))

    # Relaciones con Departamento y Empresa
    departamento = relationship("Departamento", back_populates="municipios")
    empresas = relationship("Empresa", back_populates="municipio", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo para Usuario, representando un usuario del sistema con información de autenticación
class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    id_rol = Column(Integer, ForeignKey('roles.id'), nullable=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'), nullable=True)
    password = Column(String(255), nullable=False)
    rol_obj = relationship('Rol', back_populates='usuarios')
    empresa = relationship("Empresa", back_populates="usuarios", foreign_keys=[id_empresa])
    empresas_creadas = relationship("Empresa", back_populates="usuario_creador", foreign_keys="Empresa.id_usuario_creador")

    # Relación con Resultado para almacenar telemetría de búsqueda
    resultados = relationship("Resultado", back_populates="usuario", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="usuario", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo de Empresa, con datos básicos y relaciones
class Empresa(Base):
    __tablename__ = 'empresas'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    nit = Column(String(50), unique=True, nullable=False)
    correo = Column(String(100))
    direccion = Column(String(255))
    telefono = Column(String(20))
    id_categoria = Column(Integer, ForeignKey('categorias.id'))
    id_municipio = Column(Integer, ForeignKey('municipios.id'))
    id_usuario_creador = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    logo_url = Column(String(255), nullable=True)

    # Relaciones con otros modelos
    categoria = relationship("Categoria", back_populates="empresas")
    municipio = relationship("Municipio", back_populates="empresas")
    usuarios = relationship("Usuario", back_populates="empresa", foreign_keys="Usuario.id_empresa")
    usuario_creador = relationship("Usuario", back_populates="empresas_creadas", foreign_keys=[id_usuario_creador])
    publicidades = relationship("Publicidad", back_populates="empresa", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="empresa", cascade="all, delete-orphan")
    marketplaces = relationship("Marketplace", back_populates="empresa", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Tabla catálogo de tipos de anuncio para publicidades
class TipoAnuncio(Base):
    __tablename__ = 'tipos_anuncio'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    publicidades = relationship("Publicidad", back_populates="tipo_anuncio")


# Modelo de Publicidad para gestionar anuncios de empresas
class Publicidad(Base):
    __tablename__ = 'publicidades'

    id = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    id_tipo_anuncio = Column(Integer, ForeignKey('tipos_anuncio.id'), nullable=False)
    descripcion = Column(Text)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime)

    # Relación con Empresa
    empresa = relationship("Empresa", back_populates="publicidades")
    tipo_anuncio = relationship("TipoAnuncio", back_populates="publicidades")
    imagenes = relationship("ImagenPublicidad", back_populates="publicidad", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Tabla de imágenes para permitir múltiples imágenes por publicidad
class ImagenPublicidad(Base):
    __tablename__ = 'imagenes_publicidad'

    id = Column(Integer, primary_key=True, index=True)
    id_publicidad = Column(Integer, ForeignKey('publicidades.id'), nullable=False)
    imagen_url = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    publicidad = relationship("Publicidad", back_populates="imagenes")


# Tabla catálogo para estados de publicación en marketplace
class EstadoMarketplace(Base):
    __tablename__ = 'estados_marketplace'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(20), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    marketplaces = relationship("Marketplace", back_populates="estado")


# Tabla de imágenes para permitir múltiples imágenes por publicación
class ImagenMarketplace(Base):
    __tablename__ = 'imagenes_marketplace'

    id = Column(Integer, primary_key=True, index=True)
    id_marketplace = Column(Integer, ForeignKey('marketplaces.id'), nullable=False)
    imagen_url = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    marketplace = relationship("Marketplace", back_populates="imagenes")


# Modelo para Marketplace (productos/servicios publicados por empresas)
class Marketplace(Base):
    __tablename__ = 'marketplaces'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(Text)
    precio = Column(Float)
    stock = Column(Float)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    id_estado = Column(Integer, ForeignKey('estados_marketplace.id'), nullable=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    id_categoria = Column(Integer, ForeignKey('categorias.id'), nullable=True)

    imagenes = relationship("ImagenMarketplace", back_populates="marketplace")
    estado = relationship("EstadoMarketplace", back_populates="marketplaces")
    empresa = relationship("Empresa", back_populates="marketplaces")
    categoria = relationship("Categoria", back_populates="marketplaces")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo para Review, que permite valoraciones y comentarios de usuarios sobre las empresas
class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'))
    id_usuario = Column(Integer, ForeignKey('usuarios.id'))
    comentario = Column(Text, nullable=True)
    calificacion = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    # Relaciones con Usuario y Empresa
    usuario = relationship("Usuario", back_populates="reviews")
    empresa = relationship("Empresa", back_populates="reviews")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Modelo para Resultado, que almacena telemetría de búsquedas de empresas
class Resultado(Base):
    __tablename__ = 'resultados'

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    termino_busqueda = Column(String(255), nullable=False)
    cantidad_resultados = Column(Integer, nullable=False, default=0)
    ip_origen = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    # Relación con Usuario
    usuario = relationship("Usuario", back_populates="resultados")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete