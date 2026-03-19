import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: '/api',
});

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
  } catch (e) {
    // ignore
  }
  return config;
});
