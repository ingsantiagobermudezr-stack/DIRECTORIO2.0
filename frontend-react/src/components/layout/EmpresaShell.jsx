import { Outlet, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { NotificationBell } from "../common/NotificationBell";

export function EmpresaShell() {
  const { user, signout } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
      <div className="w-full lg:w-auto lg:min-w-[280px]">
        <EmpresaSidebar />
      </div>
      <div className="flex flex-1 flex-col">
        {/* Header para panel empresa */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Panel Empresa</p>
            <h2 className="text-lg font-semibold text-slate-900">Gestión de chats con clientes</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
              Usuario: <strong>{user?.id_usuario || "-"}</strong> | Rol: <strong>{user?.rol || "-"}</strong>
            </div>
            
            {/* Campana de notificaciones */}
            <NotificationBell />
            
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Volver al directorio
            </Link>
            <button
              type="button"
              onClick={signout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Salir
            </button>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
