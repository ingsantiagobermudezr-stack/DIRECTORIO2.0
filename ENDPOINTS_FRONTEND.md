# 📚 ENDPOINTS DEL FRONTEND - DIRECTORIO 2.0

## 🎯 RESUMEN DE SERVICIOS

Este documento describe los endpoints disponibles para el frontend, organizados por flujo de usuario.

---

## 🔐 AUTENTICACIÓN

### POST `/signin` - Login
LOGIN con correo y contraseña
```json
Request:
{
  "username": "correo@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ...",
  "rol": "admin|usuario|empresa",
  "id_usuario": 1,
  "id_rol": 1,
  "permisos": ["crear_empresa", "ver_registros_eliminados"]
}
```

### POST `/signup` - Registro
Registrar nuevo usuario
```json
Request:
{
  "nombre": "Juan",
  "apellido": "Perez",
  "correo": "juan@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ...",
  "rol": "usuario",
  "id_usuario": 1,
  "permisos": []
}
```

### GET `/me/permisos` - Mis Permisos
Obtener permisos del usuario actual (requiere autenticación)
```json
Response:
{
  "permisos": ["crear_empresa", "modificar_empresas"]
}
```

Regla de administración (actual):
- Un usuario se considera admin solo si tiene rol `admin` y además el permiso crítico `modificar_roles`.
- No existe dependencia por `id` hardcodeado.

---

## 🌍 DATOS GEOGRÁFICOS (Sin autenticación requerida)

### GET `/paises` - Lista de Países
Listar todos los países
```
Query: ?skip=0&limit=50

Response:
[
  {
    "id": 1,
    "nombre": "Colombia",
    "codigo_iso": "CO"
  }
]
```

### GET `/departamentos` - Lista de Departamentos
Listar departamentos por país
```
Query: ?id_pais={id}&skip=0&limit=100

Response:
[
  {
    "id": 1,
    "nombre": "Bogotá D.C.",
    "id_pais": 1
  }
]
```

### GET `/municipios` - Lista de Municipios
Listar municipios por departamento
```
Query: ?id_departamento={id}&skip=0&limit=200

Response:
[
  {
    "id": 1,
    "nombre": "Bogotá",
    "codigo_iso": "05001",
    "id_departamento": 1
  }
]
```

---

## 🏷️ CATEGORÍAS (Sin autenticación requerida)

### GET `/categorias` - Lista de Categorías
```
Query: ?skip=0&limit=50

Response:
[
  {
    "id": 1,
    "nombre": "Tecnología",
    "descripcion": "Productos y servicios tecnológicos"
  }
]
```

### GET `/categorias/{categoria_id}` - Detalles de Categoría
```
Response:
{
  "id": 1,
  "nombre": "Tecnología",
  "descripcion": "Productos y servicios tecnológicos"
}
```

---

## 🏢 EMPRESAS

### GET `/empresas/` - Lista de Empresas con Filtros
```
Query:
  ?skip=0
  &limit=50
  &nombre=Acme
  &id_categoria=1
  &id_municipio=1
  &rating_min=3.5
  &search=acme
  &ordenar=nombre|rating

Response:
[
  {
    "id": 1,
    "nombre": "Acme Corp",
    "nit": "123456789",
    "correo": "info@acme.com",
    "direccion": "Cra 7 #45-51",
    "logo_url": "https://...",
    "categoria": { "id": 1, "nombre": "Tecnología" },
    "municipio": { "id": 1, "nombre": "Bogotá" }
  }
]
```

### GET `/empresas/{empresa_id}` - Detalles de Empresa
```
Response:
{
  "id": 1,
  "nombre": "Acme Corp",
  "nit": "123456789",
  "correo": "info@acme.com",
  "direccion": "Cra 7 #45-51",
  "telefono": "3101234567",
  "logo_url": "https://...",
  "categoria": { "id": 1, "nombre": "Tecnología" },
  "municipio": { "id": 1, "nombre": "Bogotá" }
}
```

### GET `/empresas/usuario/mis-empresas` - Mis Empresas (autenticado)
Obtener empresas creadas por el usuario actual
```
Query: ?skip=0&limit=50

Response: [{ empresa... }]
```

