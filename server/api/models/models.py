from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from api.db.conexion import Base

# Asociación many-to-many entre roles y permisos
role_permiso = Table(
    'roles_permisos', Base.metadata,
    Column('id_rol', Integer, ForeignKey('roles.id')),
    Column('id_permiso', Integer, ForeignKey('permisos.id'))
)


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

    permisos = relationship('Permiso', secondary=role_permiso, back_populates='roles')
    usuarios = relationship('Usuario', back_populates='rol_obj')


class Permiso(Base):
    __tablename__ = 'permisos'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)

    roles = relationship('Rol', secondary=role_permiso, back_populates='permisos')
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
    rol_obj = relationship('Rol', back_populates='usuarios')
    password = Column(String(255), nullable=False)

    # Relación con Resultado para almacenar historial de búsqueda
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
    logo_url = Column(String(255), nullable=True)

    # Relaciones con otros modelos
    categoria = relationship("Categoria", back_populates="empresas")
    municipio = relationship("Municipio", back_populates="empresas")
    publicidades = relationship("Publicidad", back_populates="empresa", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="empresa", cascade="all, delete-orphan")
    marketplaces = relationship("Marketplace", back_populates="empresa", cascade="all, delete-orphan")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete

# Modelo de Publicidad para gestionar anuncios de empresas
class Publicidad(Base):
    __tablename__ = 'publicidades'

    id = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    tipo_anuncio = Column(String(50), nullable=False)
    descripcion = Column(Text)
    duracion = Column(Integer)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime)

    # Relación con Empresa
    empresa = relationship("Empresa", back_populates="publicidades")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete


# Tabla catálogo para estados de publicación en marketplace
class EstadoMarketplace(Base):
    __tablename__ = 'estados_marketplace'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(20), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    marketplaces = relationship("Marketplace", back_populates="estado")


# Modelo para Marketplace (productos/servicios publicados por empresas)
class Marketplace(Base):
    __tablename__ = 'marketplaces'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=True)
    imagen_url = Column(String(255), nullable=True)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    id_estado = Column(Integer, ForeignKey('estados_marketplace.id'), nullable=True)
    id_empresa = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    id_categoria = Column(Integer, ForeignKey('categorias.id'), nullable=True)

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


# Modelo para Resultado, que almacena el historial de búsqueda de cada usuario
class Resultado(Base):
    __tablename__ = 'resultados'

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id'))
    criterio = Column(String(255), nullable=False)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    # Relación con Usuario
    usuario = relationship("Usuario", back_populates="resultados")
    deleted_at = Column(DateTime, nullable=True)  # Campo para soft delete