import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { clearSession, getToken, getUser, saveSession } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const signin = async ({ username, password }) => {
    const { data } = await authApi.signin({ username, password });
    const nextUser = {
      id_usuario: data.id_usuario,
      rol: data.rol,
      id_rol: data.id_rol,
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
      isAuthenticated: Boolean(token),
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
