from pwdlib import PasswordHash

pwd_context = PasswordHash.recommended()

async def seed_admin_user(run_sql_statements):
    from sqlalchemy import text

    hashed_password = pwd_context.hash("12345678")

    sql_statements = [
        text(f"""
INSERT INTO usuarios (id, nombre, apellido, correo, id_rol, id_empresa, password, deleted_at) VALUES
(1, 'Administrador', 'Sistema', 'admin@admin.com', 1, NULL, '{hashed_password}', NULL)
ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    id_rol = EXCLUDED.id_rol,
    id_empresa = EXCLUDED.id_empresa,
    password = EXCLUDED.password,
    deleted_at = NULL;
"""),
        text("SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM public.usuarios) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