### POST `/empresas/` - Crear Empresa ⚠️ Requiere `crear_empresa`
```json
Request:
{
  "nombre": "Nueva Corp",
  "nit": "987654321",
  "correo": "info@nueva.com",
  "direccion": "Cra 9 #50-60",
  "telefono": "3107654321",
  "id_categoria": 1,
  "id_municipio": 1,
  "logo_url": "https://..."
}

Response:
{
  "id": 2,
  "success": true
}
```

### PUT `/empresas/{empresa_id}` - Editar Empresa ⚠️ Requiere `modificar_empresas`
```
Request: { ...campos a actualizar }
Response: { empresa...actualizada }
```

Regla de ownership:
- Solo el creador de la empresa o admin puede editarla.

### POST `/empresas/{empresa_id}/logo/upload` - Subir Logo ⚠️ Requiere `modificar_empresas`
Subir logo de empresa (multipart/form-data)
```
Body: archivo=<imagen.jpg|png|webp> (máx 5MB)

Response:
{
  "message": "Logo subido correctamente",
  "empresa_id": 1,
  "logo_url": "/uploads/empresas/abc123.webp"
}
```

Regla de ownership:
- Solo el creador de la empresa o admin puede actualizar el logo.

### DELETE `/empresas/{empresa_id}` - Eliminar Empresa ⚠️ Requiere `modificar_empresas`
Soft delete (marca deleted_at)
```
Response: { "message": "Empresa desactivada correctamente" }
```

Regla de ownership:
- Solo el creador de la empresa o admin puede eliminarla.

---

## 🛍️ MARKETPLACE

### GET `/marketplace` - Lista de Productos con Filtros
```
Query:
  ?skip=0
  &limit=50
  &id_categoria=1
  &id_empresa=1
  &precio_min=0
  &precio_max=1000000
  &id_estado=1
  &search=laptop
  &ordenar=fecha_publicacion|precio|nombre

Response:
[
  {
    "id": 1,
    "nombre": "Laptop Dell",
    "descripcion": "Laptop de 15 pulgadas",
    "precio": 2500000,
    "stock": 10,
    "fecha_publicacion": "2026-04-09T10:30:00",
    "categoria": { "id": 1, "nombre": "Tecnología" },
    "empresa": { "id": 1, "nombre": "Acme Corp" },
    "estado": { "id": 1, "nombre": "ACTIVO" }
  }
]
```

### GET `/marketplace/{id_marketplace}` - Detalles de Producto
```
Response: { producto...completo con relaciones }
```

Tracking automático:
- Cada consulta registra una `vista` del producto para métricas de funnel.

### POST `/marketplace/{id_marketplace}/click` - Registrar Click de Producto
Registrar evento explícito de click/interés para funnel comercial.
```
Response:
{
  "message": "Click registrado",
  "id_marketplace": 5
}
```

### GET `/marketplace/usuario/mis-productos` - Mis Productos (autenticado)
Obtener productos de empresas del usuario
```
Query: ?skip=0&limit=50
Response: [{ producto... }]
```

### POST `/marketplace` - Crear Producto ⚠️ Requiere `crear_marketplace`
```json
Request:
{
  "nombre": "iPhone 15",
  "descripcion": "Teléfono celular",
  "precio": 4500000,
  "stock": 5,
  "id_empresa": 1,
  "id_categoria": 1,
  "id_estado": 1
}

Response: { producto...creado }
```

Reglas de integridad:
- `stock < 0` => `400 Bad Request`
- Si `stock = 0`, el backend fuerza `id_estado` a `SIN STOCK` o `INACTIVO` (si existe en catálogo).

Regla de ownership:
- Solo el propietario de la empresa (o admin) puede crear productos para esa empresa.

### PUT `/marketplace/{id_marketplace}` - Editar Producto ⚠️ Requiere `modificar_marketplace`
```
Response: { producto...actualizado }
```

Reglas de integridad:
- `stock < 0` => `400 Bad Request`
- Si `stock = 0`, el backend fuerza `id_estado` a `SIN STOCK` o `INACTIVO`.
- Si el producto está eliminado (`deleted_at`), no permite editar `precio` ni `stock` (`409 Conflict`).
- Si cambia `precio`, se generan notificaciones automáticas para usuarios que tengan el producto en favoritos.

Regla de ownership:
- Solo el propietario de la empresa del producto (o admin) puede editar.

