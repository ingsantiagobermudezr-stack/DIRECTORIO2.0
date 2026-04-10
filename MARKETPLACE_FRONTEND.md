# 🎨 PÁGINAS AMARILLAS MARKETPLACE - Frontend React + FastAPI

## 📋 Resumen del Proyecto

Se ha creado un marketplace estilo Mercado Libre con tema amarillo, completamente conectado al backend FastAPI. La aplicación permite:

- ✅ Navegar sin iniciar sesión (ver productos, empresas, detalles)
- ✅ Interactuar al iniciar sesión (chats, favoritos, reseñas)
- ✅ Vista previa de empresas y productos
- ✅ Sistema de mensajería entre compradores y vendedores

---

## 🆕 Nuevas Páginas Creadas

### 1. **HomePage** (`/`)
**Ubicación:** `src/pages/HomePage.jsx`

**Características:**
- Hero section con barra de búsqueda grande
- Productos destacados (grid de 6 columnas)
- Empresas destacadas (grid de 4 columnas)
- Top empresas mejor valoradas con rating
- Call-to-action para registrar empresas
- Tema amarillo estilo Mercado Libre

**Endpoints que usa:**
- `GET /marketplace` - Productos destacados
- `GET /empresas/` - Empresas destacadas
- `GET /reportes/empresas/top-rating-reviews` - Top empresas por rating

---

### 2. **PublicMarketplacePage** (`/marketplace`)
**Ubicación:** `src/pages/PublicMarketplacePage.jsx`

**Características:**
- Grid de productos estilo Mercado Libre (2-4 columnas responsive)
- Filtros laterales: categoría, empresa, rango de precio
- Filtros móviles colapsables
- Ordenar por: más recientes, menor/mayor precio, nombre
- Tarjetas de producto con:
  - Imagen del producto
  - Botón de favoritos (corazón)
  - Precio formateado
  - Rating con estrellas
  - Stock disponible
  - Badge de categoría

**Endpoints que usa:**
- `GET /marketplace` - Listado con filtros
- `GET /categorias` - Filtro de categorías
- `GET /empresas/` - Filtro de empresas
- `POST /favoritos/` - Agregar a favoritos
- `DELETE /favoritos/{id}` - Eliminar de favoritos
- `GET /favoritos/usuario/verificar/{id}` - Verificar si está en favoritos

---

### 3. **ProductDetailPage** (`/producto/:productId`)
**Ubicación:** `src/pages/ProductDetailPage.jsx`

**Características:**
- Galería de imágenes con thumbnails
- Información completa del producto:
  - Nombre, descripción, precio, stock
  - Categoría
  - Rating y reseñas
- Información del vendedor:
  - Nombre de empresa
  - Ubicación
  - Link a perfil de empresa
- Formulario de contacto para chatear
- Botones de favoritos y compartir
- Sección de reseñas con formulario para escribir

**Endpoints que usa:**
- `GET /marketplace/{id}` - Detalle del producto
- `POST /mensajes/` - Enviar mensaje al vendedor
- `GET /reviews/{id_empresa}` - Reseñas de la empresa
- `POST /reviews/` - Crear reseña
- `POST/DELETE /favoritos/` - Gestión de favoritos
- `GET /favoritos/usuario/verificar/{id}` - Verificar favorito

---

### 4. **PublicEmpresaPage** (`/empresa/:empresaId`)
**Ubicación:** `src/pages/PublicEmpresaPage.jsx`

**Características:**
- Header con logo, información de contacto
- Métricas en tiempo real:
  - Rating promedio
  - Total de reseñas
  - Total de productos
  - Clics totales
- Tabs para navegar:
  - Tab "Productos": Grid de productos de la empresa
  - Tab "Reseñas": Lista de reseñas con ratings
- Botón de contacto (requiere login)

**Endpoints que usa:**
- `GET /empresas/{id}` - Detalle de empresa
- `GET /marketplace` - Productos de la empresa
- `GET /reviews/{id_empresa}` - Reseñas de la empresa

---

## 🎨 Tema Amarillo (Mercado Libre Style)

### Configuración de Colores

**Archivo:** `tailwind.config.js`

