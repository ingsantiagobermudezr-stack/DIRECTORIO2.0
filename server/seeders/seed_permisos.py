try:
  from seed_roles import Roles
except ImportError:
  from .seed_roles import Roles
from enum import Enum

class Permisos(Enum):
  # Permisos existentes
  CREAR_EMPRESA = 'crear_empresa'
  VER_REGISTROS_ELIMINADOS = 'ver_registros_eliminados'
  RESTAURAR_REGISTROS_ELIMINADOS = 'restaurar_registros_eliminados'
  
  # Permisos para Paises
  CREAR_PAISES = 'crear_paises'
  MODIFICAR_PAISES = 'modificar_paises'
  
  # Permisos para Categorias
  CREAR_CATEGORIAS = 'crear_categorias'
  MODIFICAR_CATEGORIAS = 'modificar_categorias'
  
  # Permisos para Departamentos
  CREAR_DEPARTAMENTOS = 'crear_departamentos'
  MODIFICAR_DEPARTAMENTOS = 'modificar_departamentos'
  
  # Permisos para Municipios
  CREAR_MUNICIPIOS = 'crear_municipios'
  MODIFICAR_MUNICIPIOS = 'modificar_municipios'
  
  # Permisos para Usuarios
  CREAR_USUARIOS = 'crear_usuarios'
  MODIFICAR_USUARIOS = 'modificar_usuarios'
  
  # Permisos para Empresas (ya existe crear_empresa)
  MODIFICAR_EMPRESAS = 'modificar_empresas'
  
  # Permisos para Roles
  CREAR_ROLES = 'crear_roles'
  MODIFICAR_ROLES = 'modificar_roles'
  
  # Permisos para Permisos
  CREAR_PERMISOS = 'crear_permisos'
  MODIFICAR_PERMISOS = 'modificar_permisos'
  
  # Permisos para Marketplace
  CREAR_MARKETPLACE = 'crear_marketplace'
  MODIFICAR_MARKETPLACE = 'modificar_marketplace'
  
  # Permisos para Publicidades
  CREAR_PUBLICIDADES = 'crear_publicidades'
  MODIFICAR_PUBLICIDADES = 'modificar_publicidades'
  
  # Permisos para Reviews
  CREAR_REVIEWS = 'crear_reviews'
  MODIFICAR_REVIEWS = 'modificar_reviews'
  
  # Permisos para Mensajes
  CREAR_MENSAJES = 'crear_mensajes'
  MODIFICAR_MENSAJES = 'modificar_mensajes'
  
  # Permisos para Favoritos
  VER_FAVORITOS = 'ver_favoritos'
  CREAR_FAVORITOS = 'crear_favoritos'
  ELIMINAR_FAVORITOS = 'eliminar_favoritos'

