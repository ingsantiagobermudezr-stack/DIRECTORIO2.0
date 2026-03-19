import React, { useState } from "react";
import "../../styles/form.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { AxiosError } from "axios";
import { navigate } from "astro:transitions/client";

type Props = {
  id_usuario: string | undefined;
  id_empresa: string | undefined;
};

export function EnviarCalificacion({ id_usuario, id_empresa }: Props) {
  const [statusForm, setStatusForm] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }>({
    isLoading: false,
    error: null,
    success: false,
  });
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true }));

    const formData = new FormData(e.currentTarget);

    const formDataObj: Record<string, string> = {};
    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value as string;
    }

    try {
      const { data: _data } = await axiosInstance("/reviews", {
        method: "POST",
        data: {
          ...formDataObj,
          calificacion: +formDataObj.calificacion,
          id_empresa,
          id_usuario,
        },
      });
      console.log(_data);

      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));

      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const _message =
          error.response?.data?.detail || "Ocurrio un error inesperado.";

        setStatusForm((prev) => ({
          ...prev,
          isLoading: false,
          error: _message,
        }));
      }
    }
  };

  return (
    <form className="content-form" onSubmit={onSubmit}>
      <div className="content-input">
        <label htmlFor="calificacion">Calificación</label>
        <input
          type="number"
          name="calificacion"
          required
          id="calificacion"
          min={1}
          max={5}
          placeholder="Calificación"
        />
      </div>

      <div className="content-input">
        <label htmlFor="comentario">Comentario</label>
        <textarea
          name="comentario"
          required
          id="comentario"
          placeholder="Comentario"
          rows={4}
        />
      </div>

      {statusForm.error && (
        <span className="error-form">{statusForm.error}</span>
      )}

      <div className="content-submit">
        <button type="submit" disabled={statusForm.isLoading}>
          Enviar
        </button>
      </div>
    </form>
  );
}