```javascript
colors: {
  primary: {
    50: "#FFF9E6",
    100: "#FFF3CC",
    200: "#FFE699",
    300: "#FFD966",
    400: "#FFCC33",
    500: "#FFE600", // Amarillo principal (Mercado Libre)
    600: "#E6CF00",
    700: "#CCB800",
    800: "#B3A100",
    900: "#998A00",
  },
  secondary: {
    50: "#F0F9FF",
    // ... Blue accents
    500: "#0EA5E9",
  },
}
```

**CSS Personalizado:** `src/index.css`
- Fondo con gradiente amarillo sutíl
- Hover effects en tarjetas (estilo Mercado Libre)
- Scrollbar personalizado color amarillo
- Smooth scrolling

---

## 🔌 Endpoints Conectados

### Autenticación
- ✅ `POST /signin` - Login
- ✅ `POST /signup` - Registro
- ✅ `GET /me/permisos` - Permisos del usuario

### Datos Geográficos
- ✅ `GET /paises` - Lista de países
- ✅ `GET /departamentos` - Departamentos por país
- ✅ `GET /municipios` - Municipios por departamento

### Categorías
- ✅ `GET /categorias` - Lista de categorías
- ✅ `GET /categorias/{id}` - Detalle de categoría

### Empresas
- ✅ `GET /empresas/` - Listado con filtros
- ✅ `GET /empresas/{id}` - Detalle de empresa
- ✅ `GET /empresas/usuario/mis-empresas` - Mis empresas
- ✅ `POST /empresas/` - Crear empresa
- ✅ `PUT /empresas/{id}` - Editar empresa
- ✅ `DELETE /empresas/{id}` - Eliminar empresa
- ✅ `POST /empresas/{id}/logo/upload` - Subir logo

### Marketplace
- ✅ `GET /marketplace` - Listado con filtros
- ✅ `GET /marketplace/{id}` - Detalle de producto
- ✅ `GET /marketplace/usuario/mis-productos` - Mis productos
- ✅ `POST /marketplace` - Crear producto
- ✅ `PUT /marketplace/{id}` - Editar producto
- ✅ `DELETE /marketplace/{id}` - Eliminar producto
- ✅ `POST /marketplace/{id}/click` - Registrar click
- ✅ `POST /marketplace/{id}/imagenes/upload` - Subir imágenes

### Favoritos
- ✅ `GET /favoritos/usuario/` - Mis favoritos
- ✅ `GET /favoritos/usuario/contar/` - Contar favoritos
- ✅ `GET /favoritos/usuario/verificar/{id}` - Verificar favorito
- ✅ `POST /favoritos/` - Agregar a favoritos
- ✅ `DELETE /favoritos/{id}` - Eliminar de favoritos

### Reseñas
- ✅ `GET /reviews/` - Lista de reseñas
- ✅ `GET /reviews/{id_empresa}` - Reseñas de empresa
- ✅ `POST /reviews/` - Crear reseña
- ✅ `PUT /reviews/{id}` - Editar reseña
- ✅ `DELETE /reviews/{id}` - Eliminar reseña

### Mensajes (Chat)
- ✅ `GET /mensajes/` - Lista de mensajes
- ✅ `GET /mensajes/{id}` - Detalle de mensaje
- ✅ `POST /mensajes/` - Crear mensaje
- ✅ `PUT /mensajes/{id}` - Editar mensaje
- ✅ `DELETE /mensajes/{id}` - Eliminar mensaje
- ✅ `POST /archivos-mensajes/upload` - Subir archivo

### Búsqueda
- ✅ `GET /busqueda/global/` - Búsqueda unificada
- ✅ `GET /busqueda/sugerencias/` - Autocompletar

### Notificaciones
- ✅ `GET /notificaciones/usuario/` - Mis notificaciones
- ✅ `GET /notificaciones/usuario/contar/` - Contar notificaciones
- ✅ `GET /notificaciones/usuario/sin-leer/` - Contar sin leer
- ✅ `POST /notificaciones/marcar-como-leida/{id}` - Marcar leída
- ✅ `POST /notificaciones/marcar-todas-como-leidas/` - Marcar todas leídas

### Reportes
- ✅ `GET /reportes/transacciones/resumen` - Resumen transacciones
- ✅ `GET /reportes/comprobantes/tasa-aprobacion-evaluadores` - Tasa aprobación
- ✅ `GET /reportes/marketplace/top-productos-chats` - Top productos con más chats
- ✅ `GET /reportes/empresas/top-rating-reviews` - Top empresas por rating
- ✅ `GET /reportes/funnel` - Embudo comercial

