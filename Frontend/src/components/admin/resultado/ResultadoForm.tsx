import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect";

interface ResultadoFormProps {
  id_resultado?: string;
}

interface Resultado {
  id_usuario: number;
  criterio: string;
  fecha_hora: string;
}

export const ResultadoForm: React.FC<ResultadoFormProps> = ({ id_resultado }) => {
  const [id_usuario, setIdUsuario] = useState<number | null>(null);
  const [criterio, setCriterio] = useState<string>("");
  const [fecha_hora, setFechaHora] = useState<string>("");

  useEffect(() => {
    if (id_resultado) {
      fetchResultado();
    }
  }, [id_resultado]);

  const fetchResultado = async (): Promise<void> => {
    try {
      const response = await axios.get<Resultado>(
        `http://localhost:8000/resultados/${id_resultado}`
      );
      const data = response.data;
      setIdUsuario(data.id_usuario);
      setCriterio(data.criterio);
      setFechaHora(data.fecha_hora);
    } catch (error) {
      console.error("Error fetching resultado:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data: Resultado = { id_usuario: id_usuario!, criterio, fecha_hora };
    try {
      if (id_resultado) {
        await axios.put(`http://localhost:8000/resultados/${id_resultado}`, data);
      } else {
        await axios.post("http://localhost:8000/resultados/", data);
      }
      navigate("/admin/resultados");
    } catch (error) {
      console.error("Error saving resultado:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_resultado ? "Editar Resultado" : "Crear Resultado"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="id_usuario" className="block text-sm font-medium text-gray-700">
            Usuario:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/usuarios"
            value={id_usuario}
            onChange={(value) => setIdUsuario(Number(value))}
            labelKey="nombre" // Asegúrate de que el backend envíe un campo "nombre" para los usuarios
            valueKey="id_usuario"
            placeholder="Seleccione un usuario"
          />
        </div>
        <div>
          <label htmlFor="criterio" className="block text-sm font-medium text-gray-700">
            Criterio:
          </label>
          <input
            type="text"
            id="criterio"
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="fecha_hora" className="block text-sm font-medium text-gray-700">
            Fecha y Hora:
          </label>
          <input
            type="datetime-local"
            id="fecha_hora"
            value={fecha_hora}
            onChange={(e) => setFechaHora(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/resultados")}
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
