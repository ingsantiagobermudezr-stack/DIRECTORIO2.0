import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect";

interface EmpresaFormProps {
  id_empresa?: string;
}

export const EmpresaForm: React.FC<EmpresaFormProps> = ({ id_empresa }) => {
  const [nombre, setNombre] = useState<string>("");
  const [nit, setNit] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [id_categoria, setIdCategoria] = useState<number>(0);
  const [id_municipio, setIdMunicipio] = useState<number>(0);
  const [logo, setLogo] = useState<string>("");

  useEffect(() => {
    if (id_empresa) {
      fetchEmpresa();
    }
  }, [id_empresa]);

  const fetchEmpresa = async (): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/empresas/${id_empresa}`
      );
      const data = response.data;
      setNombre(data.nombre || "");
      setNit(data.nit || "");
      setCorreo(data.correo || "");
      setDireccion(data.direccion || "");
      setTelefono(data.telefono || "");
      setIdCategoria(data.id_categoria || 0);
      setIdMunicipio(data.id_municipio || 0);
      setLogo(data.logo || "");
    } catch (error) {
      console.error("Error fetching empresa:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data = {
      nombre,
      nit,
      correo,
      direccion,
      telefono,
      id_categoria,
      id_municipio,
      logo,
    };
    try {
      if (id_empresa) {
        await axios.put(`http://localhost:8000/empresas/${id_empresa}`, data);
      } else {
        await axios.post("http://localhost:8000/empresas/", data);
      }
      navigate("/admin/empresas");
    } catch (error) {
      console.error("Error saving empresa:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_empresa ? "Editar Empresa" : "Crear Empresa"}
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
          <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
            NIT:
          </label>
          <input
            type="text"
            id="nit"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
            Correo:
          </label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
            Dirección:
          </label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono:
          </label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">
            Categoría:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/categorias"
            value={id_categoria}
            onChange={(value) => setIdCategoria(Number(value))}
            labelKey="nombre"
            valueKey="id_categoria"
            placeholder="Seleccione una categoría"
          />
        </div>
        <div>
          <label htmlFor="id_municipio" className="block text-sm font-medium text-gray-700">
            Municipio:
          </label>
          <ForeignKeySelect
            endpoint="http://localhost:8000/municipios"
            value={id_municipio}
            onChange={(value) => setIdMunicipio(Number(value))}
            labelKey="nombre"
            valueKey="id_municipio"
            placeholder="Seleccione un municipio"
          />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo (URL):
          </label>
          <input
            type="text"
            id="logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/empresas")}
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
