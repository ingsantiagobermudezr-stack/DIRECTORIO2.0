import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import {
  Plus,
  Edit,
  Trash,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Define la interfaz para la categoría
interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export const CategoriaAdmin: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategorias();
  }, [currentPage, searchTerm]);

  const fetchCategorias = async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await axios.get<Categoria[]>(
        `http://localhost:8000/categorias/?skip=${skip}&limit=${itemsPerPage}`
      );
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const deleteCategoria = async (id_categoria: number) => {
    try {
      await axios.delete(`http://localhost:8000/categorias/${id_categoria}`);
      fetchCategorias();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredCategorias = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Administrar Categorías
      </h1>
      <div className="flex justify-between items-center mb-4">
        <button
          title="Crear nueva categoría"
          onClick={() => navigate("/admin/categoria/agregar")}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-yellow-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-yellow-400 bg-yellow-50 rounded-lg shadow">
          <thead className="bg-yellow-200">
            <tr>
              <th className="px-4 py-2 border border-yellow-400 text-left">
                ID
              </th>
              <th className="px-4 py-2 border border-yellow-400 text-left">
                Nombre
              </th>
              <th className="px-4 py-2 border border-yellow-400 text-left">
                Descripción
              </th>
              <th className="px-4 py-2 border border-yellow-400 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCategorias.map((categoria) => (
              <tr key={categoria.id_categoria} className="hover:bg-yellow-100">
                <td className="px-4 py-2 border border-yellow-400">
                  {categoria.id_categoria}
                </td>
                <td className="px-4 py-2 border border-yellow-400">
                  {categoria.nombre}
                </td>
                <td className="px-4 py-2 border border-yellow-400">
                  {categoria.descripcion}
                </td>
                <td className="px-4 py-2 border border-yellow-400 space-x-2 flex">
                  <button
                    title="Editar categoría"
                    onClick={() =>
                      navigate(`/admin/categoria/editar/${categoria.id_categoria}`)
                    }
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    title="Eliminar categoría"
                    onClick={() => deleteCategoria(categoria.id_categoria)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-red-200 transition"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          title="Primera página"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            currentPage === 1
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-400 text-gray-700 hover:bg-yellow-200"
          }`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          title="Página anterior"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            currentPage === 1
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-400 text-gray-700 hover:bg-yellow-200"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          title="Página siguiente"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={categorias.length < itemsPerPage}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            categorias.length < itemsPerPage
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-400 text-gray-700 hover:bg-yellow-200"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          title="Última página"
          onClick={() => setCurrentPage(Math.ceil(100 / itemsPerPage))}
          disabled={categorias.length < itemsPerPage}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            categorias.length < itemsPerPage
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-400 text-gray-700 hover:bg-yellow-200"
          }`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
