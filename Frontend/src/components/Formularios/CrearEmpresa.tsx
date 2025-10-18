import React, { useState } from "react";
import "../../styles/form.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { AxiosError } from "axios";
import { navigate } from "astro:transitions/client";

type Props = {
  listaMunicipios: any[];
  listaCategoria: any[];
  initialValue: any;
  id: string | undefined;
};

export function CrearEmpresa({
  listaCategoria,
  listaMunicipios,
  initialValue,
  id,
}: Props) {
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

    console.log({ formDataObj });

    try {
      if (id) {
        const { data } = await axiosInstance(`/empresas/${id}`, {
          method: "PUT",
          data: {
            ...formDataObj,
            id_categoria: +formDataObj.id_categoria,
            id_municipio: +formDataObj.id_municipio,
          },
        });
      } else {
        const { data } = await axiosInstance("/empresas", {
          method: "POST",
          data: {
            ...formDataObj,
            id_categoria: +formDataObj.id_categoria,
            id_municipio: +formDataObj.id_municipio,
          },
        });
      }

      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));

      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail || "Ocurrio un error inesperado.";

        setStatusForm((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
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
          defaultValue={initialValue?.nombre}
        />
      </div>
      <div className="content-input">
        <label htmlFor="nit">NIT</label>
        <input
          type="number"
          name="nit"
          required
          id="nit"
          placeholder="NIT"
          defaultValue={initialValue?.nit}
        />
      </div>

      <div className="content-input">
        <label htmlFor="correo">Correo electrónico</label>
        <input
          type="email"
          name="correo"
          required
          id="correo"
          placeholder="Correo electrónico"
          defaultValue={initialValue?.correo}
        />
      </div>

      <div className="content-input">
        <label htmlFor="direccion">Dirección</label>
        <input
          type="text"
          name="direccion"
          required
          id="direccion"
          placeholder="Direccion"
          defaultValue={initialValue?.direccion}
        />
      </div>
      <div className="content-input">
        <label htmlFor="logo">Logo</label>
        <input
          type="text"
          name="logo"
          id="logo"
          placeholder="Logo"
          required
          defaultValue={initialValue?.logo}
        />
      </div>
      <div className="content-input">
        <label htmlFor="telefono">Teléfono</label>
        <input
          type="number"
          name="telefono"
          required
          id="telefono"
          placeholder="Teléfono"
          defaultValue={initialValue?.telefono}
        />
      </div>

      <div className="content-input">
        <label htmlFor="categoria">Categoría</label>
        <select
          name="id_categoria"
          id="categoria"
          required
          defaultValue={initialValue?.id_categoria}
        >
          <option value={""}>Seleccione</option>

          {listaCategoria.map((item) => (
            <option
              value={item.id_categoria}
              key={`${item.nombre}-${item.id_categoria}`}
            >
              {item.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="content-input">
        <label htmlFor="municipio">Municipio</label>
        <select
          name="id_municipio"
          id="municipio"
          required
          defaultValue={initialValue?.id_municipio}
        >
          <option value={""}>Seleccione</option>

          {listaMunicipios.map((item) => (
            <option
              value={item.id_municipio}
              key={`${item.nombre}-${item.id_municipio}`}
            >
              {item.nombre}
            </option>
          ))}
        </select>
      </div>

      {statusForm.error && (
        <span className="error-form">{statusForm.error}</span>
      )}

      <div className="content-submit">
        <button type="submit" disabled={statusForm.isLoading}>
          {id ? "Guardar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