### POST `/marketplace/{id_marketplace}/imagenes/upload` - Subir Imágenes ⚠️ Requiere `modificar_marketplace`
Subir una o múltiples imágenes de producto (multipart/form-data)
```
Body: archivos[]=<imagen1.jpg>, archivos[]=<imagen2.png> (máx 5MB por archivo)

Response:
{
  "message": "Imágenes subidas correctamente",
  "id_marketplace": 5,
  "imagenes": [
    "/uploads/marketplace/a1b2c3.jpg",
    "/uploads/marketplace/d4e5f6.png"
  ]
}
```

Regla de ownership:
- Solo el propietario de la empresa del producto (o admin) puede subir imágenes.

### DELETE `/marketplace/{id_marketplace}` - Eliminar Producto ⚠️ Requiere `modificar_marketplace`
```
Response: { "detail": "Marketplace item deactivated" }
```

Regla de ownership:
- Solo el propietario de la empresa del producto (o admin) puede eliminar.

---

## ⭐ RESEÑAS (Reviews)

### GET `/reviews/` - Lista de Reseñas
```
Query: ?skip=0&limit=50
Response: [{ reseña... }]
```

### GET `/reviews/{id_empresa}` - Reseñas de una Empresa
```
Response:
[
  {
    "id": 1,
    "id_empresa": 1,
    "id_usuario": 2,
    "comentario": "Excelente servicio",
    "calificacion": 5,
    "fecha": "2026-04-09T10:30:00",
    "usuario": { "id": 2, "nombre": "Pedro", "apellido": "Gómez" }
  }
]
```

### POST `/reviews/` - Crear Reseña ⚠️ Requiere `crear_reviews`
```json
Request:
{
  "id_empresa": 1,
  "id_usuario": 2,
  "comentario": "Muy buena calidad",
  "calificacion": 4.5
}

Response: { reseña...creada }
```

Evento automático:
- Crea notificación `new_review` para el creador de la empresa (si no es el mismo usuario que reseña).

### PUT `/reviews/{review_id}` - Editar Reseña ⚠️ Requiere `modificar_reviews`
```
Response: { reseña...actualizada }
```

### DELETE `/reviews/{review_id}` - Eliminar Reseña
```
Response: { "message": "Review desactivada correctamente" }
```

---

## 💬 MENSAJES (Chat)

### GET `/mensajes/` - Lista de Mensajes
```
Query: ?skip=0&limit=50&id_marketplace={id}
Response: [{ mensaje... }]
```

### GET `/mensajes/{mensaje_id}` - Detalles de Mensaje
```
Response:
{
  "id": 1,
  "id_marketplace": 1,
  "id_usuario_creador_chat": 1,
  "id_usuario_enviador_mensaje": 2,
  "mensaje": "¿Dónde está ubicado?",
  "fecha_hora": "2026-04-09T14:30:00"
}
```

### POST `/mensajes/` - Crear Mensaje ⚠️ Requiere `crear_mensajes`
```json
Request:
{
  "id_marketplace": 1,
  "id_usuario_creador_chat": 1,
  "id_usuario_enviador_mensaje": 2,
  "mensaje": "¿Cuál es el precio?"
}

Response: { mensaje...creado }
```

Regla de ownership:
- Solo el usuario autenticado (o admin) puede enviar mensajes con su propio `id_usuario_enviador_mensaje`.

Evento automático:
- Crea notificación `new_message` para el vendedor propietario de la empresa del producto.

### PUT `/mensajes/{mensaje_id}` - Editar Mensaje ⚠️ Requiere `modificar_mensajes`
```
Response: { mensaje...actualizado }
```

Regla de ownership:
- Solo el autor del mensaje (o admin) puede editar.
- El autor no puede cambiar `id_marketplace`, `id_usuario_creador_chat` ni `id_usuario_enviador_mensaje`.

### DELETE `/mensajes/{mensaje_id}` - Eliminar Mensaje
```
Response: { "detail": "Mensaje desactivado" }
```

Regla de ownership:
- Solo el autor del mensaje (o admin) puede eliminar.

### POST `/archivos-mensajes/upload` - Subir Archivo de Mensaje
Subir imagen asociada a un mensaje (multipart/form-data)
```
Body: id_mensaje=1, archivo=<imagen.jpg|png|webp> (máx 5MB)

Response:
{
  "id": 10,
  "id_mensaje": 1,
  "url_imagen": "/uploads/mensajes/abc123.jpg"
}
```

