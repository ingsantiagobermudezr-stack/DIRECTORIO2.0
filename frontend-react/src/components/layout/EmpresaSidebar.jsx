import { NavLink, Link } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faBuilding,
  faUsers,
  faStore,
  faBullhorn,
  faComments,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { to: "/empresas-panel", label: "Resumen", icon: faChartLine, exact: true },
  { to: "/empresas-panel/mi-empresa", label: "Mi Empresa", icon: faBuilding },
  { to: "/empresas-panel/equipo", label: "Mi Equipo", icon: faUsers },
  { to: "/empresas-panel/marketplace", label: "Mis Productos", icon: faStore },
  { to: "/empresas-panel/publicidades", label: "Mis Publicidades", icon: faBullhorn },
  { to: "/empresas-panel/chats", label: "Chats con Clientes", icon: faComments },
];

export function EmpresaSidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Logo/Title */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Panel Empresa</h1>
        <p className="mt-1 text-sm text-slate-500">Gestiona tu negocio</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to home */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
}
