import React, { useRef, useState } from "react";
import { MdBusiness } from "react-icons/md";
import "../styles/form.css";
import { axiosInstance } from "../utils/axiosInstance";
import { AxiosError } from "axios";

type Categoria = {
  nombre: string;
  descripcion: string;
  id_categoria: number;
};

type FormCategoria = {
  id_categoria?: number;
} & Omit<Categoria, "id_categoria">;
type Props = {
  categorias: Categoria[];
};

const initialValue: FormCategoria = {
  descripcion: "",
  nombre: "",
};

export function ListadoCategorias({ categorias }: Props) {
  const [list, setList] = useState<Categoria[]>(categorias);
  const [formData, setFormData] = useState<FormCategoria>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [onDeleting, setOnDeleting] = useState<number | null>(null);

  const form = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataUser = new FormData(e.currentTarget);

    const formDataObj: Record<string, string> = {};
    for (let [key, value] of formDataUser.entries()) {
      if (!value) continue;
      formDataObj[key] = value as string;
    }

    console.log(formDataObj);
    try {
      if (!isEdit) {
        // TODO: crear
        const { data } = await axiosInstance(`/categorias/`, {
          method: "POST",
          data: formDataObj,
        });

        setList((prev) => [...prev, data]);
      } else {
        // TODO: editar
        const { data: _data } = await axiosInstance(
          `/categorias/${formData.id_categoria}`,
          {
            method: "PUT",
            data: formDataObj,
          }
        );

        const setDataById = list.map((item) => {
          if (item.id_categoria === formData.id_categoria) {
            item.descripcion = formDataObj.descripcion;
            item.nombre = formDataObj.nombre;
          }
          return item;
        });
        setList(setDataById);
        setIsEdit(false);
        setFormData(initialValue);
      }

      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.detail || "Ocurrio un error inesperado.");
      }
    } finally {
      if (form.current) {
        form.current.reset();
      }
    }
  };

  const onDelete = async (id: number) => {
    setOnDeleting(id);
    const { data: _data } = await axiosInstance(`/categorias/${id}`, {
      method: "DELETE",
    });

    setList(list.filter((item) => item.id_categoria !== id));
    setOnDeleting(null);
  };

  return (
    <div className="content-crud">
      <form className="content-form" onSubmit={onSubmit} ref={form}>
        <div className="content-input">
          <label htmlFor="nombre" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
            <MdBusiness style={{fontSize: '1.1rem', color: '#FFC107'}} /> Nombre
          </label>
          <input
            type="text"
            name="nombre"
            required
            id="nombre"
            placeholder="Nombre"
            defaultValue={formData.nombre}
          />
        </div>
        <div className="content-input">
          <label htmlFor="descripcion">Descripción</label>
          <input
            type="text"
            name="descripcion"
            required
            id="descripcion"
            placeholder="Descripcion"
            defaultValue={formData.descripcion}
          />
        </div>

        <div className="content-submit">
          <button type="submit" disabled={isLoading}>
            Guardar
          </button>
          {isEdit && (
            <button
              type="submit"
              disabled={isLoading}
              className="cancel-action"
              onClick={() => {
                setIsEdit(false);
                setFormData(initialValue);
                if (form.current) {
                  form.current.reset();
                }
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table_component">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!!list.length ? (
              list.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.nombre} </td>
                  <td>{categoria.descripcion}</td>
                  <td>
                    <div className="content-action-table">
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setFormData(categoria);
                          if (form.current) {
                            form.current.reset();
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-pencil"
                        >
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(categoria.id_categoria)}>
                        {onDeleting === categoria.id_categoria ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-loader-circle spinner"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="submit"
          disabled={isLoading}
          className="cancel-action btn-regresar"
          onClick={() => {
            history.back();
          }}
        >
          Regresar
        </button>
      </div>
    </div>
  );
}