Regla de ownership:
- Solo participantes del chat (creador o remitente del mensaje) o admin pueden adjuntar/editar/eliminar/restaurar archivos del mensaje.

### POST `/comprobantes/registrar-desde-archivo` - Registrar Comprobante con Archivo
Sube archivo del comprobante y crea el comprobante en una sola operación
```
Body (multipart/form-data):
  id_mensaje=1
  id_empleado_evaluador=2
  recibo_valido=true
  cantidad_recibida=120000
  archivo=<imagen.jpg|png|webp> (máx 5MB)

Response:
{
  "message": "Comprobante registrado correctamente",
  "comprobante": {
    "id": 3,
    "id_archivo": 10,
    "id_empleado_evaluador": 2,
    "recibo_valido": true,
    "cantidad_recibida": 120000
  },
  "archivo": {
    "id": 10,
    "id_mensaje": 1,
    "url_imagen": "/uploads/comprobantes/def456.jpg"
  }
}
```

### POST `/comprobantes/{comprobante_id}/aprobar` - Aprobar Comprobante
Solo el evaluador asignado o admin puede cambiar estado final
```
Response:
{
  "message": "Comprobante aprobado",
  "id": 3,
  "estado": "aprobado"
}
```

Evento automático:
- Crea notificación `comprobante_aprobado` para usuarios involucrados en el chat asociado.

### POST `/comprobantes/{comprobante_id}/rechazar` - Rechazar Comprobante
Solo el evaluador asignado o admin puede cambiar estado final
```
Response:
{
  "message": "Comprobante rechazado",
  "id": 3,
  "estado": "rechazado"
}
```

Evento automático:
- Crea notificación `comprobante_rechazado` para usuarios involucrados en el chat asociado.

---

## 📈 REPORTES OPERATIVOS (Panel Negocio)

### GET `/reportes/transacciones/resumen` - Ventas estimadas y validez
```
Query:
  ?desde=2026-04-01T00:00:00
  &hasta=2026-04-30T23:59:59
  &id_empresa=1

Response:
{
  "filtros": {
    "desde": "2026-04-01T00:00:00",
    "hasta": "2026-04-30T23:59:59",
    "id_empresa": 1
  },
  "resumen_global": {
    "total_transacciones": 45,
    "monto_total_valido": 12350000,
    "tasa_validez_porcentaje": 82.22
  },
  "detalle_por_empresa": [
    {
      "id_empresa": 1,
      "empresa": "Acme Corp",
      "total_transacciones": 20,
      "monto_total_valido": 7000000,
      "tasa_validez_porcentaje": 85.0
    }
  ]
}
```

### GET `/reportes/comprobantes/tasa-aprobacion-evaluadores` - Eficiencia por evaluador
```
Query: ?desde=&hasta=&limit=20

Response:
{
  "items": [
    {
      "id_evaluador": 2,
      "evaluador": "Laura Gómez",
      "total_comprobantes": 30,
      "aprobados": 24,
      "rechazados": 4,
      "pendientes": 2,
      "tasa_aprobacion_porcentaje": 80.0
    }
  ]
}
```

### GET `/reportes/marketplace/top-productos-chats` - Top productos con más chats iniciados
```
Query: ?desde=&hasta=&limit=10

Response:
{
  "items": [
    {
      "id_marketplace": 5,
      "producto": "Laptop Dell",
      "id_empresa": 1,
      "empresa": "Acme Corp",
      "chats_iniciados": 17,
      "total_mensajes": 63
    }
  ]
}
```

### GET `/reportes/empresas/top-rating-reviews` - Top empresas por rating y volumen
```
Query: ?desde=&hasta=&limit=10

Response:
{
  "items": [
    {
      "id_empresa": 1,
      "empresa": "Acme Corp",
      "rating_promedio": 4.75,
      "total_reviews": 48
    }
  ]
}
```

