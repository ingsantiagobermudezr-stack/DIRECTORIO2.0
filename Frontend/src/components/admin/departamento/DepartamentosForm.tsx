import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";

// Definición del tipo de las props del componente
interface DepartamentoFormProps {
  id_departamento?: string; // id_departamento puede ser undefined si estamos creando un departamento
}

// Definición del tipo para los datos del departamento
interface Departamento {
  nombre: string;
}

export const DepartamentoForm: React.FC<DepartamentoFormProps> = ({ id_departamento }) => {
  const [nombre, setNombre] = useState<string>(""); // Estado para el nombre

  useEffect(() => {
    if (id_departamento) {
      fetchDepartamento();
    }
  }, [id_departamento]);

  // Función para obtener el departamento existente (solo en edición)
  const fetchDepartamento = async (): Promise<void> => {
    try {
      const response = await axios.get<Departamento>(
        `http://localhost:8000/departamentos/${id_departamento}`
      );
      setNombre(response.data.nombre);
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const data: Departamento = { nombre };

    try {
      if (id_departamento) {
        // Editar departamento
        await axios.put(`http://localhost:8000/departamentos/${id_departamento}`, data);
      } else {
        // Crear nuevo departamento
        await axios.post("http://localhost:8000/departamentos/", data);
      }
    navigate("/admin/departamentos"); // Redirige al listado de departamentos
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    if (id === "nombre") setNombre(value);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_departamento ? "Editar Departamento" : "Crear Departamento"}
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
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/departamentos")}
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
