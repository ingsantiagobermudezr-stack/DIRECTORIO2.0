import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { clearSession, getToken, getUser, isSessionExpired, saveSession } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  // Check session expiration on mount and periodically
  useEffect(() => {
    const checkSession = () => {
      if (token && isSessionExpired()) {
        clearSession();
        setToken(null);
        setUser(null);
        
        // Redirect to login if session expired
        const currentPath = window.location.pathname + window.location.search;
        if (window.location.pathname !== "/login") {
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
        }
      }
    };

    // Check immediately on mount
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const signin = async ({ username, password }) => {
    const { data } = await authApi.signin({ username, password });
    const nextUser = {
      id_usuario: data.id_usuario,
      rol: data.rol,
      id_rol: data.id_rol,
      id_empresa: data.id_empresa || null,
      permisos: data.permisos || [],
    };
    saveSession(data.access_token, nextUser);
    setToken(data.access_token);
    setUser(nextUser);
    return nextUser;
  };

  const signup = async (payload) => {
    const { data } = await authApi.signup(payload);
    const nextUser = {
      id_usuario: data.id_usuario,
      rol: data.rol,
      id_rol: data.id_rol,
      id_empresa: data.id_empresa || null,
      permisos: data.permisos || [],
    };
    saveSession(data.access_token, nextUser);
    setToken(data.access_token);
    setUser(nextUser);
    return nextUser;
  };

  const signout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token) && !isSessionExpired(),
      signin,
      signup,
      signout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
