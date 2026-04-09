async def seed_ciudades_antioquia(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
            INSERT INTO municipios (id, nombre, codigo_iso, id_departamento, deleted_at) VALUES 
            (1, 'Medellín', '05001', 1, NULL),
            (2, 'Abejorral', '05002', 1, NULL),
            (3, 'Abriaquí', '05004', 1, NULL),
            (4, 'Alejandría', '05021', 1, NULL),
            (5, 'Amagá', '05030', 1, NULL),
            (6, 'Amalfi', '05031', 1, NULL),
            (7, 'Andes', '05034', 1, NULL),
            (8, 'Angelópolis', '05036', 1, NULL),
            (9, 'Angostura', '05038', 1, NULL),
            (10, 'Anorí', '05040', 1, NULL),
            (11, 'Santa Fé de Antioquia', '05042', 1, NULL),
            (12, 'Anzá', '05044', 1, NULL),
            (13, 'Apartadó', '05045', 1, NULL),
            (14, 'Arboletes', '05051', 1, NULL),
            (15, 'Argelia', '05055', 1, NULL),
            (16, 'Armenia', '05059', 1, NULL),
            (17, 'Barbosa', '05079', 1, NULL),
            (18, 'Belmira', '05086', 1, NULL),
            (19, 'Bello', '05088', 1, NULL),
            (20, 'Betania', '05091', 1, NULL),
            (21, 'Betulia', '05093', 1, NULL),
            (22, 'Ciudad Bolívar', '05101', 1, NULL),
            (23, 'Briceño', '05107', 1, NULL),
            (24, 'Buriticá', '05113', 1, NULL),
            (25, 'Cáceres', '05120', 1, NULL),
            (26, 'Caicedo', '05125', 1, NULL),
            (27, 'Caldas', '05129', 1, NULL),
            (28, 'Campamento', '05134', 1, NULL),
            (29, 'Cañasgordas', '05138', 1, NULL),
            (30, 'Caracolí', '05142', 1, NULL),
            (31, 'Caramanta', '05145', 1, NULL),
            (32, 'Carepa', '05147', 1, NULL),
            (33, 'El Carmen de Viboral', '05148', 1, NULL),
            (34, 'Carolina', '05150', 1, NULL),
            (35, 'Caucasia', '05154', 1, NULL),
            (36, 'Chigorodó', '05172', 1, NULL),
            (37, 'Cisneros', '05190', 1, NULL),
            (38, 'Cocorná', '05197', 1, NULL),
            (39, 'Concepción', '05206', 1, NULL),
            (40, 'Concordia', '05209', 1, NULL),
            (41, 'Copacabana', '05212', 1, NULL),
            (42, 'Dabeiba', '05234', 1, NULL),
            (43, 'Donmatías', '05237', 1, NULL),
            (44, 'Ebéjico', '05240', 1, NULL),
            (45, 'El Bagre', '05250', 1, NULL),
            (46, 'Entrerríos', '05264', 1, NULL),
            (47, 'Envigado', '05266', 1, NULL),
            (48, 'Fredonia', '05282', 1, NULL),
            (49, 'Frontino', '05284', 1, NULL),
            (50, 'Giraldo', '05306', 1, NULL),
            (51, 'Girardota', '05308', 1, NULL),
            (52, 'Gómez Plata', '05310', 1, NULL),
            (53, 'Granada', '05313', 1, NULL),
            (54, 'Guadalupe', '05315', 1, NULL),
            (55, 'Guarne', '05318', 1, NULL),
            (56, 'Guatapé', '05321', 1, NULL),
            (57, 'Heliconia', '05347', 1, NULL),
            (58, 'Hispania', '05353', 1, NULL),
            (59, 'Itagüí', '05360', 1, NULL),
            (60, 'Ituango', '05361', 1, NULL),
            (61, 'Jardín', '05364', 1, NULL),
            (62, 'Jericó', '05368', 1, NULL),
            (63, 'La Ceja', '05376', 1, NULL),
            (64, 'La Estrella', '05380', 1, NULL),
            (65, 'La Pintada', '05390', 1, NULL),
            (66, 'La Unión', '05400', 1, NULL),
            (67, 'Liborina', '05411', 1, NULL),
            (68, 'Maceo', '05425', 1, NULL),
            (69, 'Marinilla', '05440', 1, NULL),
            (70, 'Montebello', '05467', 1, NULL),
            (71, 'Murindó', '05475', 1, NULL),
            (72, 'Mutatá', '05480', 1, NULL),
            (73, 'Nariño', '05483', 1, NULL),
            (74, 'Necoclí', '05490', 1, NULL),
            (75, 'Nechí', '05495', 1, NULL),
            (76, 'Olaya', '05501', 1, NULL),
            (77, 'Peñol', '05541', 1, NULL),
            (78, 'Peque', '05543', 1, NULL),
            (79, 'Pueblorrico', '05576', 1, NULL),
            (80, 'Puerto Berrío', '05579', 1, NULL),
            (81, 'Puerto Nare', '05585', 1, NULL),
            (82, 'Puerto Triunfo', '05591', 1, NULL),
            (83, 'Remedios', '05604', 1, NULL),
            (84, 'Retiro', '05607', 1, NULL),
            (85, 'Rionegro', '05615', 1, NULL),
            (86, 'Sabanalarga', '05628', 1, NULL),
            (87, 'Sabaneta', '05631', 1, NULL),
            (88, 'Salgar', '05642', 1, NULL),
            (89, 'San Andrés de Cuerquia', '05647', 1, NULL),
            (90, 'San Carlos', '05649', 1, NULL),
            (91, 'San Francisco', '05652', 1, NULL),
            (92, 'San Jerónimo', '05656', 1, NULL),
            (93, 'San José de la Montaña', '05658', 1, NULL),
            (94, 'San Juan de Urabá', '05659', 1, NULL),
            (95, 'San Luis', '05660', 1, NULL),
            (96, 'San Pedro de los Milagros', '05664', 1, NULL),
            (97, 'San Pedro de Urabá', '05665', 1, NULL),
            (98, 'San Rafael', '05667', 1, NULL),
            (99, 'San Roque', '05670', 1, NULL),
            (100, 'San Vicente Ferrer', '05674', 1, NULL),
            (101, 'Santa Bárbara', '05679', 1, NULL),
            (102, 'Santa Rosa de Osos', '05686', 1, NULL),
            (103, 'Santo Domingo', '05690', 1, NULL),
            (104, 'El Santuario', '05697', 1, NULL),
            (105, 'Segovia', '05736', 1, NULL),
            (106, 'Sonsón', '05756', 1, NULL),
            (107, 'Sopetrán', '05761', 1, NULL),
            (108, 'Támesis', '05789', 1, NULL),
            (109, 'Tarazá', '05790', 1, NULL),
            (110, 'Tarso', '05792', 1, NULL),
            (111, 'Titiribí', '05809', 1, NULL),
            (112, 'Toledo', '05819', 1, NULL),
            (113, 'Turbo', '05837', 1, NULL),
            (114, 'Uramita', '05842', 1, NULL),
            (115, 'Urrao', '05847', 1, NULL),
            (116, 'Valdivia', '05854', 1, NULL),
            (117, 'Valparaíso', '05856', 1, NULL),
            (118, 'Vegachí', '05858', 1, NULL),
            (119, 'Venecia', '05861', 1, NULL),
            (120, 'Vigía del Fuerte', '05873', 1, NULL),
            (121, 'Yalí', '05885', 1, NULL),
            (122, 'Yarumal', '05887', 1, NULL),
            (123, 'Yolombó', '05890', 1, NULL),
            (124, 'Yondó', '05893', 1, NULL),
            (125, 'Zaragoza', '05895', 1, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text('UPDATE municipios SET nombre = INITCAP(nombre);'),
        text("SELECT setval('municipios_id_seq', (SELECT MAX(id) FROM municipios) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_atlantico(run_sql_statements):
    from sqlalchemy import text

    # Departamento Atlántico = id 2 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (126, 'Barranquilla', '08001', 2, NULL),
              (127, 'Baranoa', '08078', 2, NULL),
              (128, 'Campo de la Cruz', '08137', 2, NULL),
              (129, 'Candelaria', '08141', 2, NULL),
              (130, 'Galapa', '08296', 2, NULL),
              (131, 'Juan de Acosta', '08372', 2, NULL),
              (132, 'Luruaco', '08421', 2, NULL),
              (133, 'Malambo', '08433', 2, NULL),
              (134, 'Manatí', '08436', 2, NULL),
              (135, 'Palmar de Varela', '08520', 2, NULL),
              (136, 'Piojó', '08549', 2, NULL),
              (137, 'Polonuevo', '08558', 2, NULL),
              (138, 'Ponedera', '08560', 2, NULL),
              (139, 'Puerto Colombia', '08573', 2, NULL),
              (140, 'Repelón', '08606', 2, NULL),
              (141, 'Sabanagrande', '08634', 2, NULL),
              (142, 'Sabanalarga', '08638', 2, NULL),
              (143, 'Santa Lucía', '08675', 2, NULL),
              (144, 'Santo Tomás', '08685', 2, NULL),
              (145, 'Soledad', '08758', 2, NULL),
              (146, 'Suan', '08770', 2, NULL),
              (147, 'Tubará', '08832', 2, NULL),
              (148, 'Usiacurí', '08849', 2, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        # Normaliza capitalización si lo deseas (puedes comentarlo si ya viene correcto)
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        # Re-sincroniza la secuencia de IDs
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_bogota(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
            INSERT INTO municipios (id, nombre, codigo_iso, id_departamento, deleted_at) VALUES (1121, 'Bogotá', '11001', 3, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text('UPDATE municipios SET nombre = INITCAP(nombre);'),
        text("SELECT setval('municipios_id_seq', (SELECT MAX(id) FROM municipios) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_bolivar(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (149, 'Cartagena de Indias', '13001', 4, NULL),
              (150, 'Achí', '13006', 4, NULL),
              (151, 'Altos del Rosario', '13030', 4, NULL),
              (152, 'Arenal', '13042', 4, NULL),
              (153, 'Arjona', '13052', 4, NULL),
              (154, 'Arroyohondo', '13062', 4, NULL),
              (155, 'Barranco de Loba', '13074', 4, NULL),
              (156, 'Calamar', '13140', 4, NULL),
              (157, 'Cantagallo', '13160', 4, NULL),
              (158, 'Cicuco', '13188', 4, NULL),
              (159, 'Córdoba', '13212', 4, NULL),
              (160, 'Clemencia', '13222', 4, NULL),
              (161, 'El Carmen de Bolívar', '13244', 4, NULL),
              (162, 'El Guamo', '13248', 4, NULL),
              (163, 'El Peñón', '13268', 4, NULL),
              (164, 'Hatillo de Loba', '13300', 4, NULL),
              (165, 'Magangué', '13430', 4, NULL),
              (166, 'Mahates', '13433', 4, NULL),
              (167, 'Margarita', '13440', 4, NULL),
              (168, 'María La Baja', '13442', 4, NULL),
              (169, 'Montecristo', '13458', 4, NULL),
              (170, 'Santa Cruz de Mompox', '13468', 4, NULL),
              (171, 'Morales', '13473', 4, NULL),
              (172, 'Norosí', '13490', 4, NULL),
              (173, 'Pinillos', '13549', 4, NULL),
              (174, 'Regidor', '13580', 4, NULL),
              (175, 'Río Viejo', '13600', 4, NULL),
              (176, 'San Cristóbal', '13620', 4, NULL),
              (177, 'San Estanislao', '13647', 4, NULL),
              (178, 'San Fernando', '13650', 4, NULL),
              (179, 'San Jacinto', '13654', 4, NULL),
              (180, 'San Jacinto del Cauca', '13655', 4, NULL),
              (181, 'San Juan Nepomuceno', '13657', 4, NULL),
              (182, 'San Martín de Loba', '13667', 4, NULL),
              (183, 'San Pablo', '13670', 4, NULL),
              (184, 'Santa Catalina', '13673', 4, NULL),
              (185, 'Santa Rosa', '13683', 4, NULL),
              (186, 'Santa Rosa del Sur', '13688', 4, NULL),
              (187, 'Simití', '13744', 4, NULL),
              (188, 'Soplaviento', '13760', 4, NULL),
              (189, 'Talaigua Nuevo', '13780', 4, NULL),
              (190, 'Tiquisio', '13810', 4, NULL),
              (191, 'Turbaco', '13836', 4, NULL),
              (192, 'Turbaná', '13838', 4, NULL),
              (193, 'Villanueva', '13873', 4, NULL),
              (194, 'Zambrano', '13894', 4, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_boyaca(run_sql_statements):
    from sqlalchemy import text

    # Departamento Boyacá = id 5 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (195, 'Tunja', '15001', 5, NULL),
              (196, 'Almeida', '15022', 5, NULL),
              (197, 'Aquitania', '15047', 5, NULL),
              (198, 'Arcabuco', '15051', 5, NULL),
              (199, 'Belén', '15087', 5, NULL),
              (200, 'Berbeo', '15090', 5, NULL),
              (201, 'Betéitiva', '15092', 5, NULL),
              (202, 'Boavita', '15097', 5, NULL),
              (203, 'Boyacá', '15104', 5, NULL),
              (204, 'Briceño', '15106', 5, NULL),
              (205, 'Buenavista', '15109', 5, NULL),
              (206, 'Busbanzá', '15114', 5, NULL),
              (207, 'Caldas', '15131', 5, NULL),
              (208, 'Campohermoso', '15135', 5, NULL),
              (209, 'Cerinza', '15162', 5, NULL),
              (210, 'Chinavita', '15172', 5, NULL),
              (211, 'Chiquinquirá', '15176', 5, NULL),
              (212, 'Chiscas', '15180', 5, NULL),
              (213, 'Chita', '15183', 5, NULL),
              (214, 'Chitaraque', '15185', 5, NULL),
              (215, 'Chivatá', '15187', 5, NULL),
              (216, 'Ciénega', '15189', 5, NULL),
              (217, 'Cómbita', '15204', 5, NULL),
              (218, 'Coper', '15212', 5, NULL),
              (219, 'Corrales', '15215', 5, NULL),
              (220, 'Covarachía', '15218', 5, NULL),
              (221, 'CubarÁ', '15223', 5, NULL),
              (222, 'Cucaita', '15224', 5, NULL),
              (223, 'Cuítiva', '15226', 5, NULL),
              (224, 'Chíquiza', '15232', 5, NULL),
              (225, 'Chivor', '15236', 5, NULL),
              (226, 'Duitama', '15238', 5, NULL),
              (227, 'El Cocuy', '15244', 5, NULL),
              (228, 'El Espino', '15248', 5, NULL),
              (229, 'Firavitoba', '15272', 5, NULL),
              (230, 'Floresta', '15276', 5, NULL),
              (231, 'Gachantivá', '15293', 5, NULL),
              (232, 'Gámeza', '15296', 5, NULL),
              (233, 'Garagoa', '15299', 5, NULL),
              (234, 'Guacamayas', '15317', 5, NULL),
              (235, 'Guateque', '15322', 5, NULL),
              (236, 'Guayatá', '15325', 5, NULL),
              (237, 'Güicán de la Sierra', '15332', 5, NULL),
              (238, 'Iza', '15362', 5, NULL),
              (239, 'Jenesano', '15367', 5, NULL),
              (240, 'Jericó', '15368', 5, NULL),
              (241, 'Labranzagrande', '15377', 5, NULL),
              (242, 'La Capilla', '15380', 5, NULL),
              (243, 'La Victoria', '15401', 5, NULL),
              (244, 'La Uvita', '15403', 5, NULL),
              (245, 'Villa de Leyva', '15407', 5, NULL),
              (246, 'Macanal', '15425', 5, NULL),
              (247, 'Maripí', '15442', 5, NULL),
              (248, 'Miraflores', '15455', 5, NULL),
              (249, 'Mongua', '15464', 5, NULL),
              (250, 'Monguí', '15466', 5, NULL),
              (251, 'Moniquirá', '15469', 5, NULL),
              (252, 'Motavita', '15476', 5, NULL),
              (253, 'Muzo', '15480', 5, NULL),
              (254, 'Nobsa', '15491', 5, NULL),
              (255, 'Nuevo Colón', '15494', 5, NULL),
              (256, 'Oicatá', '15500', 5, NULL),
              (257, 'Otanche', '15507', 5, NULL),
              (258, 'Pachavita', '15511', 5, NULL),
              (259, 'Páez', '15514', 5, NULL),
              (260, 'Paipa', '15516', 5, NULL),
              (261, 'Pajarito', '15518', 5, NULL),
              (262, 'Panqueba', '15522', 5, NULL),
              (263, 'Pauna', '15531', 5, NULL),
              (264, 'Paya', '15533', 5, NULL),
              (265, 'Paz de Río', '15537', 5, NULL),
              (266, 'Pesca', '15542', 5, NULL),
              (267, 'Pisba', '15550', 5, NULL),
              (268, 'Puerto Boyacá', '15572', 5, NULL),
              (269, 'Quípama', '15580', 5, NULL),
              (270, 'Ramiriquí', '15599', 5, NULL),
              (271, 'Ráquira', '15600', 5, NULL),
              (272, 'Rondón', '15621', 5, NULL),
              (273, 'Saboyá', '15632', 5, NULL),
              (274, 'Sáchica', '15638', 5, NULL),
              (275, 'Samacá', '15646', 5, NULL),
              (276, 'San Eduardo', '15660', 5, NULL),
              (277, 'San José de Pare', '15664', 5, NULL),
              (278, 'San Luis de Gaceno', '15667', 5, NULL),
              (279, 'San Mateo', '15673', 5, NULL),
              (280, 'San Miguel de Sema', '15676', 5, NULL),
              (281, 'San Pablo de Borbur', '15681', 5, NULL),
              (282, 'Santana', '15686', 5, NULL),
              (283, 'Santa María', '15690', 5, NULL),
              (284, 'Santa Rosa de Viterbo', '15693', 5, NULL),
              (285, 'Santa Sofía', '15696', 5, NULL),
              (286, 'Sativanorte', '15720', 5, NULL),
              (287, 'Sativasur', '15723', 5, NULL),
              (288, 'Siachoque', '15740', 5, NULL),
              (289, 'Soatá', '15753', 5, NULL),
              (290, 'Socotá', '15755', 5, NULL),
              (291, 'Socha', '15757', 5, NULL),
              (292, 'Sogamoso', '15759', 5, NULL),
              (293, 'Somondoco', '15761', 5, NULL),
              (294, 'Sora', '15762', 5, NULL),
              (295, 'Sotaquirá', '15763', 5, NULL),
              (296, 'Soracá', '15764', 5, NULL),
              (297, 'Susacón', '15774', 5, NULL),
              (298, 'Sutamarchán', '15776', 5, NULL),
              (299, 'Sutatenza', '15778', 5, NULL),
              (300, 'Tasco', '15790', 5, NULL),
              (301, 'Tenza', '15798', 5, NULL),
              (302, 'Tibaná', '15804', 5, NULL),
              (303, 'Tibasosa', '15806', 5, NULL),
              (304, 'Tinjacá', '15808', 5, NULL),
              (305, 'Tipacoque', '15810', 5, NULL),
              (306, 'Toca', '15814', 5, NULL),
              (307, 'Togüí', '15816', 5, NULL),
              (308, 'Tópaga', '15820', 5, NULL),
              (309, 'Tota', '15822', 5, NULL),
              (310, 'Tununguá', '15832', 5, NULL),
              (311, 'Turmequé', '15835', 5, NULL),
              (312, 'Tuta', '15837', 5, NULL),
              (313, 'Tutazá', '15839', 5, NULL),
              (314, 'Úmbita', '15842', 5, NULL),
              (315, 'Ventaquemada', '15861', 5, NULL),
              (316, 'Viracachá', '15879', 5, NULL),
              (317, 'Zetaquira', '15897', 5, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_caldas(run_sql_statements):
    from sqlalchemy import text

    # Departamento Caldas = id 6 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (318, 'Manizales', '17001', 6, NULL),
              (319, 'Aguadas', '17013', 6, NULL),
              (320, 'Anserma', '17042', 6, NULL),
              (321, 'Aranzazu', '17050', 6, NULL),
              (322, 'Belalcázar', '17088', 6, NULL),
              (323, 'Chinchiná', '17174', 6, NULL),
              (324, 'Filadelfia', '17272', 6, NULL),
              (325, 'La Dorada', '17380', 6, NULL),
              (326, 'La Merced', '17388', 6, NULL),
              (327, 'Manzanares', '17433', 6, NULL),
              (328, 'Marmato', '17442', 6, NULL),
              (329, 'Marquetalia', '17444', 6, NULL),
              (330, 'Marulanda', '17446', 6, NULL),
              (331, 'Neira', '17486', 6, NULL),
              (332, 'Norcasia', '17495', 6, NULL),
              (333, 'Pácora', '17513', 6, NULL),
              (334, 'Palestina', '17524', 6, NULL),
              (335, 'Pensilvania', '17541', 6, NULL),
              (336, 'Riosucio', '17614', 6, NULL),
              (337, 'Risaralda', '17616', 6, NULL),
              (338, 'Salamina', '17653', 6, NULL),
              (339, 'Samaná', '17662', 6, NULL),
              (340, 'San José', '17665', 6, NULL),
              (341, 'Supía', '17777', 6, NULL),
              (342, 'Victoria', '17867', 6, NULL),
              (343, 'Villamaría', '17873', 6, NULL),
              (344, 'Viterbo', '17877', 6, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_caqueta(run_sql_statements):
    from sqlalchemy import text

    # Departamento Caquetá = id 7 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (345, 'Florencia', '18001', 7, NULL),
              (346, 'Albania', '18029', 7, NULL),
              (347, 'Belén de los Andaquíes', '18094', 7, NULL),
              (348, 'Cartagena del Chairá', '18150', 7, NULL),
              (349, 'Curillo', '18205', 7, NULL),
              (350, 'El Doncello', '18247', 7, NULL),
              (351, 'El Paujíl', '18256', 7, NULL),
              (352, 'La Montañita', '18410', 7, NULL),
              (353, 'Milán', '18460', 7, NULL),
              (354, 'Morelia', '18479', 7, NULL),
              (355, 'Puerto Rico', '18592', 7, NULL),
              (356, 'San José del Fragua', '18610', 7, NULL),
              (357, 'San Vicente del Caguán', '18753', 7, NULL),
              (358, 'Solano', '18756', 7, NULL),
              (359, 'Solita', '18785', 7, NULL),
              (360, 'Valparaíso', '18860', 7, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_cauca(run_sql_statements):
    from sqlalchemy import text

    # Departamento Cauca = id 8 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (361, 'Popayán', '19001', 8, NULL),
              (362, 'Almaguer', '19022', 8, NULL),
              (363, 'Argelia', '19050', 8, NULL),
              (364, 'Balboa', '19075', 8, NULL),
              (365, 'Bolívar', '19100', 8, NULL),
              (366, 'Buenos Aires', '19110', 8, NULL),
              (367, 'Cajibío', '19130', 8, NULL),
              (368, 'Caldono', '19137', 8, NULL),
              (369, 'Caloto', '19142', 8, NULL),
              (370, 'Corinto', '19212', 8, NULL),
              (371, 'El Tambo', '19256', 8, NULL),
              (372, 'Florencia', '19290', 8, NULL),
              (373, 'Guachené', '19300', 8, NULL),
              (374, 'Guapi', '19318', 8, NULL),
              (375, 'Inzá', '19355', 8, NULL),
              (376, 'Jambaló', '19364', 8, NULL),
              (377, 'La Sierra', '19392', 8, NULL),
              (378, 'La Vega', '19397', 8, NULL),
              (379, 'López de Micay', '19418', 8, NULL),
              (380, 'Mercaderes', '19450', 8, NULL),
              (381, 'Miranda', '19455', 8, NULL),
              (382, 'Morales', '19473', 8, NULL),
              (383, 'Padilla', '19513', 8, NULL),
              (384, 'Páez', '19517', 8, NULL),
              (385, 'Patía', '19532', 8, NULL),
              (386, 'Piamonte', '19533', 8, NULL),
              (387, 'Piendamó - Tunía', '19548', 8, NULL),
              (388, 'Puerto Tejada', '19573', 8, NULL),
              (389, 'Puracé', '19585', 8, NULL),
              (390, 'Rosas', '19622', 8, NULL),
              (391, 'San Sebastián', '19693', 8, NULL),
              (392, 'Santander de Quilichao', '19698', 8, NULL),
              (393, 'Santa Rosa', '19701', 8, NULL),
              (394, 'Silvia', '19743', 8, NULL),
              (395, 'Sotará - Paispamba', '19760', 8, NULL),
              (396, 'Suárez', '19780', 8, NULL),
              (397, 'Sucre', '19785', 8, NULL),
              (398, 'Timbío', '19807', 8, NULL),
              (399, 'Timbiquí', '19809', 8, NULL),
              (400, 'Toribío', '19821', 8, NULL),
              (401, 'Totoró', '19824', 8, NULL),
              (402, 'Villa Rica', '19845', 8, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_cesar(run_sql_statements):
    from sqlalchemy import text

    # Departamento Cesar = id 9 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (403, 'Valledupar', '20001', 9, NULL),
              (404, 'Aguachica', '20011', 9, NULL),
              (405, 'Agustín Codazzi', '20013', 9, NULL),
              (406, 'Astrea', '20032', 9, NULL),
              (407, 'Becerril', '20045', 9, NULL),
              (408, 'Bosconia', '20060', 9, NULL),
              (409, 'Chimichagua', '20175', 9, NULL),
              (410, 'Chiriguaná', '20178', 9, NULL),
              (411, 'Curumaní', '20228', 9, NULL),
              (412, 'El Copey', '20238', 9, NULL),
              (413, 'El Paso', '20250', 9, NULL),
              (414, 'Gamarra', '20295', 9, NULL),
              (415, 'González', '20310', 9, NULL),
              (416, 'La Gloria', '20383', 9, NULL),
              (417, 'La Jagua de Ibirico', '20400', 9, NULL),
              (418, 'Manaure Balcón del Cesar', '20443', 9, NULL),
              (419, 'Pailitas', '20517', 9, NULL),
              (420, 'Pelaya', '20550', 9, NULL),
              (421, 'Pueblo Bello', '20570', 9, NULL),
              (422, 'Río de Oro', '20614', 9, NULL),
              (423, 'La Paz', '20621', 9, NULL),
              (424, 'San Alberto', '20710', 9, NULL),
              (425, 'San Diego', '20750', 9, NULL),
              (426, 'San Martín', '20770', 9, NULL),
              (427, 'Tamalameque', '20787', 9, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_cordoba(run_sql_statements):
    from sqlalchemy import text

    # Departamento Córdoba = id 10 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (428, 'Montería', '23001', 10, NULL),
              (429, 'Ayapel', '23068', 10, NULL),
              (430, 'Buenavista', '23079', 10, NULL),
              (431, 'Canalete', '23090', 10, NULL),
              (432, 'Cereté', '23162', 10, NULL),
              (433, 'Chimá', '23168', 10, NULL),
              (434, 'Chinú', '23182', 10, NULL),
              (435, 'Ciénaga de Oro', '23189', 10, NULL),
              (436, 'Cotorra', '23300', 10, NULL),
              (437, 'La Apartada', '23350', 10, NULL),
              (438, 'Lorica', '23417', 10, NULL),
              (439, 'Los Córdobas', '23419', 10, NULL),
              (440, 'Momil', '23464', 10, NULL),
              (441, 'Montelíbano', '23466', 10, NULL),
              (442, 'Moñitos', '23500', 10, NULL),
              (443, 'Planeta Rica', '23555', 10, NULL),
              (444, 'Pueblo Nuevo', '23570', 10, NULL),
              (445, 'Puerto Escondido', '23574', 10, NULL),
              (446, 'Puerto Libertador', '23580', 10, NULL),
              (447, 'Purísima de la Concepción', '23586', 10, NULL),
              (448, 'Sahagún', '23660', 10, NULL),
              (449, 'San Andrés de Sotavento', '23670', 10, NULL),
              (450, 'San Antero', '23672', 10, NULL),
              (451, 'San Bernardo del Viento', '23675', 10, NULL),
              (452, 'San Carlos', '23678', 10, NULL),
              (453, 'San José de Uré', '23682', 10, NULL),
              (454, 'San Pelayo', '23686', 10, NULL),
              (455, 'Tierralta', '23807', 10, NULL),
              (456, 'Tuchín', '23815', 10, NULL),
              (457, 'Valencia', '23855', 10, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_cundinamarca(run_sql_statements):
    
    from sqlalchemy import text

    sql_statements = [
        text("""
            INSERT INTO municipios (id, nombre, codigo_iso, id_departamento, deleted_at) VALUES (1, 'Agua de Dios', '25001', 11, NULL),
            (458, 'Albán', '25019', 11, NULL),
            (459, 'Anapoima', '25035', 11, NULL),
            (460, 'Anolaima', '25040', 11, NULL),
            (461, 'Arbeláez', '25053', 11, NULL),
            (462, 'Beltrán', '25086', 11, NULL),
            (463, 'Bituima', '25095', 11, NULL),
            (464, 'Bojacá', '25099', 11, NULL),
            (465, 'Cabrera', '25120', 11, NULL),
            (466, 'Cachipay', '25123', 11, NULL),
            (467, 'Cajicá', '25126', 11, NULL),
            (468, 'Caparrapí', '25148', 11, NULL),
            (469, 'Cáqueza', '25151', 11, NULL),
            (470, 'Carmen de Carupa', '25154', 11, NULL),
            (471, 'Chaguaní', '25168', 11, NULL),
            (472, 'Chía', '25175', 11, NULL),
            (473, 'Chipaque', '25178', 11, NULL),
            (474, 'Choachí', '25181', 11, NULL),
            (475, 'Chocontá', '25183', 11, NULL),
            (476, 'Cogua', '25200', 11, NULL),
            (477, 'Cota', '25214', 11, NULL),
            (478, 'Cucunubá', '25224', 11, NULL),
            (479, 'El Colegio', '25245', 11, NULL),
            (480, 'El Peñón', '25258', 11, NULL),
            (481, 'El Rosal', '25260', 11, NULL),
            (482, 'Facatativá', '25269', 11, NULL),
            (483, 'Fómeque', '25279', 11, NULL),
            (484, 'Fosca', '25281', 11, NULL),
            (485, 'Funza', '25286', 11, NULL),
            (486, 'Fúquene', '25288', 11, NULL),
            (487, 'Fusagasugá', '25290', 11, NULL),
            (488, 'Gachalá', '25293', 11, NULL),
            (489, 'Gachancipá', '25295', 11, NULL),
            (490, 'Gachetá', '25297', 11, NULL),
            (491, 'Gama', '25299', 11, NULL),
            (492, 'Girardot', '25307', 11, NULL),
            (493, 'Granada', '25312', 11, NULL),
            (494, 'Guachetá', '25317', 11, NULL),
            (495, 'Guaduas', '25320', 11, NULL),
            (496, 'Guasca', '25322', 11, NULL),
            (497, 'Guataquí', '25324', 11, NULL),
            (498, 'Guatavita', '25326', 11, NULL),
            (499, 'Guayabal de Síquima', '25328', 11, NULL),
            (500, 'Guayabetal', '25335', 11, NULL),
            (501, 'Gutiérrez', '25339', 11, NULL),
            (502, 'Jerusalén', '25368', 11, NULL),
            (503, 'Junín', '25372', 11, NULL),
            (504, 'La Calera', '25377', 11, NULL),
            (505, 'La Mesa', '25386', 11, NULL),
            (506, 'La Palma', '25394', 11, NULL),
            (507, 'La Peña', '25398', 11, NULL),
            (508, 'La Vega', '25402', 11, NULL),
            (509, 'Lenguazaque', '25407', 11, NULL),
            (510, 'Machetá', '25426', 11, NULL),
            (511, 'Madrid', '25430', 11, NULL),
            (512, 'Manta', '25436', 11, NULL),
            (513, 'Medina', '25438', 11, NULL),
            (514, 'Mosquera', '25473', 11, NULL),
            (515, 'Nariño', '25483', 11, NULL),
            (516, 'Nemocón', '25486', 11, NULL),
            (517, 'Nilo', '25488', 11, NULL),
            (518, 'Nimaima', '25489', 11, NULL),
            (519, 'Nocaima', '25491', 11, NULL),
            (520, 'Venecia', '25506', 11, NULL),
            (521, 'Pacho', '25513', 11, NULL),
            (522, 'Paime', '25518', 11, NULL),
            (523, 'Pandi', '25524', 11, NULL),
            (524, 'Paratebueno', '25530', 11, NULL),
            (525, 'Pasca', '25535', 11, NULL),
            (526, 'Puerto Salgar', '25572', 11, NULL),
            (527, 'Pulí', '25580', 11, NULL),
            (528, 'Quebradanegra', '25592', 11, NULL),
            (529, 'Quetame', '25594', 11, NULL),
            (530, 'Quipile', '25596', 11, NULL),
            (531, 'Apulo', '25599', 11, NULL),
            (532, 'Ricaurte', '25612', 11, NULL),
            (533, 'San Antonio del Tequendama', '25645', 11, NULL),
            (534, 'San Bernardo', '25649', 11, NULL),
            (535, 'San Cayetano', '25653', 11, NULL),
            (536, 'San Francisco', '25658', 11, NULL),
            (537, 'San Juan de Río Seco', '25662', 11, NULL),
            (538, 'Sasaima', '25718', 11, NULL),
            (539, 'Sesquilé', '25736', 11, NULL),
            (540, 'Sibaté', '25740', 11, NULL),
            (541, 'Silvania', '25743', 11, NULL),
            (542, 'Simijaca', '25745', 11, NULL),
            (543, 'Soacha', '25754', 11, NULL),
            (544, 'Sopó', '25758', 11, NULL),
            (545, 'Subachoque', '25769', 11, NULL),
            (546, 'Suesca', '25772', 11, NULL),
            (547, 'Supatá', '25777', 11, NULL),
            (548, 'Susa', '25779', 11, NULL),
            (549, 'Sutatausa', '25781', 11, NULL),
            (550, 'Tabio', '25785', 11, NULL),
            (551, 'Tausa', '25793', 11, NULL),
            (552, 'Tena', '25797', 11, NULL),
            (553, 'Tenjo', '25799', 11, NULL),
            (554, 'Tibacuy', '25805', 11, NULL),
            (555, 'Tibirita', '25807', 11, NULL),
            (556, 'Tocaima', '25815', 11, NULL),
            (557, 'Tocancipá', '25817', 11, NULL),
            (558, 'Topaipí', '25823', 11, NULL),
            (559, 'Ubalá', '25839', 11, NULL),
            (560, 'Ubaque', '25841', 11, NULL),
            (561, 'Villa de San Diego de Ubaté', '25843', 11, NULL),
            (562, 'Une', '25845', 11, NULL),
            (563, 'Útica', '25851', 11, NULL),
            (564, 'Vergara', '25862', 11, NULL),
            (565, 'Vianí', '25867', 11, NULL),
            (566, 'Villagómez', '25871', 11, NULL),
            (567, 'Villapinzón', '25873', 11, NULL),
            (568, 'Villeta', '25875', 11, NULL),
            (569, 'Viotá', '25878', 11, NULL),
            (570, 'Yacopí', '25885', 11, NULL),
            (571, 'Zipacón', '25898', 11, NULL),
            (572, 'Zipaquirá', '25899', 11, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text('UPDATE municipios SET nombre = INITCAP(nombre);'),
        text("SELECT setval('municipios_id_seq', (SELECT MAX(id) FROM municipios) + 1, false);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_choco(run_sql_statements):
    from sqlalchemy import text

    # Chocó = id 12 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (573, 'Quibdó', '27001', 12, NULL),
              (574, 'Acandí', '27006', 12, NULL),
              (575, 'Alto Baudó', '27025', 12, NULL),
              (576, 'Atrato', '27050', 12, NULL),
              (577, 'Bagadó', '27073', 12, NULL),
              (578, 'Bahía Solano', '27075', 12, NULL),
              (579, 'Bajo Baudó', '27077', 12, NULL),
              (580, 'Bojayá', '27099', 12, NULL),
              (581, 'El Cantón del San Pablo', '27135', 12, NULL),
              (582, 'Carmen del Darién', '27150', 12, NULL),
              (583, 'Cértegui', '27160', 12, NULL),
              (584, 'Condoto', '27205', 12, NULL),
              (585, 'El Carmen de Atrato', '27245', 12, NULL),
              (586, 'El Litoral del San Juan', '27250', 12, NULL),
              (587, 'Istmina', '27361', 12, NULL),
              (588, 'Juradó', '27372', 12, NULL),
              (589, 'Lloró', '27413', 12, NULL),
              (590, 'Medio Atrato', '27425', 12, NULL),
              (591, 'Medio Baudó', '27430', 12, NULL),
              (592, 'Medio San Juan', '27450', 12, NULL),
              (593, 'Nóvita', '27491', 12, NULL),
              (594, 'Nuevo Belén de Bajirá', '27493', 12, NULL),
              (595, 'Nuquí', '27495', 12, NULL),
              (596, 'Río Iró', '27580', 12, NULL),
              (597, 'Río Quito', '27600', 12, NULL),
              (598, 'Riosucio', '27615', 12, NULL),
              (599, 'San José del Palmar', '27660', 12, NULL),
              (600, 'Sipí', '27745', 12, NULL),
              (601, 'Tadó', '27787', 12, NULL),
              (602, 'Unguía', '27800', 12, NULL),
              (603, 'Unión Panamericana', '27810', 12, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_huila(run_sql_statements):
    from sqlalchemy import text

    # Huila = id 13 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (604, 'Neiva', '41001', 13, NULL),
              (605, 'Acevedo', '41006', 13, NULL),
              (606, 'Agrado', '41013', 13, NULL),
              (607, 'Aipe', '41016', 13, NULL),
              (608, 'Algeciras', '41020', 13, NULL),
              (609, 'Altamira', '41026', 13, NULL),
              (610, 'Baraya', '41078', 13, NULL),
              (611, 'Campoalegre', '41132', 13, NULL),
              (612, 'Colombia', '41206', 13, NULL),
              (613, 'Elías', '41244', 13, NULL),
              (614, 'Garzón', '41298', 13, NULL),
              (615, 'Gigante', '41306', 13, NULL),
              (616, 'Guadalupe', '41319', 13, NULL),
              (617, 'Hobo', '41349', 13, NULL),
              (618, 'Íquira', '41357', 13, NULL),
              (619, 'Isnos', '41359', 13, NULL),
              (620, 'La Argentina', '41378', 13, NULL),
              (621, 'La Plata', '41396', 13, NULL),
              (622, 'Nátaga', '41483', 13, NULL),
              (623, 'Oporapa', '41503', 13, NULL),
              (624, 'Paicol', '41518', 13, NULL),
              (625, 'Palermo', '41524', 13, NULL),
              (626, 'Palestina', '41530', 13, NULL),
              (627, 'Pital', '41548', 13, NULL),
              (628, 'Pitalito', '41551', 13, NULL),
              (629, 'Rivera', '41615', 13, NULL),
              (630, 'Saladoblanco', '41660', 13, NULL),
              (631, 'San Agustín', '41668', 13, NULL),
              (632, 'Santa María', '41676', 13, NULL),
              (633, 'Suaza', '41770', 13, NULL),
              (634, 'Tarqui', '41791', 13, NULL),
              (635, 'Tesalia', '41797', 13, NULL),
              (636, 'Tello', '41799', 13, NULL),
              (637, 'Teruel', '41801', 13, NULL),
              (638, 'Timaná', '41807', 13, NULL),
              (639, 'Villavieja', '41872', 13, NULL),
              (640, 'Yaguará', '41885', 13, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_la_guajira(run_sql_statements):
    from sqlalchemy import text

    # La Guajira = id 14 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (641, 'Riohacha', '44001', 14, NULL),
              (642, 'Albania', '44035', 14, NULL),
              (643, 'Barrancas', '44078', 14, NULL),
              (644, 'Dibulla', '44090', 14, NULL),
              (645, 'Distracción', '44098', 14, NULL),
              (646, 'El Molino', '44110', 14, NULL),
              (647, 'Fonseca', '44279', 14, NULL),
              (648, 'Hatonuevo', '44378', 14, NULL),
              (649, 'La Jagua del Pilar', '44420', 14, NULL),
              (650, 'Maicao', '44430', 14, NULL),
              (651, 'Manaure', '44560', 14, NULL),
              (652, 'San Juan del Cesar', '44650', 14, NULL),
              (653, 'Uribia', '44847', 14, NULL),
              (654, 'Urumita', '44855', 14, NULL),
              (655, 'Villanueva', '44874', 14, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_magdalena(run_sql_statements):
    from sqlalchemy import text

    # Magdalena = id 15 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (656, 'Santa Marta', '47001', 15, NULL),
              (657, 'Algarrobo', '47030', 15, NULL),
              (658, 'Aracataca', '47053', 15, NULL),
              (659, 'Ariguaní', '47058', 15, NULL),
              (660, 'Cerro de San Antonio', '47161', 15, NULL),
              (661, 'Chivolo', '47170', 15, NULL),
              (662, 'Ciénaga', '47189', 15, NULL),
              (663, 'Concordia', '47205', 15, NULL),
              (664, 'El Banco', '47245', 15, NULL),
              (665, 'El Piñón', '47258', 15, NULL),
              (666, 'El Retén', '47268', 15, NULL),
              (667, 'Fundación', '47288', 15, NULL),
              (668, 'Guamal', '47318', 15, NULL),
              (669, 'Nueva Granada', '47460', 15, NULL),
              (670, 'Pedraza', '47541', 15, NULL),
              (671, 'Pijiño del Carmen', '47545', 15, NULL),
              (672, 'Pivijay', '47551', 15, NULL),
              (673, 'Plato', '47555', 15, NULL),
              (674, 'Puebloviejo', '47570', 15, NULL),
              (675, 'Remolino', '47605', 15, NULL),
              (676, 'Sabanas de San Ángel', '47660', 15, NULL),
              (677, 'Salamina', '47675', 15, NULL),
              (678, 'San Sebastián de Buenavista', '47692', 15, NULL),
              (679, 'San Zenón', '47703', 15, NULL),
              (680, 'Santa Ana', '47707', 15, NULL),
              (681, 'Santa Bárbara de Pinto', '47720', 15, NULL),
              (682, 'Sitionuevo', '47745', 15, NULL),
              (683, 'Tenerife', '47798', 15, NULL),
              (684, 'Zapayán', '47960', 15, NULL),
              (685, 'Zona Bananera', '47980', 15, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_meta(run_sql_statements):
    from sqlalchemy import text

    # Meta = id 16 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (686, 'Villavicencio', '50001', 16, NULL),
              (687, 'Acacías', '50006', 16, NULL),
              (688, 'Barranca de Upía', '50110', 16, NULL),
              (689, 'Cabuyaro', '50124', 16, NULL),
              (690, 'Castilla la Nueva', '50150', 16, NULL),
              (691, 'Cubarral', '50223', 16, NULL),
              (692, 'Cumaral', '50226', 16, NULL),
              (693, 'El Calvario', '50245', 16, NULL),
              (694, 'El Castillo', '50251', 16, NULL),
              (695, 'El Dorado', '50270', 16, NULL),
              (696, 'Fuente de Oro', '50287', 16, NULL),
              (697, 'Granada', '50313', 16, NULL),
              (698, 'Guamal', '50318', 16, NULL),
              (699, 'Mapiripán', '50325', 16, NULL),
              (700, 'Mesetas', '50330', 16, NULL),
              (701, 'La Macarena', '50350', 16, NULL),
              (702, 'Uribe', '50370', 16, NULL),
              (703, 'Lejanías', '50400', 16, NULL),
              (704, 'Puerto Concordia', '50450', 16, NULL),
              (705, 'Puerto Gaitán', '50568', 16, NULL),
              (706, 'Puerto López', '50573', 16, NULL),
              (707, 'Puerto Lleras', '50577', 16, NULL),
              (708, 'Puerto Rico', '50590', 16, NULL),
              (709, 'Restrepo', '50606', 16, NULL),
              (710, 'San Carlos de Guaroa', '50680', 16, NULL),
              (711, 'San Juan de Arama', '50683', 16, NULL),
              (712, 'San Juanito', '50686', 16, NULL),
              (713, 'San Martín', '50689', 16, NULL),
              (714, 'VistaHermosa', '50711', 16, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_narino(run_sql_statements):
    from sqlalchemy import text

    # Nariño = id 17 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (715, 'Pasto', '52001', 17, NULL),
              (716, 'Albán', '52019', 17, NULL),
              (717, 'Aldana', '52022', 17, NULL),
              (718, 'Ancuya', '52036', 17, NULL),
              (719, 'Arboleda', '52051', 17, NULL),
              (720, 'Barbacoas', '52079', 17, NULL),
              (721, 'Belén', '52083', 17, NULL),
              (722, 'Buesaco', '52110', 17, NULL),
              (723, 'Colón', '52203', 17, NULL),
              (724, 'Consacá', '52207', 17, NULL),
              (725, 'Contadero', '52210', 17, NULL),
              (726, 'Córdoba', '52215', 17, NULL),
              (727, 'Cuaspud Carlosama', '52224', 17, NULL),
              (728, 'Cumbal', '52227', 17, NULL),
              (729, 'Cumbitara', '52233', 17, NULL),
              (730, 'Chachagüí', '52240', 17, NULL),
              (731, 'El Charco', '52250', 17, NULL),
              (732, 'El Peñol', '52254', 17, NULL),
              (733, 'El Rosario', '52256', 17, NULL),
              (734, 'El Tablón de Gómez', '52258', 17, NULL),
              (735, 'El Tambo', '52260', 17, NULL),
              (736, 'Funes', '52287', 17, NULL),
              (737, 'Guachucal', '52317', 17, NULL),
              (738, 'Guaitarilla', '52320', 17, NULL),
              (739, 'Gualmatán', '52323', 17, NULL),
              (740, 'Iles', '52352', 17, NULL),
              (741, 'Imués', '52354', 17, NULL),
              (742, 'Ipiales', '52356', 17, NULL),
              (743, 'La Cruz', '52378', 17, NULL),
              (744, 'La Florida', '52381', 17, NULL),
              (745, 'La Llanada', '52385', 17, NULL),
              (746, 'La Tola', '52390', 17, NULL),
              (747, 'La Unión', '52399', 17, NULL),
              (748, 'Leiva', '52405', 17, NULL),
              (749, 'Linares', '52411', 17, NULL),
              (750, 'Los Andes', '52418', 17, NULL),
              (751, 'Magüí', '52427', 17, NULL),
              (752, 'Mallama', '52435', 17, NULL),
              (753, 'Mosquera', '52473', 17, NULL),
              (754, 'Nariño', '52480', 17, NULL),
              (755, 'Olaya Herrera', '52490', 17, NULL),
              (756, 'Ospina', '52506', 17, NULL),
              (757, 'Francisco Pizarro', '52520', 17, NULL),
              (758, 'Policarpa', '52540', 17, NULL),
              (759, 'Potosí', '52560', 17, NULL),
              (760, 'Providencia', '52565', 17, NULL),
              (761, 'Puerres', '52573', 17, NULL),
              (762, 'Pupiales', '52585', 17, NULL),
              (763, 'Ricaurte', '52612', 17, NULL),
              (764, 'Roberto Payán', '52621', 17, NULL),
              (765, 'Samaniego', '52678', 17, NULL),
              (766, 'Sandoná', '52683', 17, NULL),
              (767, 'San Bernardo', '52685', 17, NULL),
              (768, 'San Lorenzo', '52687', 17, NULL),
              (769, 'San Pablo', '52693', 17, NULL),
              (770, 'San Pedro de Cartago', '52694', 17, NULL),
              (771, 'Santa Bárbara', '52696', 17, NULL),
              (772, 'Santacruz', '52699', 17, NULL),
              (773, 'Sapuyes', '52720', 17, NULL),
              (774, 'Taminango', '52786', 17, NULL),
              (775, 'Tangua', '52788', 17, NULL),
              (776, 'San Andrés de Tumaco', '52835', 17, NULL),
              (777, 'Túquerres', '52838', 17, NULL),
              (778, 'Yacuanquer', '52885', 17, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_norte_de_santander(run_sql_statements):
    from sqlalchemy import text

    # Norte de Santander = id 18 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (779, 'San José de Cúcuta', '54001', 18, NULL),
              (780, 'Ábrego', '54003', 18, NULL),
              (781, 'Arboledas', '54051', 18, NULL),
              (782, 'Bochalema', '54099', 18, NULL),
              (783, 'Bucarasica', '54109', 18, NULL),
              (784, 'Cácota', '54125', 18, NULL),
              (785, 'Cáchira', '54128', 18, NULL),
              (786, 'Chinácota', '54172', 18, NULL),
              (787, 'Chitagá', '54174', 18, NULL),
              (788, 'Convención', '54206', 18, NULL),
              (789, 'Cucutilla', '54223', 18, NULL),
              (790, 'Durania', '54239', 18, NULL),
              (791, 'El Carmen', '54245', 18, NULL),
              (792, 'El Tarra', '54250', 18, NULL),
              (793, 'El Zulia', '54261', 18, NULL),
              (794, 'Gramalote', '54313', 18, NULL),
              (795, 'Hacarí', '54344', 18, NULL),
              (796, 'Herrán', '54347', 18, NULL),
              (797, 'Labateca', '54377', 18, NULL),
              (798, 'La Esperanza', '54385', 18, NULL),
              (799, 'La Playa', '54398', 18, NULL),
              (800, 'Los Patios', '54405', 18, NULL),
              (801, 'Lourdes', '54418', 18, NULL),
              (802, 'Mutiscua', '54480', 18, NULL),
              (803, 'Ocaña', '54498', 18, NULL),
              (804, 'Pamplona', '54518', 18, NULL),
              (805, 'Pamplonita', '54520', 18, NULL),
              (806, 'Puerto Santander', '54553', 18, NULL),
              (807, 'Ragonvalia', '54599', 18, NULL),
              (808, 'Salazar', '54660', 18, NULL),
              (809, 'San Calixto', '54670', 18, NULL),
              (810, 'San Cayetano', '54673', 18, NULL),
              (811, 'Santiago', '54680', 18, NULL),
              (812, 'Sardinata', '54720', 18, NULL),
              (813, 'Silos', '54743', 18, NULL),
              (814, 'Teorama', '54800', 18, NULL),
              (815, 'Tibú', '54810', 18, NULL),
              (816, 'Toledo', '54820', 18, NULL),
              (817, 'Villa Caro', '54871', 18, NULL),
              (818, 'Villa del Rosario', '54874', 18, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_quindio(run_sql_statements):
    from sqlalchemy import text

    # Quindío = id 19 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (819, 'Armenia', '63001', 19, NULL),
              (820, 'Buenavista', '63111', 19, NULL),
              (821, 'Calarcá', '63130', 19, NULL),
              (822, 'Circasia', '63190', 19, NULL),
              (823, 'Córdoba', '63212', 19, NULL),
              (824, 'Filandia', '63272', 19, NULL),
              (825, 'Génova', '63302', 19, NULL),
              (826, 'La Tebaida', '63401', 19, NULL),
              (827, 'Montenegro', '63470', 19, NULL),
              (828, 'Pijao', '63548', 19, NULL),
              (829, 'Quimbaya', '63594', 19, NULL),
              (830, 'Salento', '63690', 19, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_risaralda(run_sql_statements):
    from sqlalchemy import text

    # Risaralda = id 20 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (831, 'Pereira', '66001', 20, NULL),
              (832, 'Apía', '66045', 20, NULL),
              (833, 'Balboa', '66075', 20, NULL),
              (834, 'Belén de Umbría', '66088', 20, NULL),
              (835, 'Dosquebradas', '66170', 20, NULL),
              (836, 'Guática', '66318', 20, NULL),
              (837, 'La Celia', '66383', 20, NULL),
              (838, 'La Virginia', '66400', 20, NULL),
              (839, 'Marsella', '66440', 20, NULL),
              (840, 'Mistrató', '66456', 20, NULL),
              (841, 'Pueblo Rico', '66572', 20, NULL),
              (842, 'Quinchía', '66594', 20, NULL),
              (843, 'Santa Rosa de Cabal', '66682', 20, NULL),
              (844, 'Santuario', '66687', 20, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_santander(run_sql_statements):
    from sqlalchemy import text

    # Santander = id 21 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (845, 'Bucaramanga', '68001', 21, NULL),
              (846, 'Aguada', '68013', 21, NULL),
              (847, 'Albania', '68020', 21, NULL),
              (848, 'Aratoca', '68051', 21, NULL),
              (849, 'Barbosa', '68077', 21, NULL),
              (850, 'Barichara', '68079', 21, NULL),
              (851, 'Barrancabermeja', '68081', 21, NULL),
              (852, 'Betulia', '68092', 21, NULL),
              (853, 'Bolívar', '68101', 21, NULL),
              (854, 'Cabrera', '68121', 21, NULL),
              (855, 'California', '68132', 21, NULL),
              (856, 'Capitanejo', '68147', 21, NULL),
              (857, 'Carcasí', '68152', 21, NULL),
              (858, 'Cepitá', '68160', 21, NULL),
              (859, 'Cerrito', '68162', 21, NULL),
              (860, 'Charalá', '68167', 21, NULL),
              (861, 'Charta', '68169', 21, NULL),
              (862, 'Chima', '68176', 21, NULL),
              (863, 'Chipatá', '68179', 21, NULL),
              (864, 'Cimitarra', '68190', 21, NULL),
              (865, 'Concepción', '68207', 21, NULL),
              (866, 'Confines', '68209', 21, NULL),
              (867, 'Contratación', '68211', 21, NULL),
              (868, 'Coromoro', '68217', 21, NULL),
              (869, 'Curití', '68229', 21, NULL),
              (870, 'El Carmen de Chucurí', '68235', 21, NULL),
              (871, 'El Guacamayo', '68245', 21, NULL),
              (872, 'El Peñón', '68250', 21, NULL),
              (873, 'El Playón', '68255', 21, NULL),
              (874, 'Encino', '68264', 21, NULL),
              (875, 'Enciso', '68266', 21, NULL),
              (876, 'Florián', '68271', 21, NULL),
              (877, 'Floridablanca', '68276', 21, NULL),
              (878, 'Galán', '68296', 21, NULL),
              (879, 'Gámbita', '68298', 21, NULL),
              (880, 'Girón', '68307', 21, NULL),
              (881, 'Guaca', '68318', 21, NULL),
              (882, 'Guadalupe', '68320', 21, NULL),
              (883, 'Guapotá', '68322', 21, NULL),
              (884, 'Guavatá', '68324', 21, NULL),
              (885, 'Güepsa', '68327', 21, NULL),
              (886, 'Hato', '68344', 21, NULL),
              (887, 'Jesús María', '68368', 21, NULL),
              (888, 'Jordán', '68370', 21, NULL),
              (889, 'La Belleza', '68377', 21, NULL),
              (890, 'Landázuri', '68385', 21, NULL),
              (891, 'La Paz', '68397', 21, NULL),
              (892, 'Lebrija', '68406', 21, NULL),
              (893, 'Los Santos', '68418', 21, NULL),
              (894, 'Macaravita', '68425', 21, NULL),
              (895, 'Málaga', '68432', 21, NULL),
              (896, 'Matanza', '68444', 21, NULL),
              (897, 'Mogotes', '68464', 21, NULL),
              (898, 'Molagavita', '68468', 21, NULL),
              (899, 'Ocamonte', '68498', 21, NULL),
              (900, 'Oiba', '68500', 21, NULL),
              (901, 'Onzaga', '68502', 21, NULL),
              (902, 'Palmar', '68522', 21, NULL),
              (903, 'Palmas del Socorro', '68524', 21, NULL),
              (904, 'Páramo', '68533', 21, NULL),
              (905, 'Piedecuesta', '68547', 21, NULL),
              (906, 'Pinchote', '68549', 21, NULL),
              (907, 'Puente Nacional', '68572', 21, NULL),
              (908, 'Puerto Parra', '68573', 21, NULL),
              (909, 'Puerto Wilches', '68575', 21, NULL),
              (910, 'Rionegro', '68615', 21, NULL),
              (911, 'Sabana de Torres', '68655', 21, NULL),
              (912, 'San Andrés', '68669', 21, NULL),
              (913, 'San Benito', '68673', 21, NULL),
              (914, 'San Gil', '68679', 21, NULL),
              (915, 'San Joaquín', '68682', 21, NULL),
              (916, 'San José de Miranda', '68684', 21, NULL),
              (917, 'San Miguel', '68686', 21, NULL),
              (918, 'San Vicente de Chucurí', '68689', 21, NULL),
              (919, 'Santa Bárbara', '68705', 21, NULL),
              (920, 'Santa Helena del Opón', '68720', 21, NULL),
              (921, 'Simacota', '68745', 21, NULL),
              (922, 'Socorro', '68755', 21, NULL),
              (923, 'Suaita', '68770', 21, NULL),
              (924, 'Sucre', '68773', 21, NULL),
              (925, 'Suratá', '68780', 21, NULL),
              (926, 'Tona', '68820', 21, NULL),
              (927, 'Valle de San José', '68855', 21, NULL),
              (928, 'Vélez', '68861', 21, NULL),
              (929, 'Vetas', '68867', 21, NULL),
              (930, 'Villanueva', '68872', 21, NULL),
              (931, 'Zapatoca', '68895', 21, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_sucre(run_sql_statements):
    from sqlalchemy import text

    # Sucre = id 22 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (932, 'Sincelejo', '70001', 22, NULL),
              (933, 'Buenavista', '70110', 22, NULL),
              (934, 'Caimito', '70124', 22, NULL),
              (935, 'Colosó', '70204', 22, NULL),
              (936, 'Corozal', '70215', 22, NULL),
              (937, 'Coveñas', '70221', 22, NULL),
              (938, 'Chalán', '70230', 22, NULL),
              (939, 'El Roble', '70233', 22, NULL),
              (940, 'Galeras', '70235', 22, NULL),
              (941, 'Guaranda', '70265', 22, NULL),
              (942, 'La Unión', '70400', 22, NULL),
              (943, 'Los Palmitos', '70418', 22, NULL),
              (944, 'Majagual', '70429', 22, NULL),
              (945, 'Morroa', '70473', 22, NULL),
              (946, 'Ovejas', '70508', 22, NULL),
              (947, 'Palmito', '70523', 22, NULL),
              (948, 'Sampués', '70670', 22, NULL),
              (949, 'San Benito Abad', '70678', 22, NULL),
              (950, 'San Juan de Betulia', '70702', 22, NULL),
              (951, 'San Marcos', '70708', 22, NULL),
              (952, 'San Onofre', '70713', 22, NULL),
              (953, 'San Pedro', '70717', 22, NULL),
              (954, 'San Luis de Sincé', '70742', 22, NULL),
              (955, 'Sucre', '70771', 22, NULL),
              (956, 'Santiago de Tolú', '70820', 22, NULL),
              (957, 'San José de Toluviejo', '70823', 22, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)


# Funciones faltantes
async def seed_ciudades_tolima(run_sql_statements):
  from sqlalchemy import text

  # Tolima = id 23 en tu tabla `departamento`
  sql_statements = [
    text("""
      INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
      VALUES
        (958, 'Ibagué', '73001', 23, NULL),
        (959, 'Alpujarra', '73024', 23, NULL),
        (960, 'Alvarado', '73026', 23, NULL),
        (961, 'Ambalema', '73030', 23, NULL),
        (962, 'Anzoátegui', '73043', 23, NULL),
        (963, 'Armero', '73055', 23, NULL),
        (964, 'Ataco', '73067', 23, NULL),
        (965, 'Cajamarca', '73124', 23, NULL),
        (966, 'Carmen de Apicalá', '73148', 23, NULL),
        (967, 'Casabianca', '73152', 23, NULL),
        (968, 'Chaparral', '73168', 23, NULL),
        (969, 'Coello', '73200', 23, NULL),
        (970, 'Coyaima', '73217', 23, NULL),
        (971, 'Cunday', '73226', 23, NULL),
        (972, 'Dolores', '73236', 23, NULL),
        (973, 'Espinal', '73268', 23, NULL),
        (974, 'Falan', '73270', 23, NULL),
        (975, 'Flandes', '73275', 23, NULL),
        (976, 'Fresno', '73283', 23, NULL),
        (977, 'Guamo', '73319', 23, NULL),
        (978, 'Herveo', '73347', 23, NULL),
        (979, 'Honda', '73349', 23, NULL),
        (980, 'Icononzo', '73352', 23, NULL),
        (981, 'Lérida', '73408', 23, NULL),
        (982, 'Líbano', '73411', 23, NULL),
        (983, 'San Sebastián de Mariquita', '73443', 23, NULL),
        (984, 'Melgar', '73449', 23, NULL),
        (985, 'Murillo', '73461', 23, NULL),
        (986, 'Natagaima', '73483', 23, NULL),
        (987, 'Ortega', '73504', 23, NULL),
        (988, 'Palocabildo', '73520', 23, NULL),
        (989, 'Piedras', '73547', 23, NULL),
        (990, 'Planadas', '73555', 23, NULL),
        (991, 'Prado', '73563', 23, NULL),
        (992, 'Purificación', '73585', 23, NULL),
        (993, 'Rioblanco', '73616', 23, NULL),
        (994, 'Roncesvalles', '73622', 23, NULL),
        (995, 'Rovira', '73624', 23, NULL),
        (996, 'Saldaña', '73671', 23, NULL),
        (997, 'San Antonio', '73675', 23, NULL),
        (998, 'San Luis', '73678', 23, NULL),
        (999, 'Santa Isabel', '73686', 23, NULL),
        (1000, 'Suárez', '73770', 23, NULL),
        (1001, 'Valle de San Juan', '73854', 23, NULL),
        (1002, 'Venadillo', '73861', 23, NULL),
        (1003, 'Villahermosa', '73870', 23, NULL),
        (1004, 'Villarrica', '73873', 23, NULL)
      ON CONFLICT (id) DO NOTHING;
    """),
    text("UPDATE municipios SET nombre = INITCAP(nombre);"),
    text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
  ]

  await run_sql_statements(sql_statements)


async def seed_ciudades_valle_del_cauca(run_sql_statements):
    from sqlalchemy import text

    # Valle del Cauca = id 24 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1005, 'Santiago de Cali', '76001', 24, NULL),
              (1006, 'Alcalá', '76020', 24, NULL),
              (1007, 'Andalucía', '76036', 24, NULL),
              (1008, 'Ansermanuevo', '76041', 24, NULL),
              (1009, 'Argelia', '76054', 24, NULL),
              (1010, 'Bolívar', '76100', 24, NULL),
              (1011, 'Buenaventura', '76109', 24, NULL),
              (1012, 'Guadalajara de Buga', '76111', 24, NULL),
              (1013, 'Bugalagrande', '76113', 24, NULL),
              (1014, 'Caicedonia', '76122', 24, NULL),
              (1015, 'Calima', '76126', 24, NULL),
              (1016, 'Candelaria', '76130', 24, NULL),
              (1017, 'Cartago', '76147', 24, NULL),
              (1018, 'Dagua', '76233', 24, NULL),
              (1019, 'El Águila', '76243', 24, NULL),
              (1020, 'El Cairo', '76246', 24, NULL),
              (1021, 'El Cerrito', '76248', 24, NULL),
              (1022, 'El Dovio', '76250', 24, NULL),
              (1023, 'Florida', '76275', 24, NULL),
              (1024, 'Ginebra', '76306', 24, NULL),
              (1025, 'Guacarí', '76318', 24, NULL),
              (1026, 'Jamundí', '76364', 24, NULL),
              (1027, 'La Cumbre', '76377', 24, NULL),
              (1028, 'La Unión', '76400', 24, NULL),
              (1029, 'La Victoria', '76403', 24, NULL),
              (1030, 'Obando', '76497', 24, NULL),
              (1031, 'Palmira', '76520', 24, NULL),
              (1032, 'Pradera', '76563', 24, NULL),
              (1033, 'Restrepo', '76606', 24, NULL),
              (1034, 'Riofrío', '76616', 24, NULL),
              (1035, 'Roldanillo', '76622', 24, NULL),
              (1036, 'San Pedro', '76670', 24, NULL),
              (1037, 'Sevilla', '76736', 24, NULL),
              (1038, 'Toro', '76823', 24, NULL),
              (1039, 'Trujillo', '76828', 24, NULL),
              (1040, 'Tuluá', '76834', 24, NULL),
              (1041, 'Ulloa', '76845', 24, NULL),
              (1042, 'Versalles', '76863', 24, NULL),
              (1043, 'Vijes', '76869', 24, NULL),
              (1044, 'Yotoco', '76890', 24, NULL),
              (1045, 'Yumbo', '76892', 24, NULL),
              (1046, 'Zarzal', '76895', 24, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_arauca(run_sql_statements):
    from sqlalchemy import text

    # Arauca = id 25 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1047, 'Arauca', '81001', 25, NULL),
              (1048, 'Arauquita', '81065', 25, NULL),
              (1049, 'Cravo Norte', '81220', 25, NULL),
              (1050, 'Fortul', '81300', 25, NULL),
              (1051, 'Puerto Rondón', '81591', 25, NULL),
              (1052, 'Saravena', '81736', 25, NULL),
              (1053, 'Tame', '81794', 25, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_casanare(run_sql_statements):
    from sqlalchemy import text

    # Casanare = id 26 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1054, 'Yopal', '85001', 26, NULL),
              (1055, 'Aguazul', '85010', 26, NULL),
              (1056, 'Chámeza', '85015', 26, NULL),
              (1057, 'Hato Corozal', '85125', 26, NULL),
              (1058, 'La Salina', '85136', 26, NULL),
              (1059, 'Maní', '85139', 26, NULL),
              (1060, 'Monterrey', '85162', 26, NULL),
              (1061, 'Nunchía', '85225', 26, NULL),
              (1062, 'Orocué', '85230', 26, NULL),
              (1063, 'Paz de Ariporo', '85250', 26, NULL),
              (1064, 'Pore', '85263', 26, NULL),
              (1065, 'Recetor', '85279', 26, NULL),
              (1066, 'Sabanalarga', '85300', 26, NULL),
              (1067, 'Sácama', '85315', 26, NULL),
              (1068, 'San Luis de Palenque', '85325', 26, NULL),
              (1069, 'Támara', '85400', 26, NULL),
              (1070, 'Tauramena', '85410', 26, NULL),
              (1071, 'Trinidad', '85430', 26, NULL),
              (1072, 'Villanueva', '85440', 26, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_putumayo(run_sql_statements):
    from sqlalchemy import text

    # Putumayo = id 27 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1073, 'Mocoa', '86001', 27, NULL),
              (1074, 'Colón', '86219', 27, NULL),
              (1075, 'Orito', '86320', 27, NULL),
              (1076, 'Puerto Asís', '86568', 27, NULL),
              (1077, 'Puerto Caicedo', '86569', 27, NULL),
              (1078, 'Puerto Guzmán', '86571', 27, NULL),
              (1079, 'Puerto Leguízamo', '86573', 27, NULL),
              (1080, 'Sibundoy', '86749', 27, NULL),
              (1081, 'San Francisco', '86755', 27, NULL),
              (1082, 'San Miguel', '86757', 27, NULL),
              (1083, 'Santiago', '86760', 27, NULL),
              (1084, 'Valle del Guamuez', '86865', 27, NULL),
              (1085, 'Villagarzón', '86885', 27, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_san_andres_providencia(run_sql_statements):
    from sqlalchemy import text

    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1086, 'San Andrés', '88001', 28, NULL),
              (1087, 'Providencia', '88564', 28, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_amazonas(run_sql_statements):
    from sqlalchemy import text

    # Amazonas = id 29 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1088, 'Leticia', '91001', 29, NULL),
              (1089, 'El Encanto', '91263', 29, NULL),
              (1090, 'La Chorrera', '91405', 29, NULL),
              (1091, 'La Pedrera', '91407', 29, NULL),
              (1092, 'La Victoria', '91430', 29, NULL),
              (1093, 'Mirití - Paraná', '91460', 29, NULL),
              (1094, 'Puerto Alegría', '91530', 29, NULL),
              (1095, 'Puerto Arica', '91536', 29, NULL),
              (1096, 'Puerto Nariño', '91540', 29, NULL),
              (1097, 'Puerto Santander', '91669', 29, NULL),
              (1098, 'Tarapacá', '91798', 29, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)


async def seed_ciudades_guainia(run_sql_statements):
  from sqlalchemy import text

  # Guainía = id 30 en tu tabla `departamento` (según tu departamentos.py)
  sql_statements = [
    text("""
      INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
      VALUES
        (1099, 'Inírida', '94001', 30, NULL),
        (1100, 'Barrancominas', '94343', 30, NULL),
        (1101, 'San Felipe', '94883', 30, NULL),
        (1102, 'Puerto Colombia', '94884', 30, NULL),
        (1103, 'La Guadalupe', '94885', 30, NULL),
        (1104, 'Cacahual', '94886', 30, NULL),
        (1105, 'Pana Pana', '94887', 30, NULL),
        (1106, 'Morichal', '94888', 30, NULL)
      ON CONFLICT (id) DO NOTHING;
    """),
    text("UPDATE municipios SET nombre = INITCAP(nombre);"),
    text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
  ]

  await run_sql_statements(sql_statements)

async def seed_ciudades_guaviare(run_sql_statements):
    from sqlalchemy import text

    # Guaviare = id 31 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1107, 'San José del Guaviare', '95001', 31, NULL),
              (1108, 'Calamar', '95015', 31, NULL),
              (1109, 'El Retorno', '95025', 31, NULL),
              (1110, 'Miraflores', '95200', 31, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_vaupes(run_sql_statements):
    from sqlalchemy import text

    # Vaupés = id 32 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1111, 'Mitú', '97001', 32, NULL),
              (1112, 'Carurú', '97161', 32, NULL),
              (1113, 'Pacoa', '97511', 32, NULL),
              (1114, 'Taraira', '97666', 32, NULL),
              (1115, 'Papunahua', '97777', 32, NULL),
              (1116, 'Yavaraté', '97889', 32, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

async def seed_ciudades_vichada(run_sql_statements):
    from sqlalchemy import text

    # Vichada = id 33 en tu tabla `departamento`
    sql_statements = [
        text("""
            INSERT INTO municipios
              (id, nombre, codigo_iso, id_departamento, deleted_at)
            VALUES
              (1117, 'Puerto Carreño', '99001', 33, NULL),
              (1118, 'La Primavera', '99524', 33, NULL),
              (1119, 'Santa Rosalía', '99624', 33, NULL),
              (1120, 'Cumaribo', '99773', 33, NULL)
            ON CONFLICT (id) DO NOTHING;
        """),
        text("UPDATE municipios SET nombre = INITCAP(nombre);"),
        text("SELECT setval('municipios_id_seq', COALESCE((SELECT MAX(id) FROM municipios), 1), true);"),
    ]

    await run_sql_statements(sql_statements)

# Función principal que ejecuta todas las ciudades por departamento
async def seed_municipios(run_sql_statements):
    """
    Ejecuta el seed de todos los municipios de Colombia por departamento.
    """
    await seed_ciudades_antioquia(run_sql_statements)
    await seed_ciudades_atlantico(run_sql_statements)
    await seed_ciudades_bogota(run_sql_statements)
    await seed_ciudades_bolivar(run_sql_statements)
    await seed_ciudades_boyaca(run_sql_statements)
    await seed_ciudades_caldas(run_sql_statements)
    await seed_ciudades_caqueta(run_sql_statements)
    await seed_ciudades_cauca(run_sql_statements)
    await seed_ciudades_cesar(run_sql_statements)
    await seed_ciudades_cordoba(run_sql_statements)
    await seed_ciudades_cundinamarca(run_sql_statements)
    await seed_ciudades_choco(run_sql_statements)
    await seed_ciudades_huila(run_sql_statements)
    await seed_ciudades_la_guajira(run_sql_statements)
    await seed_ciudades_magdalena(run_sql_statements)
    await seed_ciudades_meta(run_sql_statements)
    await seed_ciudades_narino(run_sql_statements)
    await seed_ciudades_norte_de_santander(run_sql_statements)
    await seed_ciudades_quindio(run_sql_statements)
    await seed_ciudades_risaralda(run_sql_statements)
    await seed_ciudades_santander(run_sql_statements)
    await seed_ciudades_sucre(run_sql_statements)
    await seed_ciudades_tolima(run_sql_statements)
    await seed_ciudades_valle_del_cauca(run_sql_statements)
    await seed_ciudades_arauca(run_sql_statements)
    await seed_ciudades_casanare(run_sql_statements)
    await seed_ciudades_putumayo(run_sql_statements)
    await seed_ciudades_san_andres_providencia(run_sql_statements)
    await seed_ciudades_amazonas(run_sql_statements)
    await seed_ciudades_guainia(run_sql_statements)
    await seed_ciudades_guaviare(run_sql_statements)
    await seed_ciudades_vaupes(run_sql_statements)
    await seed_ciudades_vichada(run_sql_statements)


