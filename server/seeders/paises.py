async def seed_paises(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO paises (id, nombre, codigo_iso, deleted_at) VALUES
            (1, 'COLOMBIA', 'COL', NULL)
            ON CONFLICT (id) DO NOTHING;
"""),
        text('UPDATE paises SET nombre = INITCAP(nombre);'),
        text("SELECT setval('paises_id_seq', (SELECT MAX(id) FROM public.paises) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)