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

### DELETE `/empresas/{empresa_id}` - Eliminar Empresa ⚠️ Requiere `modificar_empresas`
Soft delete (marca deleted_at)
```
Response: { "message": "Empresa desactivada correctamente" }
```

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

### PUT `/marketplace/{id_marketplace}` - Editar Producto ⚠️ Requiere `modificar_marketplace`
```
Response: { producto...actualizado }
```

### DELETE `/marketplace/{id_marketplace}` - Eliminar Producto ⚠️ Requiere `modificar_marketplace`
```
Response: { "detail": "Marketplace item deactivated" }
```

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

### PUT `/mensajes/{mensaje_id}` - Editar Mensaje ⚠️ Requiere `modificar_mensajes`
```
Response: { mensaje...actualizado }
```

### DELETE `/mensajes/{mensaje_id}` - Eliminar Mensaje
```
Response: { "detail": "Mensaje desactivado" }
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

1. **Upload de Imágenes**: Agregar endpoints para subir fotos (empresas, marketplace, publicidades)
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

---

**Última actualización:** 9 de abril de 2026
**Versión:** 1.0