### GET `/reportes/funnel` - Embudo comercial por período
```
Query: ?desde=&hasta=

Response:
{
  "filtros": {
    "desde": "2026-04-01T00:00:00",
    "hasta": "2026-04-30T23:59:59"
  },
  "metricas": {
    "busquedas": 1200,
    "productos_vistos": 840,
    "clics_producto": 310,
    "clics_productos_vistos": 1150,
    "chats_iniciados": 210,
    "comprobantes_registrados": 95,
    "comprobantes_validos": 72
  },
  "conversiones": {
    "busqueda_a_vista_porcentaje": 70.0,
    "vista_a_click_porcentaje": 36.9,
    "click_a_chat_porcentaje": 67.74,
    "busqueda_a_chat_porcentaje": 17.5,
    "chat_a_comprobante_porcentaje": 45.24,
    "comprobante_a_valido_porcentaje": 75.79,
    "busqueda_a_valido_porcentaje": 6.0
  }
}
```

Permisos:
- Requieren permiso `ver_reportes`.
- Por configuración actual del seed, este permiso está asignado al rol admin.

### GET `/comprobantes/{comprobante_id}/timeline` - Timeline de Transacción
Devuelve progreso compra/registro/validación para frontend
```
Response:
{
  "comprobante_id": 3,
  "estado_actual": "pendiente",
  "timeline": [
    {
      "paso": "compra_solicitada",
      "estado": "completado",
      "fecha": "2026-04-09T16:00:00",
      "descripcion": "El comprador inició conversación sobre el producto"
    },
    {
      "paso": "comprobante_registrado",
      "estado": "completado",
      "fecha": "2026-04-09T16:10:00",
      "descripcion": "Se cargó el comprobante y quedó pendiente de validación"
    },
    {
      "paso": "validacion_pago",
      "estado": "pendiente",
      "fecha": null,
      "descripcion": "Resultado final de la validación del comprobante"
    }
  ]
}
```

---

## 👤 USUARIOS (Mi Perfil)

### GET `/usuarios/{usuario_id}` - Detalles de Usuario
```
Response:
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Perez",
  "correo": "juan@example.com",
  "rol": "usuario",
  "id_rol": 2,
  "id_empresa": null
}
```

### PUT `/usuarios/{usuario_id}` - Editar Mi Perfil ⚠️ Requiere `modificar_usuarios`
```json
Request:
{
  "nombre": "Juan Carlos",
  "apellido": "Perez García",
  "correo": "juan@example.com"
}

Response: { usuario...actualizado }
```

---

## 📺 PUBLICIDADES

### GET `/publicidades/` - Lista de Publicidades
```
Query: ?skip=0&limit=20
Response: [{ publicidad... }]
```

### GET `/publicidades/{publicidad_id}` - Detalles Publicidad
```
Response:
{
  "id": 1,
  "id_empresa": 1,
  "id_tipo_anuncio": 1,
  "descripcion": "Promoción especial",
  "fecha_inicio": "2026-04-01T00:00:00",
  "fecha_fin": "2026-04-30T23:59:59"
}
```

### POST `/publicidades/` - Crear Publicidad ⚠️ Requiere `crear_publicidades`
```
Response: { publicidad...creada }
```

### PUT `/publicidades/{publicidad_id}` - Editar Publicidad ⚠️ Requiere `modificar_publicidades`
```
Response: { publicidad...actualizada }
```

### POST `/publicidades/{publicidad_id}/imagenes/upload` - Subir Imágenes ⚠️ Requiere `modificar_publicidades`
Subir una o múltiples imágenes de publicidad (multipart/form-data)
```
Body: archivos[]=<imagen1.jpg>, archivos[]=<imagen2.webp> (máx 5MB por archivo)

Response:
{
  "message": "Imágenes subidas correctamente",
  "id_publicidad": 3,
  "imagenes": [
    "/uploads/publicidades/abc111.jpg",
    "/uploads/publicidades/abc222.webp"
  ]
}
```

---

## 🔒 NOTAS DE SEGURIDAD

- ⚠️ Endpoints marcados requieren autenticación y permisos específicos
- El token de autenticación se recibe al hacer login/registro
- Se incluye en header: `Authorization: Bearer {token}`
- Los permisos se devuelven en la respuesta de login en el campo `permisos`
- Soft delete: Los registros se marcan como eliminados pero no se borran

---

## 📊 SERVICIOS BACKEND-ONLY (No usar en frontend)

Estos servicios están disponibles pero son solo para administración backend:

