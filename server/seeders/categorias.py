async def seed_categorias(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO categorias (id, nombre, descripcion, deleted_at) VALUES
(1, 'Frutas y Verduras', 'Productos frescos: frutas, verduras y hortalizas', NULL),
(2, 'Carnes y Pollo', 'Carnes rojas, pollo y cortes especiales', NULL),
(3, 'Pescados y Mariscos', 'Pescado fresco y mariscos', NULL),
(4, 'Lácteos y Huevos', 'Quesos, leche, yogur y huevos', NULL),
(5, 'Granos y Abarrotes', 'Arroz, frijol, lenteja y productos de despensa', NULL),
(6, 'Panadería y Repostería', 'Pan fresco, ponqués y productos de pastelería', NULL),
(7, 'Comidas Preparadas', 'Almuerzos, corrientazos, sopas y antojitos', NULL),
(8, 'Bebidas', 'Jugos, gaseosas, agua y bebidas calientes', NULL),
(9, 'Condimentos y Especias', 'Hierbas, condimentos y adobos', NULL),
(10, 'Productos Orgánicos', 'Alimentos orgánicos y de producción sostenible', NULL),
(11, 'Mascotas', 'Alimentos y accesorios para mascotas', NULL),
(12, 'Hogar y Limpieza', 'Aseo, utensilios y productos para el hogar', NULL),
(13, 'Artesanías y Tradicionales', 'Productos artesanales y típicos de la región', NULL),
(14, 'Servicios Logísticos', 'Domicilios y transporte de mercancía', NULL),
(15, 'Tecnología y Miscelánea', 'Accesorios, cargadores y productos varios', NULL)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    deleted_at = EXCLUDED.deleted_at;
"""),
        text('UPDATE categorias SET nombre = INITCAP(nombre);'),
        text("SELECT setval('categorias_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.categorias) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)
