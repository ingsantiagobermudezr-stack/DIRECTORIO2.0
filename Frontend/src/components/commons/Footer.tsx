import React from "react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-black/5 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          &copy; {year} Páginas Amarillas 360. Todos los derechos reservados.
        </p>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <a href="/terminos-condiciones" className="hover:text-gray-900 transition">
            Condiciones
          </a>
          <a href="/contacto" className="hover:text-gray-900 transition">
            Contacto
          </a>
          <a href="/ayuda" className="hover:text-gray-900 transition">
            Ayuda
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
