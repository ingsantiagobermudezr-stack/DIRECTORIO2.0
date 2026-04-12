import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../context/PermissionsContext";
import { NotificationBell } from "../common/NotificationBell";

export function Topbar() {
  const { user, signout } = useAuth();
  const { isAdmin } = usePermissions();

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Producción</p>
        <h2 className="text-lg font-semibold text-slate-900">Operación integral del marketplace</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Usuario: <strong>{user?.id_usuario || "-"}</strong> | Rol: <strong>{user?.rol || "-"}</strong>
        </div>
        
        {/* Campana de notificaciones con dropdown */}
        <NotificationBell />
        
        {isAdmin ? (
          <div className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">Modo admin activo</div>
        ) : null}
        <button
          type="button"
          onClick={signout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          Salir
        </button>
      </div>
    </header>
  );
}
