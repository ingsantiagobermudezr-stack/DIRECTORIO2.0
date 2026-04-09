try:
  from seed_roles import Roles
except ImportError:
  from .seed_roles import Roles
from enum import Enum

class Permisos(Enum):
  CREAR_EMPRESA = 'crear_empresa'
  VER_REGISTROS_ELIMINADOS = 'ver_registros_eliminados'
  RESTAURAR_REGISTROS_ELIMINADOS = 'restaurar_registros_eliminados'

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
