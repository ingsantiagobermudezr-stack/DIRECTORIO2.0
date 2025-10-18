import React from "react";
import { ShoppingCart, Search, Building, Tag } from "lucide-react";

const categories = [
  { id: 1, nombre: "Restaurantes" },
  { id: 2, nombre: "Tecnología" },
  { id: 3, nombre: "Salud" },
  { id: 4, nombre: "Moda" },
  { id: 5, nombre: "Servicios" },
];

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 py-16 px-6 md:px-12 rounded-b-3xl shadow-md">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Texto principal */}
        <div className="text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Aumenta tu visibilidad y{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              haz crecer tu negocio
            </span>
          </h1>
          <p className="text-lg text-gray-800 max-w-lg mx-auto md:mx-0">
            Promociona tus productos, conecta con más clientes y gestiona tus
            ventas en línea de manera eficaz con{" "}
            <strong>Páginas Amarillas 360</strong>.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <a
              href="/marketplace"
              className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow hover:bg-yellow-700 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Ir al Marketplace
            </a>
            <a
              href="/crear-cuenta"
              className="px-6 py-3 border-2 border-yellow-700 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-100 transition flex items-center gap-2"
            >
              <Building className="w-5 h-5" />
              Registrar mi Empresa
            </a>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-6 flex items-center bg-white rounded-lg shadow-lg overflow-hidden max-w-lg mx-auto md:mx-0">
            <input
              type="text"
              placeholder="Buscar empresas, servicios y más..."
              className="flex-1 px-4 py-3 text-gray-700 outline-none"
            />
            <button className="px-4 bg-yellow-600 text-white hover:bg-yellow-700 transition flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Categorías rápidas */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full shadow hover:bg-yellow-100 transition"
              >
                <Tag className="w-4 h-4 text-yellow-600" />
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Imagen / Ilustración */}
        <div className="hidden md:flex justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-10 flex items-center justify-center">
            <ShoppingCart className="w-32 h-32 text-yellow-600" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
