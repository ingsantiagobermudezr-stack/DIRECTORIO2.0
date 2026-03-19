# Historias de usuario - Páginas Amarillas 360

1. Como visitante, quiero ver una lista clara de productos/servicios en el marketplace para explorar ofertas.
   - Criterios de aceptación: tarjetas con nombre, imagen, descripción corta y precio; filtros por búsqueda y rango de precio.

2. Como administrador, quiero agregar/editar/eliminar productos para gestionar el catálogo.
   - Criterios: formulario con validación; feedback de éxito/error; operaciones via API.

3. Como usuario autenticado, quiero iniciar sesión y guardar mis compras en un carrito básico.
   - Criterios: autenticación mediante `signin`, persistencia de sesión por cookie/localStorage, botón "Comprar" que añade al carrito.

4. Como usuario, quiero que la interfaz sea accesible y usable en móvil.
   - Criterios: contrastes adecuados, botones con aria-labels, responsive layout.

5. Como desarrollador, quiero utilidades compartidas para formateo y llamadas API.
   - Criterios: `axiosInstance`, helpers de formato, componentes `Icon` y `Button` reutilizables.
