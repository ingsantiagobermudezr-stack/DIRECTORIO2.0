import React from "react";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface CardEmpresaProps {
  empresas: any[];
  listadoCategorias?: Categoria[];
}

const CardEmpresa: React.FC<CardEmpresaProps> = ({ empresas, listadoCategorias = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {empresas.map((empresa) => (
        <article
          key={empresa.id_empresa ?? empresa.nombre}
          className="border rounded-xl shadow-sm bg-white p-6 flex flex-col items-start hover:shadow-lg transform hover:-translate-y-1 transition"
        >
          <div className="flex items-center w-full">
            <img
              src={empresa.logo || "/default-logo.png"}
              alt={empresa.nombre}
              className="w-20 h-20 object-contain rounded-md mr-4"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{empresa.nombre}</h2>
              <p className="text-sm text-gray-500">{empresa.direccion}</p>
            </div>
            <div>
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">
                {empresa.estado ?? "activo"}
              </span>
            </div>
          </div>

          <div className="mt-4 w-full text-sm text-gray-700">
            <p><strong>NIT:</strong> {empresa.nit}</p>
            <p><strong>Email:</strong> {empresa.correo || empresa.email}</p>
            <p><strong>Teléfono:</strong> {empresa.telefono}</p>
            <p><strong>Municipio:</strong> {empresa.municipio?.nombre || empresa.municipio || "-"}</p>
          </div>

          <div className="mt-4 w-full flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select className="border rounded px-3 py-2">
                {listadoCategorias.length > 0 ? (
                  listadoCategorias.map((item) => (
                    <option value={item.id_categoria} key={`${item.nombre}-${item.id_categoria}`}>
                      {item.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay categorías</option>
                )}
              </select>
            </div>

            <button className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Ver más</button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default CardEmpresa;
