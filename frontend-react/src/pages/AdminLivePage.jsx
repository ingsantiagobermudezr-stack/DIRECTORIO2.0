import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatCard } from "../components/common/StatCard";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { buildNotificationsSocketUrl } from "../lib/ws";
import { notificacionesApi, reportesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";

const EVENT_TYPES = [
  { key: "new_message", label: "Mensajes" },
  { key: "new_review", label: "Reviews" },
  { key: "favorite_price_change", label: "Cambio precio" },
  { key: "comprobante_aprobado", label: "Aprobados" },
  { key: "comprobante_rechazado", label: "Rechazados" },
];

function normalizeTipo(evento) {
  return evento?.tipo_notificacion || evento?.tipo || "otro";
}

function mergeEventos(prev, incoming) {
  const merged = [...incoming, ...prev];
  const uniq = [];
  const seen = new Set();

  for (const item of merged) {
    const key = `${item.id || "x"}-${normalizeTipo(item)}-${item.fecha_creacion || ""}-${item.contenido || ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniq.push(item);
    if (uniq.length >= 60) {
      break;
    }
  }

  return uniq;
}

export function AdminLivePage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState("all");
  const wsErrorNotifiedRef = useRef(false);
  const bootstrapErrorNotifiedRef = useRef(false);
  const [metricas, setMetricas] = useState({
    sinLeer: 0,
    totalNotificaciones: 0,
    busquedas: 0,
    productosVistos: 0,
    chatsIniciados: 0,
    conversionBusquedaValido: 0,
    ultimoUpdate: null,
  });

  const wsUrl = user?.id_usuario ? buildNotificationsSocketUrl(user.id_usuario) : null;

  const reloadMetrics = useCallback(async () => {
    const [funnelRes, totalRes, sinLeerRes] = await Promise.all([
      reportesApi.funnel(),
      notificacionesApi.contar(),
      notificacionesApi.contar({ sin_leer: true }),
    ]);

    setMetricas({
      sinLeer: sinLeerRes.data?.cantidad_sin_leer || 0,
      totalNotificaciones: totalRes.data?.cantidad_total || 0,
      busquedas: funnelRes.data?.metricas?.busquedas || 0,
      productosVistos: funnelRes.data?.metricas?.productos_vistos || 0,
      chatsIniciados: funnelRes.data?.metricas?.chats_iniciados || 0,
      conversionBusquedaValido: funnelRes.data?.conversiones?.busqueda_a_valido_porcentaje || 0,
      ultimoUpdate: new Date().toISOString(),
    });
  }, []);

  const refreshEventos = useCallback(async () => {
    try {
      const { data } = await notificacionesApi.listarUsuario({ limit: 50 });
      const normalized = (data || []).map((item) => ({
        id: item.id,
        contenido: item.contenido,
        tipo_notificacion: item.tipo,
        fecha_creacion: item.fecha_creacion,
        remitente_id: item.id_usuario_remitente,
      }));
      setEventos((prev) => mergeEventos(prev, normalized));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await Promise.all([reloadMetrics(), refreshEventos()]);
        bootstrapErrorNotifiedRef.current = false;
      } catch {
        if (!bootstrapErrorNotifiedRef.current) {
          bootstrapErrorNotifiedRef.current = true;
          pushToast({
            title: "Modo admin",
            message: "Falló carga inicial. Usa refresco manual o espera nuevos eventos WS",
            type: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [pushToast, refreshEventos, reloadMetrics]);

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
          message: "Activado auto-refresh con backoff mientras reconecta",
          type: "error",
        });
      }
    },
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEventos((prev) => mergeEventos(prev, [payload]));
        setMetricas((prev) => ({
          ...prev,
          totalNotificaciones: prev.totalNotificaciones + 1,
          sinLeer: prev.sinLeer + 1,
          ultimoUpdate: new Date().toISOString(),
        }));
      } catch {
        // Ignore invalid payloads.
      }
    },
  });

  const conteosPorTipo = useMemo(() => {
    const base = Object.fromEntries(EVENT_TYPES.map((item) => [item.key, 0]));
    for (const evento of eventos) {
      const tipo = normalizeTipo(evento);
      if (base[tipo] !== undefined) {
        base[tipo] += 1;
      }
    }
    return base;
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    if (selectedTipo === "all") {
      return eventos;
    }
    return eventos.filter((item) => normalizeTipo(item) === selectedTipo);
  }, [eventos, selectedTipo]);

  if (loading) {
    return <Loading text="Inicializando centro de control admin" />;
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Modo admin avanzado</h3>
        <p className="mt-1 text-sm text-slate-500">
          Métricas en vivo por WebSocket.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          WS: <strong>{ws.status}</strong>
          {ws.reconnectInMs ? ` | reintento en ${Math.round(ws.reconnectInMs / 1000)}s` : ""}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total notificaciones" value={metricas.totalNotificaciones} />
        <StatCard title="Sin leer" value={metricas.sinLeer} />
        <StatCard title="Búsquedas" value={metricas.busquedas} />
        <StatCard title="Productos vistos" value={metricas.productosVistos} />
        <StatCard title="Chats iniciados" value={metricas.chatsIniciados} />
        <StatCard title="Conversión búsqueda a válido" value={`${metricas.conversionBusquedaValido}%`} />
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">
          Última actualización: {metricas.ultimoUpdate ? new Date(metricas.ultimoUpdate).toLocaleString() : "-"}
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">Segmentación del stream por tipo</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedTipo === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setSelectedTipo("all")}
          >
            Todos ({eventos.length})
          </button>
          {EVENT_TYPES.map((item) => (
            <button
              key={item.key}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedTipo === item.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              onClick={() => setSelectedTipo(item.key)}
            >
              {item.label} ({conteosPorTipo[item.key] || 0})
            </button>
          ))}
        </div>
      </article>

      <DataTable
        columns={[
          {
            key: "tipo_notificacion",
            label: "Tipo",
            render: (row) => normalizeTipo(row),
          },
          { key: "contenido", label: "Contenido" },
          {
            key: "fecha_creacion",
            label: "Fecha",
            render: (row) => (row.fecha_creacion ? new Date(row.fecha_creacion).toLocaleString() : "-") ,
          },
          { key: "remitente_id", label: "Remitente" },
        ]}
        rows={eventosFiltrados}
      />
    </section>
  );
}
