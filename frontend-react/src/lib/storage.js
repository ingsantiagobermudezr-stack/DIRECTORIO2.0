import { decodeToken } from "./jwt";

const TOKEN_KEY = "directorio_token";
const USER_KEY = "directorio_user";
const EXPIRATION_KEY = "directorio_token_expiration";

export function saveSession(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    
    // Extract and store expiration timestamp
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      localStorage.setItem(EXPIRATION_KEY, String(decoded.exp * 1000));
    }
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getTokenExpiration() {
  const raw = localStorage.getItem(EXPIRATION_KEY);
  if (!raw) return null;
  
  const timestamp = Number(raw);
  return isNaN(timestamp) ? null : timestamp;
}

export function isSessionExpired() {
  const expiration = getTokenExpiration();
  if (!expiration) return true;
  
  // Consider expired 30 seconds before actual expiration for safety margin
  return Date.now() >= expiration - 30000;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRATION_KEY);
}
