from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from api.db.conexion import Base

# Modelo para Marketplace (productos/servicios publicados por empresas)
class Marketplace(Base):
    __tablename__ = 'marketplace'

    id_marketplace = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=True)
    imagen_url = Column(String(255), nullable=True)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(20), default='activo')
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa', ondelete="CASCADE"), nullable=False)
    id_categoria = Column(Integer, ForeignKey('categoria.id_categoria', ondelete="SET NULL"), nullable=True)

    empresa = relationship("Empresa")
    categoria = relationship("Categoria")


# Modelo de Empresa, con datos básicos y relaciones
class Empresa(Base):
    __tablename__ = 'empresa'
    
    id_empresa = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    nit = Column(String(50), unique=True, nullable=False)
    correo = Column(String(100))
    direccion = Column(String(255))
    telefono = Column(String(20))
    id_categoria = Column(Integer, ForeignKey('categoria.id_categoria', ondelete="SET NULL"))
    id_municipio = Column(Integer, ForeignKey('municipio.id_municipio', ondelete="SET NULL"))
    logo = Column(String(255), nullable=True)

    # Relaciones con otros modelos
    categoria = relationship("Categoria", back_populates="empresas")
    municipio = relationship("Municipio", back_populates="empresas")
    publicidades = relationship("Publicidad", back_populates="empresa", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="empresa", cascade="all, delete-orphan")


# Modelo de Categoría para clasificar empresas por tipo o sector de servicio
class Categoria(Base):
    __tablename__ = 'categoria'
    
    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)

    # Relación inversa con Empresa
    empresas = relationship("Empresa", back_populates="categoria", cascade="all, delete-orphan")


# Modelo de Municipio para organización geográfica
class Municipio(Base):
    __tablename__ = 'municipio'
    
    id_municipio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    id_departamento = Column(Integer, ForeignKey('departamento.id_departamento', ondelete="CASCADE"))
    
    # Relaciones con Departamento y Empresa
    departamento = relationship("Departamento", back_populates="municipios")
    empresas = relationship("Empresa", back_populates="municipio", cascade="all, delete-orphan")


# Modelo de Departamento para agrupar municipios
class Departamento(Base):
    __tablename__ = 'departamento'
    
    id_departamento = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    
    # Relación inversa con Municipio
    municipios = relationship("Municipio", back_populates="departamento", cascade="all, delete-orphan")


# Modelo de Publicidad para gestionar anuncios de empresas
class Publicidad(Base):
    __tablename__ = 'publicidad'
    
    id_publicidad = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa', ondelete="CASCADE"), nullable=False)
    tipo_anuncio = Column(String(50), nullable=False)
    descripcion = Column(Text)
    duracion = Column(Integer)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime)
    
    # Relación con Empresa
    empresa = relationship("Empresa", back_populates="publicidades")


# Modelo para Usuario, representando un usuario del sistema con información de autenticación
class Usuario(Base):
    __tablename__ = 'usuario'
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    rol = Column(String(20), server_default='user')
    password = Column(String(255), nullable=False)
    
    # Relación con Resultado para almacenar historial de búsqueda
    resultados = relationship("Resultado", back_populates="usuario", cascade="all, delete-orphan")
    

# Modelo para Review, que permite valoraciones y comentarios de usuarios sobre las empresas
class Review(Base):
    __tablename__ = 'review'
    
    id_review = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa', ondelete="CASCADE"))
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario', ondelete="CASCADE"))
    comentario = Column(Text, nullable=True)
    calificacion = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones con Usuario y Empresa
    usuario = relationship("Usuario")
    empresa = relationship("Empresa", back_populates="reviews")


# Modelo para Resultado, que almacena el historial de búsqueda de cada usuario
class Resultado(Base):
    __tablename__ = 'resultado'
    
    id_resultado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario', ondelete="CASCADE"))
    criterio = Column(String(255), nullable=False)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    
    # Relación con Usuario
    usuario = relationship("Usuario", back_populates="resultados")