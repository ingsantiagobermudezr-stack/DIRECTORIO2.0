import React from "react";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface CardEmpresaProps {
  empresas: any[];
  listadoCategorias?: Categoria[]; // puede no venir
}

const CardEmpresa: React.FC<CardEmpresaProps> = ({ empresas, listadoCategorias = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {empresas.map((empresa) => (
        <div
          key={empresa.id_empresa ?? empresa.nombre}
          className="border rounded-xl shadow-md bg-white p-6 flex flex-col items-start"
        >
          <img
            src={empresa.logo || "/default-logo.png"}
            alt={empresa.nombre}
            className="w-20 h-20 object-contain mb-4"
          />
          <h2 className="text-xl font-bold mb-2">{empresa.nombre}</h2>
          <p><strong>NIT:</strong> {empresa.nit}</p>
          <p><strong>Email:</strong> {empresa.correo || empresa.email}</p>
          <p><strong>Dirección:</strong> {empresa.direccion}</p>
          <p><strong>Teléfono:</strong> {empresa.telefono}</p>
          <p><strong>Municipio:</strong> {empresa.municipio?.nombre || empresa.municipio || "-"}</p>

          {/* Selector de categorías */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select className="border rounded px-3 py-2 w-full">
              {listadoCategorias.length > 0 ? (
                listadoCategorias.map((item) => (
                  <option
                    value={item.id_categoria}
                    key={`${item.nombre}-${item.id_categoria}`}
                  >
                    {item.nombre}
                  </option>
                ))
              ) : (
                <option disabled>No hay categorías</option>
              )}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardEmpresa;
