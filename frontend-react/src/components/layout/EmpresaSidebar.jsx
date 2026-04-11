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

export function EmpresaSidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white/80 p-6 backdrop-blur lg:h-auto">
      <h1 className="text-xl font-semibold text-slate-900">Panel Empresa</h1>
      <p className="mt-1 text-sm text-slate-500">Gestiona tu negocio</p>
      <nav className="mt-8 flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
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

      {/* Volver al Inicio */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </aside>
  );
}
