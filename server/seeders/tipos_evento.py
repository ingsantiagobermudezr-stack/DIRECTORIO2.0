async def seed_tipos_evento(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO tipos_evento (id, clave, nombre, descripcion, deleted_at) VALUES
(1, 'vista', 'Vista', 'Visualización de un producto en marketplace', NULL),
(2, 'click', 'Click', 'Interacción explícita sobre un producto', NULL),
(3, 'new_message', 'Nuevo Mensaje', 'Notificación por nuevo mensaje recibido', NULL),
(4, 'new_review', 'Nueva Review', 'Notificación por nueva reseña recibida', NULL),
(5, 'favorite_price_change', 'Cambio de Precio', 'Notificación por cambio de precio en favoritos', NULL),
(6, 'comprobante_aprobado', 'Comprobante Aprobado', 'Notificación por comprobante aprobado', NULL),
(7, 'comprobante_rechazado', 'Comprobante Rechazado', 'Notificación por comprobante rechazado', NULL)
ON CONFLICT (clave) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    deleted_at = EXCLUDED.deleted_at;
"""),
        text("SELECT setval('tipos_evento_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.tipos_evento) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
