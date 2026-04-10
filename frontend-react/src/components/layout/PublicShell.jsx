import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRightFromBracket, faStore, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { favoritosApi } from "../../services/api";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/empresas", label: "Directorio" },
  { to: "/marketplace", label: "Marketplace" },
];

function UserMenu() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const favoritosCount = useAsyncData(async () => {
    try {
      const { data } = await favoritosApi.contar();
      return data.cantidad || 0;
    } catch {
      return 0;
    }
  });

  const handleSignout = () => {
    signout();
    navigate("/");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Favoritos */}
      <Link
        to="/favoritos"
        className="relative rounded-xl bg-gray-400/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-400/20"
      >
        <FontAwesomeIcon icon={faHeart} color="red" size="xl" className="animate-pulse" />
        {favoritosCount.data > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {favoritosCount.data}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <div className="relative group">
        <button className="flex items-center gap-2 rounded-xl bg-gray-400/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-400/20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary-600 font-bold text-sm border border-slate-300">
            {user?.nombre?.[0] || "U"}
          </div>
          <span className="hidden md:inline text-sm text-black">{user?.nombre || "Usuario"}</span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">{user?.nombre} {user?.apellido}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.rol}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/mi-perfil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              <FontAwesomeIcon icon={faUser} className="w-4" />
              Mi Perfil
            </Link>
            <Link
              to="/favoritos"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              <FontAwesomeIcon icon={faHeart} className="w-4" />
              Mis Favoritos
              {favoritosCount.data > 0 && (
                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {favoritosCount.data}
                </span>
              )}
            </Link>
            {user?.rol === "admin" || user?.permisos?.includes("crear_empresa") ? (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                <FontAwesomeIcon icon={faStore} className="w-4" />
                Panel Admin
              </Link>
            ) : null}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 pt-2">
            <button
              onClick={handleSignout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicShell() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ccfbf1_0%,_#f8fafc_45%,_#ecfeff_100%)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Páginas Amarillas</p>
            <h1 className="text-lg font-semibold text-slate-900">Catalogo publico</h1>
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition md:px-4",
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Iniciar sesion
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <section className="mx-auto w-full max-w-[1200px] px-4 pt-6 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-700 p-6 text-white shadow-xl md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Descubre, compara y conecta</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">Encuentra empresas y articulos en un solo directorio</h2>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100 md:text-base">
            Navega el catalogo sin registrarte. Para iniciar conversaciones y gestionar operaciones, entra al panel administrativo.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/empresas" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-50">
              Ver empresas
            </Link>
            <Link to="/marketplace" className="rounded-xl border border-cyan-200/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Ver articulos
            </Link>
          </div>
        </div>
      </section>
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
