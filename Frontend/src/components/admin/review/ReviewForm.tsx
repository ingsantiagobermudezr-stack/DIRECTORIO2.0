import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect"; // Asegúrate de que esta ruta sea correcta

interface ReviewFormProps {
  id_review?: string;
}

interface Review {
  id_empresa: number;
  id_usuario: number;
  comentario: string;
  calificacion: number;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ id_review }) => {
  const [id_empresa, setIdEmpresa] = useState<number | null>(null);
  const [id_usuario, setIdUsuario] = useState<number | null>(null);
  const [comentario, setComentario] = useState<string>("");
  const [calificacion, setCalificacion] = useState<number>(0);

  useEffect(() => {
    if (id_review) {
      fetchReview();
    }
  }, [id_review]);

  const fetchReview = async (): Promise<void> => {
    try {
      const response = await axios.get<Review>(
        `http://localhost:8000/reviews/${id_review}`
      );
      const data = response.data;
      setIdEmpresa(data.id_empresa);
      setIdUsuario(data.id_usuario);
      setComentario(data.comentario);
      setCalificacion(data.calificacion);
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data: Review = { id_empresa: id_empresa!, id_usuario: id_usuario!, comentario, calificacion };
    try {
      if (id_review) {
        await axios.put(`http://localhost:8000/reviews/${id_review}`, data);
      } else {
        await axios.post("http://localhost:8000/reviews/", data);
      }
      navigate("/admin/reviews");
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  const handleCalificacionChange = (value: number) => {
    if (value < 0 || value > 5) {
      alert("La calificación debe estar entre 0 y 5.");
      return;
    }
    setCalificacion(value);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_review ? "Editar Review" : "Crear Review"}
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
          <label htmlFor="id_usuario" className="block text-sm font-medium text-gray-700">
            Usuario:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/usuarios"
            value={id_usuario}
            onChange={(value) => setIdUsuario(Number(value))}
            labelKey="nombre"
            valueKey="id_usuario"
            placeholder="Seleccione un usuario"
          />
        </div>
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
            Comentario:
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="calificacion" className="block text-sm font-medium text-gray-700">
            Calificación (0-5):
          </label>
          <input
            type="number"
            id="calificacion"
            value={calificacion}
            onChange={(e) => handleCalificacionChange(Number(e.target.value))}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/reviews")}
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
