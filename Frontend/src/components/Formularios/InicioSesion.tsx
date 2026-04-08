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
      // En desarrollo no forzamos `Secure` para que el navegador acepte cookies sobre HTTP.
      const isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
      const securePart = isHttps ? ' SameSite=None; Secure' : '';
      const setCookie = (name: string, value: string) => {
        document.cookie = `${name}=${value}; path=/;${securePart}`;
      };
      setCookie('token', data.access_token);
      setCookie('rol', data.rol);
      setCookie('id_usuario', String(data.id_usuario));
      if (data.permisos) {
        try {
          const p = encodeURIComponent(JSON.stringify(data.permisos));
          setCookie('permisos', p);
        } catch (e) { console.warn('No se pudo setear permisos cookie', e); }
      }
      // Forzar recarga completa para que el servidor reciba las cookies recién creadas
      if (typeof window !== 'undefined') window.location.href = '/';
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
