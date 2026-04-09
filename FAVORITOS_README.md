# 🎁 Sistema de Favoritos (Wishlist) - DIRECTORIO 2.0

## 📋 Descripción

El sistema de favoritos permite a los usuarios autenticados guardar productos/servicios del marketplace en una lista de deseos (wishlist) para consultarlos después sin tener que buscarlos nuevamente.

## 🗄️ Estructura de Datos

### Tabla: `usuarios_favoritos`

```sql
CREATE TABLE usuarios_favoritos (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_usuario INTEGER NOT NULL,
    id_marketplace INTEGER NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_marketplace) REFERENCES marketplaces(id) ON DELETE CASCADE,
    UNIQUE KEY (id_usuario, id_marketplace)
);
```

### Índices
- Primary Key: `id`
- Unique Constraint: `(id_usuario, id_marketplace)` - Evita duplicados
- Índices: `id_usuario`, `id_marketplace` - Para búsquedas rápidas

## 🔌 API Endpoints

### 1. Listar mis Favoritos
```http
GET /api/favoritos/usuario/
Authorization: Bearer {token}
Query: ?skip=0&limit=50
```

**Response:**
```json
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
      "categoria": {
        "id": 1,
        "nombre": "Tecnología"
      },
      "empresa": {
        "id": 1,
        "nombre": "Acme Corp"
      },
      "estado": {
        "id": 1,
        "nombre": "ACTIVO"
      }
    }
  }
]
```

### 2. Contar Favoritos
```http
GET /api/favoritos/usuario/contar/
Authorization: Bearer {token}
```

**Response:**
```json
{
  "cantidad": 5
}
```

### 3. Verificar si está en Favoritos
```http
GET /api/favoritos/usuario/verificar/{id_marketplace}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "en_favoritos": true
}
```

### 4. Agregar a Favoritos
```http
POST /api/favoritos/?id_marketplace=5
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "id_usuario": 1,
  "id_marketplace": 5,
  "fecha_agregado": "2026-04-09T14:30:00"
}
```

**Errores:**
- 404: Producto no encontrado
- 400: Producto ya está en favoritos

### 5. Eliminar de Favoritos
```http
DELETE /api/favoritos/{id_marketplace}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Producto eliminado de favoritos"
}
```

### 6. Listar todos los Favoritos (Admin)
```http
GET /api/favoritos/
Authorization: Bearer {token}
Query: ?skip=0&limit=50
```

Requiere permiso: `VER_REGISTROS_ELIMINADOS`

## 🔐 Seguridad

- ✅ **Autenticación requerida**: Solo usuarios autenticados pueden usar favoritos
- ✅ **Isolamiento de datos**: Cada usuario solo ve sus propios favoritos
- ✅ **Soft delete**: Los favoritos eliminados se marcan, no se borran
- ✅ **Validación**: Verifica que el producto existe y no está eliminado
- ✅ **Integridad referencial**: Al eliminar un usuario o producto, se eliminan sus favoritos

## 📝 Archivos Involucrados

### Backend
- `api/models/models.py` - Modelo `UsuarioFavorito`
- `api/schemas/schemas.py` - Esquemas para request/response
- `api/api/favoritos.py` - Endpoints REST
- `api/main.py` - Registro del router
- `alembic/versions/d4e8f6c2a1b3_add_usuarios_favoritos.py` - Migración

### Documentación
- `ENDPOINTS_FRONTEND.md` - Documentación de endpoints
- `ANALISIS_SERVICIOS.md` - Análisis de servicios
- `FAVORITOS_README.md` - Este archivo

## 🚀 Cómo Usar

### 1. Ejecutar Migración
```bash
alembic upgrade head
```

### 2. En Frontend - Agregar a Favoritos
```javascript
async function agregarFavorito(idMarketplace) {
  const response = await fetch(`/api/favoritos/?id_marketplace=${idMarketplace}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.detail);
    return;
  }
  
  const favorito = await response.json();
  console.log('Agregado a favoritos:', favorito);
}
```

### 3. En Frontend - Verificar si está en Favoritos
```javascript
async function verificarFavorito(idMarketplace) {
  const response = await fetch(`/api/favoritos/usuario/verificar/${idMarketplace}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.en_favoritos;
}
```

### 4. En Frontend - Listar mis Favoritos
```javascript
async function obtenerMisFavoritos() {
  const response = await fetch('/api/favoritos/usuario/?skip=0&limit=50', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const favoritos = await response.json();
  console.log('Mis favoritos:', favoritos);
  return favoritos;
}
```

### 5. En Frontend - Eliminar de Favoritos
```javascript
async function eliminarFavorito(idMarketplace) {
  const response = await fetch(`/api/favoritos/${idMarketplace}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.detail);
    return;
  }
  
  console.log('Eliminado de favoritos');
}
```

## 📊 Relaciones en el Modelo

```
Usuario (1) ---- (*) UsuarioFavorito ---- (1) Marketplace
  id                    id_usuario           id
                        id_marketplace
                        fecha_agregado
                        deleted_at
```

## 💡 Casos de Uso

1. **Usuario guarda un producto**: Agrega a favoritos para comparar precios después
2. **Usuario compara productos**: Abre su lista de favoritos para ver múltiples opciones
3. **Usuario recuerda un producto**: Busca en sus favoritos en lugar de volver a buscar
4. **Usuario deja de estar interesado**: Elimina de favoritos
5. **Admin revisa favoritos populares**: Identifica productos más guardados

## 🔄 Próximas Mejoras

- [ ] Sincronizar favoritos entre dispositivos
- [ ] Notificaciones cuando el producto tiene precio bajado
- [ ] Compartir favoritos con otros usuarios
- [ ] Favoritos públicos (crear colecciones favoritas públicas)
- [ ] Historial de cambios en favoritos

## 📞 Soporte

Para reportar issues o sugerencias sobre el sistema de favoritos, contactar al equipo de desarrollo.

---

**Creado:** 9 de abril de 2026
**Última actualización:** 9 de abril de 2026
**Versión:** 1.0
