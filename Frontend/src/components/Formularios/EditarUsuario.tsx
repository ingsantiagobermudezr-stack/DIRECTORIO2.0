import React, { useState } from "react";
import "../../styles/form.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { AxiosError } from "axios";
import { navigate } from "astro:transitions/client";

type Props = {
  defaultValues: {
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
  };
  idUser: string;
};

export function EditarUsuario({ defaultValues, idUser }: Props) {
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
      if (!value) continue;
      formDataObj[key] = value as string;
    }

    try {
      const { data: _data } = await axiosInstance(`/usuarios/${idUser}`, {
        method: "PUT",
        data: formDataObj,
      });

      // Actualizar la cookie del rol
      if (formDataObj.rol) {
        document.cookie = `rol=${formDataObj.rol}; path=/;`;

        // Emitir un evento personalizado para actualizar el header
        const event = new CustomEvent("rolActualizado", {
          detail: { nuevoRol: formDataObj.rol },
        });
        window.dispatchEvent(event);
      }

      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));

      navigate("/"); // Navega a la página principal
    } catch (error) {
      if (error instanceof AxiosError) {
        const _message =
          error.response?.data?.detail || "Ocurrió un error inesperado.";

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
        <label htmlFor="nombre">Nombre</label>
        <input
          type="text"
          name="nombre"
          required
          id="nombre"
          placeholder="Nombre"
          defaultValue={defaultValues.nombre}
        />
      </div>
      <div className="content-input">
        <label htmlFor="apellido">Apellidos</label>
        <input
          type="text"
          name="apellido"
          required
          id="apellido"
          placeholder="Apellidos"
          defaultValue={defaultValues.apellido}
        />
      </div>

      <div className="content-input">
        <label htmlFor="correo_electronico">Correo electrónico</label>
        <input
          type="email"
          name="correo"
          required
          id="correo_electronico"
          placeholder="Correo electrónico"
          defaultValue={defaultValues.correo}
        />
      </div>
      <div className="content-input">
        <label htmlFor="rol">Rol</label>
        <select name="rol" id="rol" defaultValue={defaultValues.rol}>
          <option value="">Seleccione</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {statusForm.error && (
        <span className="error-form">{statusForm.error}</span>
      )}

      <div className="content-submit">
        <button type="submit" disabled={statusForm.isLoading}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
