import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect";

interface PublicidadFormProps {
  id_publicidad?: string;
}

export const PublicidadForm: React.FC<PublicidadFormProps> = ({ id_publicidad }) => {
  const [id_empresa, setIdEmpresa] = useState<number>(0);
  const [tipo_anuncio, setTipoAnuncio] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [duracion, setDuracion] = useState<number>(0);
  const [fecha_inicio, setFechaInicio] = useState<string>("");
  const [fecha_fin, setFechaFin] = useState<string>("");

  useEffect(() => {
    if (id_publicidad) {
      fetchPublicidad();
    }
  }, [id_publicidad]);

  const fetchPublicidad = async (): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/publicidades/${id_publicidad}`
      );
      const data = response.data;
      setIdEmpresa(data.id_empresa);
      setTipoAnuncio(data.tipo_anuncio);
      setDescripcion(data.descripcion);
      setDuracion(data.duracion);
      setFechaInicio(data.fecha_inicio);
      setFechaFin(data.fecha_fin);
    } catch (error) {
      console.error("Error fetching publicidad:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data = {
      id_empresa,
      tipo_anuncio,
      descripcion,
      duracion,
      fecha_inicio,
      fecha_fin,
    };

    try {
      if (id_publicidad) {
        await axios.put(`http://localhost:8000/publicidades/${id_publicidad}`, data);
      } else {
        await axios.post("http://localhost:8000/publicidades/", data);
      }
      navigate("/admin/publicidad");
    } catch (error) {
      console.error("Error saving publicidad:", error);
    }
  };

  const handleDuracionChange = (value: number) => {
    if (value < 0) {
      alert("La duración no puede ser negativa.");
      return;
    }
    setDuracion(value);
  };

  const handleFechaFinChange = (value: string) => {
    if (new Date(value) < new Date(fecha_inicio)) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }
    setFechaFin(value);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_publicidad ? "Editar Publicidad" : "Crear Publicidad"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="id_empresa" className="block text-sm font-medium text-gray-700">
            Empresa:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/empresas"
            value={id_empresa}
            onChange={(value) => setIdEmpresa(Number(value))}
            labelKey="nombre"
            valueKey="id_empresa"
            placeholder="Seleccione una empresa"
          />
        </div>
        <div>
          <label htmlFor="tipo_anuncio" className="block text-sm font-medium text-gray-700">
            Tipo de Anuncio:
          </label>
          <input
            type="text"
            id="tipo_anuncio"
            value={tipo_anuncio}
            onChange={(e) => setTipoAnuncio(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción:
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="duracion" className="block text-sm font-medium text-gray-700">
            Duración (en días):
          </label>
          <input
            type="number"
            id="duracion"
            value={duracion}
            onChange={(e) => handleDuracionChange(Number(e.target.value))}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">
            Fecha de Inicio:
          </label>
          <input
            type="datetime-local"
            id="fecha_inicio"
            value={fecha_inicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">
            Fecha de Fin:
          </label>
          <input
            type="datetime-local"
            id="fecha_fin"
            value={fecha_fin}
            onChange={(e) => handleFechaFinChange(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/publicidad")}
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
