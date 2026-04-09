from enum import Enum

class Roles(Enum):
    ADMIN = 1 # ID 
    USUARIO = 2 # ID
    EMPRESA = 3 # ID

USER_ROLES = {
  Roles.ADMIN: {
    'nombre': 'admin',
    'descripcion': 'Administrador del sistema',
  },
  Roles.USUARIO: {
    'nombre': 'usuario',
    'descripcion': 'Usuario',
  },
  Roles.EMPRESA: {
    'nombre': 'empresa',
    'descripcion': 'Representante de empresa',
  }
}

async def seed_roles(run_sql_statements):
    from sqlalchemy import text

    sql_statements = []

    for role, role_data in USER_ROLES.items():
      sql_statements.append(text(f"""
      INSERT INTO roles (id, nombre, descripcion) VALUES  
      ({role.value}, '{role_data['nombre']}', '{role_data['descripcion']}')
      ON CONFLICT (nombre) DO UPDATE SET
          descripcion = EXCLUDED.descripcion;

      """))

    sql_statements.append(text("SELECT setval('roles_id_seq', (SELECT MAX(id) FROM public.roles) + 1, false);"))

    await run_sql_statements(sql_statements)
