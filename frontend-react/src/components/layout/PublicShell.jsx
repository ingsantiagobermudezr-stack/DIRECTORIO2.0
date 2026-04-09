import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/empresas", label: "Empresas" },
  { to: "/marketplace", label: "Articulos" },
];

export function PublicShell() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ccfbf1_0%,_#f8fafc_45%,_#ecfeff_100%)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Directorio 2.0</p>
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
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Iniciar sesion
            </Link>
            {isAuthenticated ? (
              <Link
                to="/admin"
                className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Panel admin
              </Link>
            ) : null}
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
