async def seed_estados_marketplace(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO estados_marketplace (id, nombre, descripcion, deleted_at) VALUES
(1, 'activo', 'Publicación visible y disponible para compra', NULL),
(2, 'sin stock', 'Publicación visible pero sin inventario disponible', NULL),
(3, 'inactivo', 'Publicación temporalmente deshabilitada', NULL),
(4, 'pausado', 'Publicación pausada por el vendedor', NULL),
(5, 'bloqueado', 'Publicación restringida por revisión administrativa', NULL)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    deleted_at = EXCLUDED.deleted_at;
"""),
        text('UPDATE estados_marketplace SET nombre = INITCAP(nombre);'),
        text("SELECT setval('estados_marketplace_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.estados_marketplace) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
