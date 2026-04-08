import axios from "axios";

const isServer = typeof window === 'undefined';
const serverBase = process.env.API_BASE || 'http://127.0.0.1:8000/api';
export const axiosInstance = axios.create({
  // ensure absolute baseURL on server; on client use relative `/api`
  baseURL: isServer ? serverBase : '/api',
});

// Guarantee defaults in case bundling changes evaluation
axiosInstance.defaults.baseURL = isServer ? serverBase : '/api';
// Enviar cookies en peticiones (cliente) y permitir credenciales en CORS
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;

// Attach token from localStorage on each request (client-side only)
axiosInstance.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // server-side safety: if config.url is a path starting with '/api' and no baseURL,
    // ensure a full URL so axios's http adapter won't call new URL() without base.
    if (typeof window === 'undefined') {
      const url = config.url || '';
      if (url.startsWith('/api')) {
        // serverBase puede contener '/api' al final; quitarlo para evitar '/api/api' al concatenar
        config.baseURL = serverBase.replace(/\/api\/?$/, '');
      } else {
        // si la URL es absoluta o no comienza con /api, usar serverBase tal cual
        config.baseURL = serverBase.replace(/\/$/, '');
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});
