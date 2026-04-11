/**
 * Decodes a JWT token payload without verification.
 * Returns null if the token is invalid.
 */
export function decodeToken(token) {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * Returns true if the token is expired or invalid.
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  // If there's no exp claim, consider it expired
  if (!decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();

  // Consider expired 30 seconds before actual expiration for safety margin
  return now >= expirationTime - 30000;
}

/**
 * Gets the expiration timestamp from a token.
 * Returns null if the token has no exp claim.
 */
export function getTokenExpiration(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000; // Convert to milliseconds
}

/**
 * Gets the time remaining until token expiration in milliseconds.
 * Returns 0 if the token is already expired or invalid.
 */
export function getTimeUntilExpiration(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;

  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  const remaining = expirationTime - now;

  return remaining > 0 ? remaining : 0;
}
