import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartLine,
  faEye,
  faMessage,
  faMousePointer,
  faReceipt,
  faSearch,
  faStore,
  faUser,
  faArrowUp,
  faArrowDown,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { authApi, notificacionesApi, reportesApi } from "../services/api";
import { StatCard } from "../components/common/StatCard";
import { Loading } from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const permisos = useAsyncData(async () => (await authApi.mePermisos()).data);
  const funnel = useAsyncData(async () => (await reportesApi.funnel()).data);
  const sinLeer = useAsyncData(async () => (await notificacionesApi.contarSinLeer()).data);

  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? "Buenos días" : horaActual < 18 ? "Buenas tardes" : "Buenas noches";
  const fechaActual = new Date().toLocaleDateString("es-CO", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (permisos.loading || funnel.loading || sinLeer.loading) {
    return <Loading text="Cargando tablero ejecutivo" />;
  }

  const metricas = funnel.data?.metricas || {};
  const conversiones = funnel.data?.conversiones || {};

  return (
    <section className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-500 to-primary-400 p-8 text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-100">
              <FontAwesomeIcon icon={faClock} />
              <span>{fechaActual}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold">
              {saludo}, {user?.nombre || "Usuario"} {user?.apellido || ""}
            </h1>
            <p className="mt-2 text-base text-primary-50">
              <span className="capitalize">Rol: {user?.rol || "usuario"}</span> • {user?.permisos?.length || 0} permisos activos
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl font-bold shadow-lg backdrop-blur">
            {(user?.nombre?.[0] || "U").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Métricas Clave</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Notificaciones sin leer"
            value={sinLeer.data?.sin_leer || 0}
            icon={faBell}
            color="warning"
            trend={sinLeer.data?.sin_leer > 0 ? "down" : "up"}
            hint={sinLeer.data?.sin_leer > 0 ? "Tienes mensajes pendientes" : "Todo al día"}
          />
          <StatCard
            title="Búsquedas realizadas"
            value={metricas.busquedas || 0}
            icon={faSearch}
            color="info"
            hint="Total de búsquedas"
          />
          <StatCard
            title="Chats iniciados"
            value={metricas.chats_iniciados || 0}
            icon={faMessage}
            color="purple"
            hint="Conversaciones activas"
          />
          <StatCard
            title="Tasa de conversión"
            value={`${conversiones.busqueda_a_valido_porcentaje || 0}%`}
            icon={faChartLine}
            color={Number(conversiones.busqueda_a_valido_porcentaje) > 50 ? "success" : "danger"}
            trend={Number(conversiones.busqueda_a_valido_porcentaje) > 50 ? "up" : "down"}
            hint="De búsqueda a venta válida"
          />
        </div>
      </div>

      {/* Funnel Metrics */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Funnel de Conversión</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Productos vistos"
            value={metricas.productos_vistos || 0}
            icon={faEye}
            color="primary"
            hint="Vistas de producto"
          />
          <StatCard
            title="Clics en productos"
            value={metricas.clics_producto || 0}
            icon={faMousePointer}
            color="info"
            hint="Interacción con productos"
          />
          <StatCard
            title="Comprobantes"
            value={metricas.comprobantes_registrados || 0}
            icon={faReceipt}
            color="warning"
            hint="Pagos registrados"
          />
          <StatCard
            title="Empresas activas"
            value="-"
            icon={faStore}
            color="success"
            hint="Próximamente"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Accesos Rápidos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/empresas"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
              <FontAwesomeIcon icon={faStore} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Empresas</p>
              <p className="text-xs text-slate-600">Gestionar directorio</p>
            </div>
          </Link>

          <Link
            to="/admin/marketplace"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-green-50 to-green-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white shadow-md">
              <FontAwesomeIcon icon={faChartLine} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Marketplace</p>
              <p className="text-xs text-slate-600">Productos</p>
            </div>
          </Link>

          <Link
            to="/admin/mensajes"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md">
              <FontAwesomeIcon icon={faMessage} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mensajes</p>
              <p className="text-xs text-slate-600">Chats activos</p>
            </div>
          </Link>

          <Link
            to="/admin/notificaciones"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-white shadow-md">
              <FontAwesomeIcon icon={faBell} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Notificaciones</p>
              <p className="text-xs text-slate-600">
                {sinLeer.data?.sin_leer > 0 ? `${sinLeer.data.sin_leer} nuevas` : "Al día"}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* User Permissions */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FontAwesomeIcon icon={faUser} className="text-primary-500" />
          Tus Permisos
        </h3>
        <div className="flex flex-wrap gap-2">
          {(permisos.data?.permisos || []).map((permiso) => (
            <span
              key={permiso}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm transition hover:shadow-md"
            >
              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              {permiso.replace(/_/g, " ")}
            </span>
          ))}
          {(permisos.data?.permisos || []).length === 0 && (
            <p className="text-sm text-slate-500">No tienes permisos especiales asignados</p>
          )}
        </div>
      </article>
    </section>
  );
}
