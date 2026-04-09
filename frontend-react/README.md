# Directorio 2.0 Frontend (React + JavaScript)

Frontend operativo para entorno de producción, construido con React en JavaScript, Tailwind, Font Awesome y tipografía Inter.

## Stack

- React 19 (JavaScript)
- Vite
- Tailwind CSS
- Axios
- React Router
- Font Awesome
- Inter (@fontsource)

## Configuración rápida

1. Instalar dependencias

	npm install

2. Crear variables de entorno

	Copiar .env.example a .env y ajustar si aplica.

3. Ejecutar en desarrollo

	npm run dev

4. Build de producción

	npm run build

## Variables de entorno

- VITE_API_URL=http://localhost:8000/api
- VITE_WS_URL=ws://localhost:8000/api

## Cobertura funcional

El frontend incluye integración para todos los módulos de ENDPOINTS_FRONTEND.md:

- Autenticación
- Empresas
- Marketplace
- Favoritos
- Búsqueda global y sugerencias
- Mensajes y carga de archivos
- Comprobantes y timeline
- Reviews
- Reportes
- Publicidades
- Notificaciones REST + WebSocket
- Perfil de usuario

## Nota de producción

La capa API central está en src/services/api.js, diseñada para mantener una única fuente de verdad de rutas y facilitar escalado por dominio.
