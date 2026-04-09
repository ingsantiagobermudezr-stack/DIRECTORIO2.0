async def seed_departamentos(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
INSERT INTO departamentos (id, id_pais, codigo_iso, nombre, deleted_at) VALUES
(1, 1, '05', 'ANTIOQUIA', NULL),
(2, 1, '08', 'ATLANTICO', NULL),
(3, 1, '11', 'BOGOTA', NULL),
(4, 1, '13', 'BOLIVAR', NULL),
(5, 1, '15', 'BOYACA', NULL),
(6, 1, '17', 'CALDAS', NULL),
(7, 1, '18', 'CAQUETA', NULL),
(8, 1, '19', 'CAUCA', NULL),
(9, 1, '20', 'CESAR', NULL),
(10, 1, '23', 'CORDOBA', NULL),
(11, 1, '25', 'CUNDINAMARCA', NULL),
(12, 1, '27', 'CHOCO', NULL),
(13, 1, '41', 'HUILA', NULL),
(14, 1, '44', 'LA GUAJIRA', NULL),
(15, 1, '47', 'MAGDALENA', NULL),
(16, 1, '50', 'META', NULL),
(17, 1, '52', 'NARIÑO', NULL),
(18, 1, '54', 'NORTE DE SANTANDER', NULL),
(19, 1, '63', 'QUINDIO', NULL),
(20, 1, '66', 'RISARALDA', NULL),
(21, 1, '68', 'SANTANDER', NULL),
(22, 1, '70', 'SUCRE', NULL),
(23, 1, '73', 'TOLIMA', NULL),
(24, 1, '76', 'VALLE DEL CAUCA', NULL),
(25, 1, '81', 'ARAUCA', NULL),
(26, 1, '85', 'CASANARE', NULL),
(27, 1, '86', 'PUTUMAYO', NULL),
(28, 1, '88', 'ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA', NULL),
(29, 1, '91', 'AMAZONAS', NULL),
(30, 1, '94', 'GUAINIA', NULL),
(31, 1, '95', 'GUAVIARE', NULL),
(32, 1, '97', 'VAUPES', NULL),
(33, 1, '99', 'VICHADA', NULL)
            ON CONFLICT (id) DO NOTHING;
"""),
        text('UPDATE departamentos SET nombre = INITCAP(nombre);'),
        text("SELECT setval('departamentos_id_seq', (SELECT MAX(id) FROM public.departamentos) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)