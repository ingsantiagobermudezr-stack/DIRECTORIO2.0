import React, { useState, useEffect } from "react";
import axios from "axios";
import { navigate } from "astro:transitions/client";

interface UsuarioFormProps {
  id_usuario?: string;
}

interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: string;
  password: string;
}

export const UsuarioForm: React.FC<UsuarioFormProps> = ({ id_usuario }) => {
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [rol, setRol] = useState<string>("user");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (id_usuario) {
      fetchUsuario();
    }
  }, [id_usuario]);

  const fetchUsuario = async (): Promise<void> => {
    try {
      const response = await axios.get<Usuario>(
        `http://localhost:8000/usuarios/${id_usuario}`
      );
      const data = response.data;
      console.log(response.data)
      setNombre(data.nombre);
      setApellido(data.apellido);
      setCorreo(data.correo);
      setTelefono(data.telefono);
      setRol(data.rol);
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data: Usuario = { nombre, apellido, correo, telefono, rol, password };
    console.log("enviada", data)
    try {
      if (id_usuario) {
        await axios.put(`http://localhost:8000/usuarios/${id_usuario}`, data);
      } else {
        await axios.post("http://localhost:8000/usuarios/", data);
      }
      navigate("/admin/usuarios");
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {id_usuario ? "Editar Usuario" : "Crear Usuario"}
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
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
            Apellido:
          </label>
          <input
            type="text"
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
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
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
            Rol:
          </label>
          <select
            id="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            required
            className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {!id_usuario && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/usuarios")}
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
