import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faStore,
  faBullhorn,
  faComments,
  faArrowRight,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, marketplaceApi, publicidadesApi, mensajesApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";

export function EmpresaDashboardPage() {
  // Load user's companies
  const misEmpresas = useAsyncData(async () => {
    try {
      return (await empresasApi.misEmpresas({ limit: 50 })).data || [];
    } catch {
      return [];
    }
  });

  // Load user's products
  const misProductos = useAsyncData(async () => {
    try {
      return (await marketplaceApi.misProductos({ limit: 100 })).data || [];
    } catch {
      return [];
    }
  });

  // Load advertisements
  const publicidades = useAsyncData(async () => {
    try {
      const { data } = await publicidadesApi.list({ limit: 100 });
      const userEmpresaIds = new Set((misEmpresas.data || []).map((e) => String(e.id)));
      return (data || []).filter((p) => userEmpresaIds.has(String(p.id_empresa)));
    } catch {
      return [];
    }
  }, [misEmpresas.data]);

  // Load messages count
  const mensajesCount = useAsyncData(async () => {
    try {
      const { data } = await mensajesApi.list({ limit: 1 });
      return data?.length || 0;
    } catch {
      return 0;
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    const empresasCount = misEmpresas.data?.length || 0;
    const productosCount = misProductos.data?.length || 0;
    const publicidadesCount = publicidades.data?.length || 0;
    const productosConStock = misProductos.data?.filter((p) => p.stock > 0).length || 0;
    const productosSinStock = productosCount - productosConStock;

    return {
      empresasCount,
      productosCount,
      publicidadesCount,
      productosConStock,
      productosSinStock,
    };
  }, [misEmpresas.data, misProductos.data, publicidades.data]);

  if (misEmpresas.loading || misProductos.loading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: "Mi Empresa",
      value: stats.empresasCount,
      icon: faBuilding,
      color: "bg-blue-500",
      link: "/empresas-panel/mi-empresa",
      linkText: "Gestionar empresa",
    },
    {
      title: "Mi Equipo",
      value: stats.empresasCount > 0 ? "Ver" : 0,
      icon: faBuilding,
      color: "bg-purple-500",
      link: "/empresas-panel/equipo",
      linkText: "Gestionar equipo",
    },
    {
      title: "Mis Productos",
      value: stats.productosCount,
      icon: faStore,
      color: "bg-indigo-500",
      link: "/empresas-panel/marketplace",
      linkText: "Gestionar productos",
    },
    {
      title: "Publicidades",
      value: stats.publicidadesCount,
      icon: faBullhorn,
      color: "bg-amber-500",
      link: "/empresas-panel/publicidades",
      linkText: "Gestionar publicidades",
    },
    {
      title: "Chats con Clientes",
      value: "Ver",
      icon: faComments,
      color: "bg-teal-500",
      link: "/empresas-panel/chats",
      linkText: "Ver conversaciones",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Resumen de tu Negocio</h3>
        <p className="mt-1 text-sm text-slate-600">
          Vista general de tus empresas y productos en el marketplace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white`}>
                <FontAwesomeIcon icon={stat.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
            <Link
              to={stat.link}
              className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {stat.linkText}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>

      {/* Stock Summary */}
      {stats.productosCount > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Estado del Inventario</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-green-700">Productos con Stock</p>
              <p className="mt-1 text-3xl font-bold text-green-800">{stats.productosConStock}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Productos sin Stock</p>
              <p className="mt-1 text-3xl font-bold text-red-800">{stats.productosSinStock}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Companies */}
      {stats.empresasCount > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Mi Empresa</h4>
            <Link
              to="/empresas-panel/mi-empresa"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Editar
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(misEmpresas.data || []).slice(0, 6).map((empresa) => (
              <div
                key={empresa.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h5 className="font-semibold text-slate-900">{empresa.nombre}</h5>
                <p className="mt-1 text-xs text-slate-500">{empresa.correo}</p>
                <p className="mt-1 text-xs text-slate-400">NIT: {empresa.nit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-900">Acciones Rápidas</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/empresas-panel/mi-empresa"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          >
            <FontAwesomeIcon icon={faBuilding} className="h-5 w-5" />
            Mi Empresa
          </Link>
          <Link
            to="/empresas-panel/equipo"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
          >
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
            Mi Equipo
          </Link>
          <Link
            to="/empresas-panel/marketplace"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
          >
            <FontAwesomeIcon icon={faStore} className="h-5 w-5" />
            Nuevo Producto
          </Link>
          <Link
            to="/empresas-panel/publicidades"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
          >
            <FontAwesomeIcon icon={faBullhorn} className="h-5 w-5" />
            Nueva Publicidad
          </Link>
        </div>
      </div>
    </section>
  );
}
