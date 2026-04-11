import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { clearSession, getToken } from "./storage";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      // Redirect to login page immediately
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`;
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  },
);
