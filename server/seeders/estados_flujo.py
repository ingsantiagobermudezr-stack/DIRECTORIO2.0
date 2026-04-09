async def seed_estados_flujo(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO estados_flujo (id, clave, nombre, descripcion, deleted_at) VALUES
(1, 'pendiente', 'Pendiente', 'Registro creado pero aún sin resolución final', NULL),
(2, 'aprobado', 'Aprobado', 'Flujo resuelto correctamente y validado', NULL),
(3, 'rechazado', 'Rechazado', 'Flujo resuelto con resultado negativo', NULL),
(4, 'en_revision', 'En Revisión', 'Registro en proceso de evaluación', NULL),
(5, 'cancelado', 'Cancelado', 'Flujo cancelado por la operación', NULL)
ON CONFLICT (clave) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    deleted_at = EXCLUDED.deleted_at;
"""),
        text("SELECT setval('estados_flujo_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.estados_flujo) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
