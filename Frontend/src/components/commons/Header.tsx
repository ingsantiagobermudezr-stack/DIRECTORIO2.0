import React from "react";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";

type Props = {
  title?: string;
  token?: string;
  rol?: string;
};

const Header: React.FC<Props> = ({ title, token, rol }) => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-amber-600">
        {title || "Páginas Amarillas 360"}
      </h1>

      <nav className="flex items-center gap-6">
        <a
          href="/marketplace"
          className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition"
        >
          <ShoppingCart size={18} /> Marketplace
        </a>

        {!token ? (
          <a
            href="/iniciar-sesion"
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition"
          >
            <LogIn size={18} /> Iniciar Sesión
          </a>
        ) : (
          <button
            onClick={() => {
              document.cookie =
                "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              document.cookie =
                "rol=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
          >
            <LogOut size={18} /> Cerrar Sesión {rol ? `(${rol})` : ""}
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
