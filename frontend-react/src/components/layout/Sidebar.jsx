import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faBuilding,
  faStore,
  faHeart,
  faMagnifyingGlass,
  faComments,
  faStar,
  faReceipt,
  faChartPie,
  faBullhorn,
  faBell,
  faUser,
  faTowerBroadcast,
} from "@fortawesome/free-solid-svg-icons";
import { usePermissions } from "../../context/PermissionsContext";

const navItems = [
  { to: "/admin", label: "Resumen", icon: faChartLine },
  { to: "/admin/empresas", label: "Empresas", icon: faBuilding },
  { to: "/admin/marketplace", label: "Marketplace", icon: faStore },
  { to: "/admin/favoritos", label: "Favoritos", icon: faHeart },
  { to: "/admin/busqueda", label: "Búsqueda", icon: faMagnifyingGlass },
  { to: "/admin/mensajes", label: "Mensajes", icon: faComments },
  { to: "/admin/reviews", label: "Reviews", icon: faStar },
  { to: "/admin/comprobantes", label: "Comprobantes", icon: faReceipt },
  { to: "/admin/reportes", label: "Reportes", icon: faChartPie, anyPerms: ["ver_reportes"] },
  { to: "/admin/publicidades", label: "Publicidades", icon: faBullhorn },
  { to: "/admin/admin-live", label: "Admin Live", icon: faTowerBroadcast, adminOnly: true },
  { to: "/admin/notificaciones", label: "Notificaciones", icon: faBell },
  { to: "/admin/perfil", label: "Mi perfil", icon: faUser },
];

export function Sidebar() {
  const { isAdmin, hasAnyPermissions } = usePermissions();

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    if (item.anyPerms && !hasAnyPermissions(item.anyPerms)) {
      return false;
    }
    return true;
  });

  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white/80 p-6 backdrop-blur lg:block">
      <h1 className="text-xl font-semibold text-slate-900">Directorio 2.0</h1>
      <p className="mt-1 text-sm text-slate-500">Panel administrativo</p>
      <nav className="mt-8 space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-teal-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
