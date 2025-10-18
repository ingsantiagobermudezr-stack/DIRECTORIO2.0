import React, { useState } from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";

const adminSections = [
    { name: "Resultados", path: "/admin/resultados" },
  { name: "Categorías", path: "/admin/categoria" },
  { name: "Publicidad", path: "/admin/publicidad" },
  { name: "Departamentos", path: "/admin/departamentos" },
  { name: "Empresas", path: "/admin/empresas" },
  { name: "Reviews", path: "/admin/reviews" },
  { name: "Municipios", path: "/admin/municipios" },
  { name: "Usuarios", path: "/admin/usuarios" },
];

export const AdminGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sorted, setSorted] = useState<boolean>(false);

  const filteredSections = adminSections
    .filter((section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sorted) return 0;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Panel Administrativo
        </h1>
        <div className="flex items-center justify-between mb-6 space-x-4">
          {/* Campo de Búsqueda */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-yellow-400 pl-10"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Botón para Ordenar */}
          <button
            onClick={() => setSorted(!sorted)}
            title={sorted ? "Desordenar" : "Ordenar Alfabéticamente"}
            className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow hover:bg-yellow-600 transition relative group"
          >
            {sorted ? (
              <SortDesc className="w-5 h-5" />
            ) : (
              <SortAsc className="w-5 h-5" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              {sorted ? "Desordenar" : "Ordenar"}
            </span>
          </button>
        </div>

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSections.map((section) => (
            <a
              href={section.path}
              key={section.name}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 hover:bg-yellow-50 transition group"
            >
              <h2 className="text-lg font-medium text-gray-700">
                {section.name}
              </h2>
              <p className="text-sm text-gray-500 group-hover:text-yellow-600">
                Administrar la sección de {section.name.toLowerCase()}.
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

