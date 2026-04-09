import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../context/PermissionsContext";
import { buildNotificationsSocketUrl } from "../../lib/ws";
import { notificacionesApi } from "../../services/api";
import { useWebSocketBackoff } from "../../hooks/useWebSocketBackoff";

export function Topbar() {
  const { user, signout } = useAuth();
  const { isAdmin } = usePermissions();
  const [conteos, setConteos] = useState({ total: 0, sinLeer: 0 });
  const wsUrl = user?.id_usuario ? buildNotificationsSocketUrl(user.id_usuario) : null;

  const refreshConteos = useCallback(async () => {
    try {
      const [totalRes, sinLeerRes] = await Promise.all([
        notificacionesApi.contar(),
        notificacionesApi.contar({ sin_leer: true }),
      ]);
      setConteos({
        total: totalRes.data?.cantidad_total || 0,
        sinLeer: sinLeerRes.data?.cantidad_sin_leer || 0,
      });
    } catch {
      // Ignore transient errors in header counters.
    }
  }, []);

  useEffect(() => {
    refreshConteos();
  }, [refreshConteos]);

  useWebSocketBackoff({
    url: wsUrl,
    enabled: Boolean(wsUrl),
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        const isUnread = payload?.leido === false || payload?.read === false || payload?.sin_leer === true;
        setConteos((prev) => ({
          total: prev.total + 1,
          sinLeer: prev.sinLeer + (isUnread ? 1 : 0),
        }));
      } catch {
        // Ignore malformed websocket payloads.
      }
    },
  });

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
        <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
          Notificaciones: {conteos.total} | Sin leer: {conteos.sinLeer}
        </div>
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
