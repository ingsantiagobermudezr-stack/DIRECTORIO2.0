from seed_roles import Roles

PERMISOS = {
  'CREAR_EMPRESA': {
    'id': 1,
    'key': 'crear_empresa',
    'descripcion': 'Permite crear nuevas empresas en el sistema',
    'roles_aceptados': [Roles.ADMIN],
  }
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
