import { useAsyncData } from "../hooks/useAsyncData";
import { authApi, notificacionesApi, reportesApi } from "../services/api";
import { StatCard } from "../components/common/StatCard";
import { Loading } from "../components/common/Loading";

export function DashboardPage() {
  const permisos = useAsyncData(async () => (await authApi.mePermisos()).data);
  const funnel = useAsyncData(async () => (await reportesApi.funnel()).data);
  const sinLeer = useAsyncData(async () => (await notificacionesApi.contarSinLeer()).data);

  if (permisos.loading || funnel.loading || sinLeer.loading) {
    return <Loading text="Cargando tablero ejecutivo" />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Notificaciones sin leer" value={sinLeer.data?.sin_leer || 0} />
        <StatCard title="Búsquedas" value={funnel.data?.metricas?.busquedas || 0} />
        <StatCard title="Chats iniciados" value={funnel.data?.metricas?.chats_iniciados || 0} />
        <StatCard
          title="Conversión búsqueda a válido"
          value={`${funnel.data?.conversiones?.busqueda_a_valido_porcentaje || 0}%`}
        />
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Permisos del usuario</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(permisos.data?.permisos || []).map((permiso) => (
            <span key={permiso} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {permiso}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
