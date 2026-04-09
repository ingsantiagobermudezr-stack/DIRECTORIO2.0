export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");

export const APP_NAME = "Directorio 2.0";
