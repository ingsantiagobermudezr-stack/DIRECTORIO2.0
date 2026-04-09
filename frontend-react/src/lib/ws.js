import { WS_BASE_URL } from "../config/env";
import { getToken } from "./storage";

export function buildNotificationsSocketUrl(usuarioId) {
  const token = getToken();
  const base = `${WS_BASE_URL}/ws/notificaciones/${usuarioId}`;
  if (!token) {
    return base;
  }
  return `${base}?token=${encodeURIComponent(token)}`;
}
