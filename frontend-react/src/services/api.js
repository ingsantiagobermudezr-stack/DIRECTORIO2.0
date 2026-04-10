import { http } from "../lib/http";

const toFormData = (payload) => {
  const data = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    data.append(key, value);
  });
  return data;
};

export const authApi = {
  signin: (formPayload) =>
    http.post("/signin", new URLSearchParams(formPayload), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  signup: (payload) => http.post("/signup", payload),
  mePermisos: () => http.get("/me/permisos"),
  updatePerfil: (payload) => http.put("/me/perfil", payload),
};

export const geoApi = {
  paises: (params) => http.get("/paises", { params }),
  departamentos: (params) => http.get("/departamentos", { params }),
  municipios: (params) => http.get("/municipios", { params }),
};

export const categoriasApi = {
  list: (params) => http.get("/categorias", { params }),
  get: (categoriaId) => http.get(`/categorias/${categoriaId}`),
};

export const catalogosApi = {
  estadosMarketplace: (params) => http.get("/catalogos/estados-marketplace", { params }),
  tiposAnuncio: (params) => http.get("/catalogos/tipos-anuncio", { params }),
};

export const empresasApi = {
  list: (params) => http.get("/empresas/", { params }),
  get: (empresaId) => http.get(`/empresas/${empresaId}`),
  misEmpresas: (params) => http.get("/empresas/usuario/mis-empresas", { params }),
  create: (payload) => http.post("/empresas/", payload),
  update: (empresaId, payload) => http.put(`/empresas/${empresaId}`, payload),
  remove: (empresaId) => http.delete(`/empresas/${empresaId}`),
  uploadLogo: (empresaId, archivo) => {
    const data = new FormData();
    data.append("archivo", archivo);
    return http.post(`/empresas/${empresaId}/logo/upload`, data);
  },
};

export const marketplaceApi = {
  list: (params) => http.get("/marketplace", { params }),
  get: (idMarketplace) => http.get(`/marketplace/${idMarketplace}`),
  misProductos: (params) => http.get("/marketplace/usuario/mis-productos", { params }),
  create: (payload) => http.post("/marketplace", payload),
  update: (idMarketplace, payload) => http.put(`/marketplace/${idMarketplace}`, payload),
  remove: (idMarketplace) => http.delete(`/marketplace/${idMarketplace}`),
  click: (idMarketplace) => http.post(`/marketplace/${idMarketplace}/click`),
  uploadImagenes: (idMarketplace, archivos) => {
    const data = new FormData();
    archivos.forEach((archivo) => data.append("archivos", archivo));
    return http.post(`/marketplace/${idMarketplace}/imagenes/upload`, data);
  },
};

export const reviewsApi = {
  list: (params) => http.get("/reviews/", { params }),
  listEmpresa: (idEmpresa) => http.get(`/reviews/${idEmpresa}`),
  create: (payload) => http.post("/reviews/", payload),
  update: (reviewId, payload) => http.put(`/reviews/${reviewId}`, payload),
  remove: (reviewId) => http.delete(`/reviews/${reviewId}`),
};

export const mensajesApi = {
  list: (params) => http.get("/mensajes/", { params }),
  get: (mensajeId) => http.get(`/mensajes/${mensajeId}`),
  create: (payload) => http.post("/mensajes/", payload),
  update: (mensajeId, payload) => http.put(`/mensajes/${mensajeId}`, payload),
  remove: (mensajeId) => http.delete(`/mensajes/${mensajeId}`),
};

export const archivosMensajesApi = {
  upload: ({ idMensaje, archivo }) => {
    const data = new FormData();
    data.append("id_mensaje", idMensaje);
    data.append("archivo", archivo);
    return http.post("/archivos-mensajes/upload", data);
  },
};

export const comprobantesApi = {
  registrarDesdeArchivo: (payload) =>
    http.post("/comprobantes/registrar-desde-archivo", toFormData(payload)),
  aprobar: (comprobanteId) => http.post(`/comprobantes/${comprobanteId}/aprobar`),
  rechazar: (comprobanteId) => http.post(`/comprobantes/${comprobanteId}/rechazar`),
  timeline: (comprobanteId) => http.get(`/comprobantes/${comprobanteId}/timeline`),
  list: (params) => http.get("/comprobantes/", { params }),
  get: (comprobanteId) => http.get(`/comprobantes/${comprobanteId}`),
};

export const reportesApi = {
  transaccionesResumen: (params) => http.get("/reportes/transacciones/resumen", { params }),
  tasaAprobacionEvaluadores: (params) =>
    http.get("/reportes/comprobantes/tasa-aprobacion-evaluadores", { params }),
  topProductosChats: (params) => http.get("/reportes/marketplace/top-productos-chats", { params }),
  topEmpresasRating: (params) => http.get("/reportes/empresas/top-rating-reviews", { params }),
  funnel: (params) => http.get("/reportes/funnel", { params }),
};

export const usuariosApi = {
  get: (usuarioId) => http.get(`/usuarios/${usuarioId}`),
  update: (usuarioId, payload) => http.put(`/usuarios/${usuarioId}`, payload),
};

export const publicidadesApi = {
  list: (params) => http.get("/publicidades/", { params }),
  get: (publicidadId) => http.get(`/publicidades/${publicidadId}`),
  create: (payload) => http.post("/publicidades/", payload),
  update: (publicidadId, payload) => http.put(`/publicidades/${publicidadId}`, payload),
  remove: (publicidadId) => http.delete(`/publicidades/${publicidadId}`),
  uploadImagenes: (publicidadId, archivos) => {
    const data = new FormData();
    archivos.forEach((archivo) => data.append("archivos", archivo));
    return http.post(`/publicidades/${publicidadId}/imagenes/upload`, data);
  },
};

export const favoritosApi = {
  misFavoritos: (params) => http.get("/favoritos/usuario/", { params }),
  contar: () => http.get("/favoritos/usuario/contar/"),
  verificar: (idMarketplace) => http.get(`/favoritos/usuario/verificar/${idMarketplace}`),
  agregar: (idMarketplace) => http.post("/favoritos/", null, { params: { id_marketplace: idMarketplace } }),
  eliminar: (idMarketplace) => http.delete(`/favoritos/${idMarketplace}`),
};

export const busquedaApi = {
  global: (params) => http.get("/busqueda/global/", { params }),
  sugerencias: (params) => http.get("/busqueda/sugerencias/", { params }),
};

export const notificacionesApi = {
  listarUsuario: (params) => http.get("/notificaciones/usuario/", { params }),
  contar: (params) => http.get("/notificaciones/usuario/contar/", { params }),
  contarSinLeer: () => http.get("/notificaciones/usuario/sin-leer/"),
  marcarLeida: (idNotificacion) => http.post(`/notificaciones/marcar-como-leida/${idNotificacion}`),
  marcarTodasLeidas: () => http.post("/notificaciones/marcar-todas-como-leidas/"),
  eliminar: (idNotificacion) => http.delete(`/notificaciones/${idNotificacion}`),
};