- `POST /admin/dashboard` - Dashboard administrativo
- `GET|POST|PUT|DELETE /roles` - Gestión de roles
- `GET|POST|PUT|DELETE /permisos` - Gestión de permisos
- `GET|POST|PUT|DELETE /comprobantes` - Gestión de comprobantes
- `GET|POST|PUT|DELETE /resultados` - Telemetría de búsquedas
- `GET|POST|PUT|DELETE /archivos-mensajes` - Gestión de archivos (manejar desde /mensajes)

---

## � FAVORITOS (Wishlist)

### GET `/favoritos/usuario/` - Mis Favoritos (autenticado)
Obtener lista de productos guardados en favoritos
```
Query: ?skip=0&limit=50

Response:
[
  {
    "id": 1,
    "id_usuario": 1,
    "id_marketplace": 5,
    "fecha_agregado": "2026-04-09T14:30:00",
    "marketplace": {
      "id": 5,
      "nombre": "MacBook Pro",
      "descripcion": "Laptop profesional",
      "precio": 4500000,
      "stock": 3,
      "fecha_publicacion": "2026-04-05T10:00:00",
      "categoria": { "id": 1, "nombre": "Tecnología" },
      "empresa": { "id": 1, "nombre": "Acme Corp" },
      "estado": { "id": 1, "nombre": "ACTIVO" }
    }
  }
]
```

### GET `/favoritos/usuario/contar/` - Contar Favoritos (autenticado)
```
Response:
{
  "cantidad": 5
}
```

### GET `/favoritos/usuario/verificar/{id_marketplace}` - Verificar si está en Favoritos (autenticado)
```
Response:
{
  "en_favoritos": true
}
```

### POST `/favoritos/` - Agregar a Favoritos (autenticado)
Agregar un producto a la lista de favoritos
```json
Request: ?id_marketplace=5

Response:
{
  "id": 1,
  "id_usuario": 1,
  "id_marketplace": 5,
  "fecha_agregado": "2026-04-09T14:30:00"
}
```

### DELETE `/favoritos/{id_marketplace}` - Eliminar de Favoritos (autenticado)
Eliminar un producto de favoritos
```
Response: { "message": "Producto eliminado de favoritos" }
```

---

## � BÚSQUEDA GLOBAL

### GET `/busqueda/global/` - Búsqueda Unificada
Buscar en empresas + marketplace con un solo query
```
Query:
  ?query=laptop (mínimo 2, máximo 100 caracteres)
  &skip=0
  &limit=50

Response:
{
  "query": "laptop",
  "total_empresas": 3,
  "total_productos": 12,
  "empresas": [
    {
      "id": 1,
      "nombre": "Acme Corp",
      "nit": "123456789",
      "correo": "info@acme.com",
      "direccion": "Cra 7 #45-51",
      "telefono": "3101234567",
      "logo_url": "https://...",
      "categoria": { "id": 1, "nombre": "Tecnología" },
      "municipio": { "id": 1, "nombre": "Bogotá" },
      "tipo": "empresa"
    }
  ],
  "productos": [
    {
      "id": 5,
      "nombre": "Laptop Dell XPS 15",
      "descripcion": "Laptop profesional de alta gama",
      "precio": 4500000,
      "stock": 3,
      "fecha_publicacion": "2026-04-05T10:00:00",
      "categoria": { "id": 1, "nombre": "Tecnología" },
      "empresa": { "id": 1, "nombre": "Acme Corp" },
      "estado": { "id": 1, "nombre": "ACTIVO" },
      "tipo": "producto"
    }
  ]
}
```

### GET `/busqueda/sugerencias/` - Autocompletar Búsqueda
Obtener sugerencias para autocompletar en barra de búsqueda
```
Query:
  ?query=lap (mínimo 1, máximo 50 caracteres)
  &limit=10

Response:
{
  "query": "lap",
  "sugerencias": [
    "Laptop Dell",
    "Laptop HP",
    "Laptop Apple",
    "Laptops Premium"
  ],
  "cantidad": 4
}
```

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. ✅ **Upload de Imágenes**: Endpoints implementados para empresas, marketplace y publicidades
2. ✅ **Filtro de Rating**: Filtrar empresas por calificación promedio (parámetro `rating_min`)
3. ✅ **Wishlist**: Agregar/eliminar favoritos (tabla `usuarios_favoritos` implementada)
4. ✅ **Búsqueda Global**: Endpoints `/busqueda/global/` y `/busqueda/sugerencias/` implementados
5. **Carrito de Compras**: Funcionalidad e-commerce básica
6. ✅ **Notificaciones**: Sistema de notificaciones en tiempo real (WebSocket) implementado