### Comprobantes
- ✅ `POST /comprobantes/registrar-desde-archivo` - Registrar comprobante
- ✅ `POST /comprobantes/{id}/aprobar` - Aprobar comprobante
- ✅ `POST /comprobantes/{id}/rechazar` - Rechazar comprobante
- ✅ `GET /comprobantes/{id}/timeline` - Timeline de transacción

### Publicidades
- ✅ `GET /publicidades/` - Lista de publicidades
- ✅ `GET /publicidades/{id}` - Detalle publicidad
- ✅ `POST /publicidades/` - Crear publicidad
- ✅ `PUT /publicidades/{id}` - Editar publicidad
- ✅ `POST /publicidades/{id}/imagenes/upload` - Subir imágenes

### Usuarios
- ✅ `GET /usuarios/{id}` - Detalle usuario
- ✅ `PUT /usuarios/{id}` - Editar perfil

---

## 🚀 Cómo Ejecutar

### Frontend
```bash
cd frontend-react
npm install
npm run dev
```

El servidor se iniciará en: `http://localhost:5173`

### Backend
```bash
cd server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

El backend se iniciará en: `http://localhost:8000`

---

## 📱 Responsive Design

La aplicación es completamente responsive:

- **Mobile (< 640px):** 2 columnas para productos, filtros colapsables
- **Tablet (640px - 1024px):** 3 columnas para productos
- **Desktop (> 1024px):** 4-6 columnas para productos, sidebar de filtros visible

---

## 🎯 Características Implementadas

### Sin Autenticación
✅ Ver homepage con productos y empresas destacados
✅ Navegar el marketplace con filtros
✅ Ver detalle completo de productos
✅ Ver perfil de empresas con métricas
✅ Buscar empresas y productos
✅ Ver reseñas y calificaciones

### Con Autenticación
✅ Agregar/eliminar favoritos
✅ Chatear con vendedores
✅ Escribir reseñas
✅ Gestionar productos propios (si es empresa)
✅ Recibir notificaciones en tiempo real
✅ Ver y gestionar mensajes

---

## 🔄 Flujo de Usuario Típico

### Comprador
1. Entra a la homepage y ve productos destacados
2. Usa la barra de búsqueda o navega al marketplace
3. Aplica filtros (categoría, precio, empresa)
4. Click en un producto para ver detalle
5. Lee reseñas de la empresa
6. Si le interesa, inicia sesión
7. Agrega a favoritos o envía mensaje al vendedor

### Vendedor
1. Inicia sesión
2. Crea su empresa (si no tiene)
3. Publica productos con imágenes
4. Responde mensajes de compradores
5. Gestiona sus productos y empresa

---

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- React 19
- React Router DOM 7
- TailwindCSS 3
- Axios
- FontAwesome Icons
- Vite

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL/SQLite
- WebSocket (notificaciones)

---

## 📝 Notas Importantes

1. **Imágenes de Productos:** Se muestran si existen en el array `imagenes` del producto. Si no, se muestra un icono placeholder.

2. **Logos de Empresas:** Se cargan desde `/uploads/empresas/{id}/logo` con cache busting.

3. **Precios:** Formateados en COP (Pesos Colombianos) con separadores de miles.

4. **Rating:** Sistema de 5 estrellas con promedio calculado en el frontend.

5. **Chat:** Integrado con el sistema de mensajes del backend, crea notificaciones automáticas.

6. **Favoritos:** Verificación en tiempo real si un producto está en favoritos del usuario.

---

## 🎨 Próximas Mejoras Sugeridas

1. **Carousel de imágenes** en homepage
2. **Búsqueda con debounce** y sugerencias dropdown
3. **Chat en tiempo real** con WebSocket
4. **Comparador de productos** side-by-side
5. **Historial de vistas** por usuario
6. **Recomendaciones personalizadas** basadas en comportamiento
7. **Modo oscuro** toggle
8. **PWA** para instalación en móviles

---

## 📞 Soporte

Para dudas sobre endpoints, revisar:
- Documentación completa: `ENDPOINTS_FRONTEND.md`
- Swagger UI del backend: `http://localhost:8000/docs`
- Servicios API: `src/services/api.js`

---

## ✨ Creado Por

Tu asistente de desarrollo IA 🤖

**Fecha:** Abril 2026
**Versión:** 1.0.0

---

**¡El marketplace está listo para usar! 🎉**
