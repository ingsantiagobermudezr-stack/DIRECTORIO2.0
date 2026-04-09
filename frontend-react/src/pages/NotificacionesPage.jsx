import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "../components/common/DataTable";
import { Badge } from "../components/common/Badge";
import { useAsyncData } from "../hooks/useAsyncData";
import { buildNotificationsSocketUrl } from "../lib/ws";
import { notificacionesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";

export function NotificacionesPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [filtroLeidas, setFiltroLeidas] = useState("all");
  const [conteos, setConteos] = useState({ total: 0, sinLeer: 0 });
  const [eventos, setEventos] = useState([]);
  const wsErrorNotifiedRef = useRef(false);

  const notificaciones = useAsyncData(async () => {
    const leidas = filtroLeidas === "all" ? undefined : filtroLeidas === "read";
    return (await notificacionesApi.listarUsuario({ limit: 50, leidas })).data;
  }, filtroLeidas);

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
      // Ignore count errors to avoid interrupting page flow.
    }
  }, []);

  const refreshNotificaciones = useCallback(async () => {
    try {
      const leidas = filtroLeidas === "all" ? undefined : filtroLeidas === "read";
      const { data } = await notificacionesApi.listarUsuario({ limit: 50, leidas });
      notificaciones.setData(data);
      refreshConteos();
      return true;
    } catch {
      return false;
    }
  }, [filtroLeidas, notificaciones, refreshConteos]);

  const wsUrl = user?.id_usuario ? buildNotificationsSocketUrl(user.id_usuario) : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshNotificaciones();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshNotificaciones]);

  const ws = useWebSocketBackoff({
    url: wsUrl,
    enabled: Boolean(wsUrl),
    onOpen: () => {
      wsErrorNotifiedRef.current = false;
    },
    onError: () => {
      if (!wsErrorNotifiedRef.current) {
        wsErrorNotifiedRef.current = true;
        pushToast({
          title: "WebSocket inestable",
          message: "Entrando en auto-refresh con backoff hasta recuperar conexión",
          type: "error",
        });
      }
    },
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEventos((prev) => [payload, ...prev].slice(0, 20));
        refreshNotificaciones();
        pushToast({ title: "Notificación en vivo", message: payload.contenido || "Evento recibido", type: "success" });
      } catch {
        return;
      }
    },
  });

  const marcarLeida = async (id) => {
    await notificacionesApi.marcarLeida(id);
    refreshNotificaciones();
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasLeidas();
      pushToast({ title: "Notificaciones", message: "Todas marcadas como leídas", type: "success" });
      refreshNotificaciones();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo marcar todas", type: "error" });
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesApi.eliminar(id);
      pushToast({ title: "Notificación eliminada", message: `ID ${id} eliminada`, type: "success" });
      refreshNotificaciones();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
        Estado WS: <strong>{ws.status}</strong>
        {ws.reconnectInMs ? ` | reintento en ${Math.round(ws.reconnectInMs / 1000)}s` : ""}
        {` | total ${conteos.total} | sin leer ${conteos.sinLeer}`}
      </article>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={filtroLeidas} onChange={(e) => setFiltroLeidas(e.target.value)}>
            <option value="all">Todas</option>
            <option value="unread">Solo no leídas</option>
            <option value="read">Solo leídas</option>
          </select>
          <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white" onClick={refreshNotificaciones}>Refrescar</button>
          <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white" onClick={marcarTodasLeidas}>Marcar todas leídas</button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "tipo", label: "Tipo" },
          { key: "contenido", label: "Contenido" },
          {
            key: "leido",
            label: "Estado",
            render: (row) => <Badge tone={row.leido ? "neutral" : "warning"}>{row.leido ? "Leída" : "Nueva"}</Badge>,
          },
          {
            key: "acciones",
            label: "Acción",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => marcarLeida(row.id)}>
                  Marcar leída
                </button>
                <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => eliminarNotificacion(row.id)}>
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        rows={notificaciones.data || []}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Eventos en tiempo real (WebSocket)</h3>
        <div className="mt-3 space-y-2">
          {eventos.map((evento, index) => (
            <article key={`${evento.id || index}-${index}`} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{evento.tipo_notificacion || evento.tipo || "evento"}</p>
              <p className="text-xs text-slate-600">{evento.contenido || "sin contenido"}</p>
            </article>
          ))}
          {!eventos.length ? <p className="text-sm text-slate-500">Aún no llegan eventos en vivo.</p> : null}
        </div>
      </div>
    </section>
  );
}
