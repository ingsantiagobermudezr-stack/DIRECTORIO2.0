import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";

// Definición del tipo de las props del componente
interface CategoriaFormProps {
  id_categoria?: string; // id_categoria puede ser undefined si estamos creando una categoría
}

// Definición del tipo para los datos de la categoría
interface Categoria {
  nombre: string;
  descripcion: string;
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({ id_categoria }) => {
  const [nombre, setNombre] = useState<string>(""); // Estado para el nombre
  const [descripcion, setDescripcion] = useState<string>(""); // Estado para la descripción

  useEffect(() => {
    if (id_categoria) {
      fetchCategoria();
    }
  }, [id_categoria]);

  // Función para obtener la categoría existente (solo en edición)
  const fetchCategoria = async (): Promise<void> => {
    try {
      const response = await axios.get<Categoria>(
        `http://localhost:8000/categorias/${id_categoria}`
      );
      setNombre(response.data.nombre);
      setDescripcion(response.data.descripcion);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const data: Categoria = { nombre, descripcion };

    try {
      if (id_categoria) {
        // Editar categoría
        await axios.put(`http://localhost:8000/categorias/${id_categoria}`, data);
      } else {
        // Crear nueva categoría
        await axios.post("http://localhost:8000/categorias/", data);
      }
      window.location.href = "/"; // Redirige al listado de categorías
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    if (id === "nombre") setNombre(value);
    if (id === "descripcion") setDescripcion(value);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_categoria ? "Editar Categoría" : "Crear Categoría"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={handleInputChange}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción:
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full mt-1 px-3 py-1.5 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/categoria")}
            className="px-3 py-1 text-sm font-medium bg-red-500 text-white border rounded-md hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
