import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect"; // Asegúrate de que esta ruta sea correcta

interface MunicipioFormProps {
  id_municipio?: string;
}

interface Municipio {
  nombre: string;
  id_departamento: number;
}

export const MunicipioForm: React.FC<MunicipioFormProps> = ({ id_municipio }) => {
  const [nombre, setNombre] = useState<string>("");
  const [id_departamento, setIdDepartamento] = useState<number | null>(null);

  useEffect(() => {
    if (id_municipio) {
      fetchMunicipio();
    }
  }, [id_municipio]);

  const fetchMunicipio = async (): Promise<void> => {
    try {
      const response = await axios.get<Municipio>(
        `http://localhost:8000/municipios/${id_municipio}`
      );
      setNombre(response.data.nombre);
      setIdDepartamento(response.data.id_departamento);
    } catch (error) {
      console.error("Error fetching municipality:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data: Municipio = { nombre, id_departamento: id_departamento! };
    try {
      if (id_municipio) {
        await axios.put(`http://localhost:8000/municipios/${id_municipio}`, data);
      } else {
        await axios.post("http://localhost:8000/municipios/", data);
      }
      navigate("/admin/municipios");
    } catch (error) {
      console.error("Error saving municipality:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_municipio ? "Editar Municipio" : "Crear Municipio"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label
            htmlFor="id_departamento"
            className="block text-sm font-medium text-gray-700"
          >
            Departamento:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/departamentos"
            value={id_departamento}
            onChange={(value) => setIdDepartamento(Number(value))}
            labelKey="nombre"
            valueKey="id_departamento"
            placeholder="Seleccione un departamento"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/municipios")}
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
