import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Plus,
  Edit,
  Trash,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TableAdminProps {
  tableName: string;
  columns: { key: string; label: string }[];
  endpoint: string;
  primaryKey: string; // Propiedad personalizada para especificar la clave primaria
  onEdit?: (id: number) => void;
  onDelete?: (item: any) => void;
  onCreate?: () => void;
}

export const TableAdmin: React.FC<TableAdminProps> = ({
  tableName,
  columns,
  endpoint,
  primaryKey,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await axiosInstance.get<any[]>(`${endpoint}`, { params: { skip, limit: itemsPerPage } });
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`${endpoint}/${id}`);
      fetchData();
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error(`Error deleting ${tableName} entry:`, error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) =>
    columns.some((col) =>
      item[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-8 min-h-screen">

      <button
      className="relative top-8 left-4"
        title="Volver a Admin"
      >
        <a href="/admin" className="flex gap-4 items-center justify-center w-10 h-10 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition">
          <ChevronLeft className="w-6 h-6" />
        </a>
      </button>
      <h1 className="text-center text-3xl font-bold mb-6 text-gray-700">
        Administrar {tableName}
      </h1>

      <div className="flex justify-between items-center mb-4">
        {onCreate && (
          <button
            title={`Crear nuevo ${tableName}`}
            onClick={onCreate}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        <input
          type="text"
          placeholder={`Buscar ${tableName}...`}
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-yellow-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-yellow-400 bg-yellow-50 rounded-lg shadow">
          <thead className="bg-yellow-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 border border-yellow-400 text-left"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2 border border-yellow-400 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item[primaryKey]} className="hover:bg-yellow-100">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 border border-yellow-400"
                  >
                    {item[col.key]}
                  </td>
                ))}
                <td className="px-4 py-2 border border-yellow-400 space-x-2 flex">
                  {onEdit && (
                    <button
                      title={`Editar ${tableName}`}
                      onClick={() => onEdit(item[primaryKey])}
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    title={`Eliminar ${tableName}`}
                    onClick={() => handleDelete(item[primaryKey])}
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
          disabled={data.length < itemsPerPage}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            data.length < itemsPerPage
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-gray-400 text-gray-700 hover:bg-yellow-200"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          title="Última página"
          onClick={() => setCurrentPage(Math.ceil(100 / itemsPerPage))}
          disabled={data.length < itemsPerPage}
          className={`flex items-center justify-center w-8 h-8 rounded-full border ${
            data.length < itemsPerPage
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