---

## 🔔 NOTIFICACIONES (Tiempo Real - WebSocket)

### GET `/notificaciones/usuario/` - Mis Notificaciones (autenticado)
Listar notificaciones del usuario autenticado
```
Query: ?skip=0&limit=50&leidas=true|false

Response:
[
  {
    "id": 1,
    "id_usuario_remitente": 2,
    "id_usuario_destinatario": 1,
    "tipo": "new_message",
    "contenido": "Tienes un nuevo mensaje sobre tu producto",
    "leido": false,
    "fecha_creacion": "2026-04-09T15:00:00"
  }
]
```

### GET `/notificaciones/usuario/sin-leer/` - Contar Sin Leer (autenticado)
```
Response:
{
  "sin_leer": 3
}
```

### GET `/notificaciones/usuario/contar/` - Contar Total Notificaciones (autenticado)
```
Query opcional: ?sin_leer=true

Response:
{
  "cantidad_total": 12
}

Si `sin_leer=true`:
{
  "cantidad_sin_leer": 3
}
```

### POST `/notificaciones/marcar-como-leida/{id_notificacion}` - Marcar Leída
```
Response:
{
  "message": "Notificación marcada como leída",
  "id": 1
}
```

### POST `/notificaciones/marcar-todas-como-leidas/` - Marcar Todas Leídas
```
Response:
{
  "message": "5 notificaciones marcadas como leídas"
}
```

### DELETE `/notificaciones/{id_notificacion}` - Eliminar Notificación
```
Response:
{
  "message": "Notificación eliminada"
}
```

### WebSocket `/ws/notificaciones/{usuario_id}` - Canal Tiempo Real
Conectar para recibir eventos de notificación instantáneamente.

Autenticación requerida (JWT):
- Opción 1 (query param): `ws://localhost:8000/api/ws/notificaciones/{usuario_id}?token={JWT}`
- Opción 2 (header): `Authorization: Bearer {JWT}`
- El `usuario_id` del path debe coincidir con el usuario autenticado en el token.
- Si el token es inválido o no coincide el usuario: cierre con código `1008`.

Eventos recibidos:
```json
{
  "tipo": "nueva_notificacion",
  "id": 10,
  "contenido": "Tu reseña recibió respuesta",
  "tipo_notificacion": "new_review",
  "fecha_creacion": "2026-04-09T15:05:00",
  "remitente_id": 3
}
```

Ping/Pong:
- Cliente envía: `ping`
- Servidor responde: `{ "tipo": "pong" }`

Tipos de notificación usados en negocio:
- `new_message`
- `new_review`
- `favorite_price_change`
- `comprobante_aprobado`
- `comprobante_rechazado`

---

## 🧩 NORMALIZACIÓN DE CATÁLOGOS (Estados y Eventos)

Para mantener compatibilidad durante transición, el backend guarda campos legacy y normalizados al mismo tiempo:

- Comprobantes:
  - legacy: `estado` (`pendiente|aprobado|rechazado`)
  - normalizado: `id_estado_flujo` (FK a catálogo `estados_flujo`)
- Eventos de marketplace:
  - legacy: `tipo_evento` (`vista|click` y otros tipos de negocio)
  - normalizado: `id_tipo_evento` (FK a catálogo `tipos_evento`)

Reportería/funnel ya usa la forma normalizada (`EstadoFlujo.clave`, `TipoEvento.clave`) para agregaciones.

Nota para frontend:
- Seguir consumiendo `estado` y `tipo_evento` en respuestas actuales.
- En fases siguientes puede migrarse visualización a catálogos (`id_estado_flujo`, `id_tipo_evento`) cuando se expongan endpoints dedicados.

---

## 📁 ARCHIVOS SUBIDOS (URLs públicas)

Los archivos cargados por endpoints de upload se sirven de forma estática bajo:

- `/uploads/empresas/...`
- `/uploads/marketplace/...`
- `/uploads/publicidades/...`
- `/uploads/mensajes/...`
- `/uploads/comprobantes/...`

---

**Última actualización:** 9 de abril de 2026
**Versión:** 1.1
