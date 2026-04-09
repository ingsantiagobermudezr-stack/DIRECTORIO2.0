import { usePermissions } from "../../context/PermissionsContext";

export function PermissionGate({ allOf = [], anyOf = [], adminOnly = false, fallback = null, children }) {
  const { loading, isAdmin, hasAllPermissions, hasAnyPermissions } = usePermissions();

  if (loading) {
    return null;
  }

  const allowedByAdmin = adminOnly ? isAdmin : true;
  const allowedByAll = allOf.length ? hasAllPermissions(allOf) : true;
  const allowedByAny = anyOf.length ? hasAnyPermissions(anyOf) : true;

  if (allowedByAdmin && allowedByAll && allowedByAny) {
    return children;
  }

  return fallback;
}
