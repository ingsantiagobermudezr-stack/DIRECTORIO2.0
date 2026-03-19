import React, { useState } from "react";
import "../../styles/form.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { AxiosError } from "axios";
import { navigate } from "astro:transitions/client";

export function InicioSesion() {
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
      const { data } = await axiosInstance("/signin", {
        method: "POST",
        data: formDataObj,
      });
      console.log({ data });
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));
      document.cookie = `token=${data.access_token};  path=/; SameSite=None; Secure`;
      document.cookie = `rol=${data.rol};  path=/; SameSite=None; Secure`;
      document.cookie = `id_usuario=${data.id_usuario};  path=/; SameSite=None; Secure`;
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
        <label htmlFor="correo_electronico">Correo electrónico</label>
        <input
          type="email"
          name="correo"
          required
          id="correo_electronico"
          placeholder="Correo electrónico"
        />
      </div>
      <div className="content-input">
        <label htmlFor="contrasenia">Contraseña</label>
        <input
          type="password"
          name="password"
          required
          id="contrasenia"
          placeholder="********"
        />
      </div>

      {statusForm.error && (
        <span className="error-form">{statusForm.error}</span>
      )}

      <div className="content-submit">
        <button type="submit" disabled={statusForm.isLoading}>
          Iniciar sesión
        </button>
      </div>
    </form>
  );
}
