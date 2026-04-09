import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { useAuth } from "./AuthContext";

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [permisos, setPermisos] = useState(user?.permisos || []);
  const [loading, setLoading] = useState(false);

  const refreshPermisos = useCallback(async () => {
    if (!isAuthenticated) {
      setPermisos([]);
      return [];
    }

    setLoading(true);
    try {
      const { data } = await authApi.mePermisos();
      const nextPermisos = data?.permisos || [];
      setPermisos(nextPermisos);
      return nextPermisos;
    } catch {
      const fallback = user?.permisos || [];
      setPermisos(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.permisos]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPermisos([]);
      return;
    }

    setPermisos(user?.permisos || []);
    refreshPermisos();
  }, [isAuthenticated, refreshPermisos, user?.permisos]);

  const hasPermission = useCallback((permiso) => permisos.includes(permiso), [permisos]);

  const hasAnyPermissions = useCallback(
    (permisoList = []) => permisoList.length === 0 || permisoList.some((permiso) => permisos.includes(permiso)),
    [permisos],
  );

  const hasAllPermissions = useCallback(
    (permisoList = []) => permisoList.every((permiso) => permisos.includes(permiso)),
    [permisos],
  );

  const isAdmin = useMemo(
    () => user?.rol === "admin" && permisos.includes("modificar_roles"),
    [permisos, user?.rol],
  );

  const value = useMemo(
    () => ({
      permisos,
      loading,
      isAdmin,
      hasPermission,
      hasAnyPermissions,
      hasAllPermissions,
      refreshPermisos,
    }),
    [hasAllPermissions, hasAnyPermissions, hasPermission, isAdmin, loading, permisos, refreshPermisos],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions debe usarse dentro de PermissionsProvider");
  }
  return ctx;
}