PERMISOS = {
  Permisos.CREAR_EMPRESA: {
    'id': 1,
    'key': Permisos.CREAR_EMPRESA.value,
    'descripcion': 'Permite crear nuevas empresas en el sistema',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.VER_REGISTROS_ELIMINADOS: {
    'id': 2,
    'key': Permisos.VER_REGISTROS_ELIMINADOS.value,
    'descripcion': 'Permite ver registros que han sido eliminados (deleted_at no es NULL)',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.RESTAURAR_REGISTROS_ELIMINADOS: {
    'id': 3,
    'key': Permisos.RESTAURAR_REGISTROS_ELIMINADOS.value,
    'descripcion': 'Permite restaurar registros que han sido eliminados (establecer deleted_at a NULL)',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Paises
  Permisos.CREAR_PAISES: {
    'id': 4,
    'key': Permisos.CREAR_PAISES.value,
    'descripcion': 'Permite crear nuevos países',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_PAISES: {
    'id': 5,
    'key': Permisos.MODIFICAR_PAISES.value,
    'descripcion': 'Permite modificar países existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Categorias
  Permisos.CREAR_CATEGORIAS: {
    'id': 6,
    'key': Permisos.CREAR_CATEGORIAS.value,
    'descripcion': 'Permite crear nuevas categorías',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_CATEGORIAS: {
    'id': 7,
    'key': Permisos.MODIFICAR_CATEGORIAS.value,
    'descripcion': 'Permite modificar categorías existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Departamentos
  Permisos.CREAR_DEPARTAMENTOS: {
    'id': 8,
    'key': Permisos.CREAR_DEPARTAMENTOS.value,
    'descripcion': 'Permite crear nuevos departamentos',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_DEPARTAMENTOS: {
    'id': 9,
    'key': Permisos.MODIFICAR_DEPARTAMENTOS.value,
    'descripcion': 'Permite modificar departamentos existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Municipios
  Permisos.CREAR_MUNICIPIOS: {
    'id': 10,
    'key': Permisos.CREAR_MUNICIPIOS.value,
    'descripcion': 'Permite crear nuevos municipios',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_MUNICIPIOS: {
    'id': 11,
    'key': Permisos.MODIFICAR_MUNICIPIOS.value,
    'descripcion': 'Permite modificar municipios existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Usuarios
  Permisos.CREAR_USUARIOS: {
    'id': 12,
    'key': Permisos.CREAR_USUARIOS.value,
    'descripcion': 'Permite crear nuevos usuarios',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_USUARIOS: {
    'id': 13,
    'key': Permisos.MODIFICAR_USUARIOS.value,
    'descripcion': 'Permite modificar usuarios existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Empresas
  Permisos.MODIFICAR_EMPRESAS: {
    'id': 14,
    'key': Permisos.MODIFICAR_EMPRESAS.value,
    'descripcion': 'Permite modificar empresas existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Roles
  Permisos.CREAR_ROLES: {
    'id': 15,
    'key': Permisos.CREAR_ROLES.value,
    'descripcion': 'Permite crear nuevos roles',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_ROLES: {
    'id': 16,
    'key': Permisos.MODIFICAR_ROLES.value,
    'descripcion': 'Permite modificar roles existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Permisos
  Permisos.CREAR_PERMISOS: {
    'id': 17,
    'key': Permisos.CREAR_PERMISOS.value,
    'descripcion': 'Permite crear nuevos permisos',
    'roles_aceptados': [Roles.ADMIN],
  },
  Permisos.MODIFICAR_PERMISOS: {
    'id': 18,
    'key': Permisos.MODIFICAR_PERMISOS.value,
    'descripcion': 'Permite modificar permisos existentes',
    'roles_aceptados': [Roles.ADMIN],
  },
  # Permisos para Marketplace
  Permisos.CREAR_MARKETPLACE: {
    'id': 19,
    'key': Permisos.CREAR_MARKETPLACE.value,
    'descripcion': 'Permite crear nuevos productos/servicios en marketplace',
    'roles_aceptados': [Roles.ADMIN, Roles.EMPRESA],
  },
  Permisos.MODIFICAR_MARKETPLACE: {
    'id': 20,
    'key': Permisos.MODIFICAR_MARKETPLACE.value,
    'descripcion': 'Permite modificar productos/servicios en marketplace',
    'roles_aceptados': [Roles.ADMIN, Roles.EMPRESA],
  },
  # Permisos para Publicidades
  Permisos.CREAR_PUBLICIDADES: {
    'id': 21,
    'key': Permisos.CREAR_PUBLICIDADES.value,
    'descripcion': 'Permite crear nuevas publicidades',
    'roles_aceptados': [Roles.ADMIN, Roles.EMPRESA],
  },
  Permisos.MODIFICAR_PUBLICIDADES: {
    'id': 22,
    'key': Permisos.MODIFICAR_PUBLICIDADES.value,
    'descripcion': 'Permite modificar publicidades existentes',
    'roles_aceptados': [Roles.ADMIN, Roles.EMPRESA],
  },
  # Permisos para Reviews
  Permisos.CREAR_REVIEWS: {
    'id': 23,
    'key': Permisos.CREAR_REVIEWS.value,
    'descripcion': 'Permite crear nuevas reseñas',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO],
  },
  Permisos.MODIFICAR_REVIEWS: {
    'id': 24,
    'key': Permisos.MODIFICAR_REVIEWS.value,
    'descripcion': 'Permite modificar reseñas existentes',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO],
  },
  # Permisos para Mensajes
  Permisos.CREAR_MENSAJES: {
    'id': 25,
    'key': Permisos.CREAR_MENSAJES.value,
    'descripcion': 'Permite crear nuevos mensajes',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO, Roles.EMPRESA],
  },
  Permisos.MODIFICAR_MENSAJES: {
    'id': 26,
    'key': Permisos.MODIFICAR_MENSAJES.value,
    'descripcion': 'Permite modificar mensajes existentes',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO, Roles.EMPRESA],
  },
  # Permisos para Favoritos
  Permisos.VER_FAVORITOS: {
    'id': 27,
    'key': Permisos.VER_FAVORITOS.value,
    'descripcion': 'Permite ver la lista de favoritos (wishlist)',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO, Roles.EMPRESA],
  },
  Permisos.CREAR_FAVORITOS: {
    'id': 28,
    'key': Permisos.CREAR_FAVORITOS.value,
    'descripcion': 'Permite agregar productos a favoritos',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO, Roles.EMPRESA],
  },
  Permisos.ELIMINAR_FAVORITOS: {
    'id': 29,
    'key': Permisos.ELIMINAR_FAVORITOS.value,
    'descripcion': 'Permite eliminar productos de favoritos',
    'roles_aceptados': [Roles.ADMIN, Roles.USUARIO, Roles.EMPRESA],
  },
}

async def seed_permisos(run_sql_statements):
    from sqlalchemy import text

    # ! Crear Permisos
    sql_statements = []
    for _, permiso_data in PERMISOS.items():
      sql_statements.append(text(f"""
      INSERT INTO permisos (id, key, descripcion) VALUES  
      ({permiso_data['id']}, '{permiso_data['key']}', '{permiso_data['descripcion']}')
      ON CONFLICT (key) DO UPDATE SET
          descripcion = EXCLUDED.descripcion;
      """))

    await run_sql_statements(sql_statements)

    # ! Asociar Permisos a Roles 
    sql_statements = []
    for _, permiso_data in PERMISOS.items():
      for rol in permiso_data['roles_aceptados']:
        sql_statements.append(text(f"""
        INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
        ({rol.value}, {permiso_data['id']})
        ON CONFLICT DO NOTHING;
        """))

    await run_sql_statements(sql_statements)
