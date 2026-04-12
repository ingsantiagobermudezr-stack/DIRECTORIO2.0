import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBars, faXmark, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { NotificationBell } from "../common/NotificationBell";

const PAGE_TITLES = {
  "/empresas-panel": { title: "Dashboard", subtitle: "Resumen de tu empresa" },
  "/empresas-panel/mi-empresa": { title: "Mi Empresa", subtitle: "Información de la empresa" },
  "/empresas-panel/equipo": { title: "Mi Equipo", subtitle: "Gestión de miembros" },
  "/empresas-panel/marketplace": { title: "Mis Productos", subtitle: "Gestión de productos" },
  "/empresas-panel/publicidades": { title: "Mis Publicidades", subtitle: "Campañas publicitarias" },
  "/empresas-panel/chats": { title: "Chats con Clientes", subtitle: "Conversaciones" },
};

export function EmpresaShell() {
  const { user, signout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current page title
  const currentPage = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + "/")
  )?.[1] || { title: "Panel Empresa", subtitle: "Gestión empresarial" };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white/95 backdrop-blur transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:bg-white/80 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>

          <EmpresaSidebar onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
              </button>

              <div className="min-w-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                  <span>Panel</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  <span className="font-medium text-slate-700 truncate">{currentPage.title}</span>
                </nav>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {currentPage.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notification bell */}
              <NotificationBell />

              {/* User info - hidden on mobile */}
              <div className="hidden sm:block rounded-xl bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                <strong className="truncate max-w-[120px] inline-block">{user?.nombre || "-"}</strong>
              </div>

              {/* Back to directory - icon only on mobile */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
                title="Volver al directorio"
              >
                <span className="hidden sm:inline">Directorio</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>

              {/* Logout - icon only on mobile */}
              <button
                type="button"
                onClick={signout}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-red-300 bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-50"
                title="Cerrar sesión"
              >
                <span className="hidden sm:inline">Salir</span>
                <FontAwesomeIcon icon={faRightFromBracket} className="sm:hidden" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile FAB toggle */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 lg:hidden"
        aria-label="Abrir menú"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
      </button>
    </div>
  );
}
