async def seed_tipos_anuncio(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO tipos_anuncio (id, nombre, descripcion, deleted_at) VALUES
(1, 'destacado', 'Anuncio principal en portada de la plataforma', NULL),
(2, 'banner', 'Banner visible en páginas de categoría', NULL),
(3, 'oferta', 'Promoción especial con vigencia diaria', NULL),
(4, 'patrocinado', 'Resultado patrocinado en búsquedas', NULL),
(5, 'temporada', 'Campaña por temporada (festivos/cosechas)', NULL)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    deleted_at = EXCLUDED.deleted_at;
"""),
        text('UPDATE tipos_anuncio SET nombre = INITCAP(nombre);'),
        text("SELECT setval('tipos_anuncio_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.tipos_anuncio) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
