
import React, { useState, useMemo, useEffect } from "react";
import { axiosInstance } from "../utils/axiosInstance";

export interface Producto {
  id_marketplace: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  estado: string;
  id_empresa: number;
  id_categoria?: number;
  fecha_publicacion?: string;
}

export function Marketplace({ rol = "user" }: { rol?: string }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [minPrecio, setMinPrecio] = useState(0);
  const [maxPrecio, setMaxPrecio] = useState(99999);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen_url: "",
    id_empresa: 1,
    id_categoria: 1,
    estado: "activo"
  });

  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/marketplace")
      .then((res: { data: Producto[] }) => setProductos(res.data))
      .catch(() => setError("No se pudo cargar el marketplace."))
      .finally(() => setLoading(false));
  }, []);

  const productosFiltrados = useMemo(() =>
    productos.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) &&
      p.precio >= minPrecio &&
      p.precio <= maxPrecio
    ), [productos, search, minPrecio, maxPrecio]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
  const res = await axiosInstance.post("/marketplace", form);
  setProductos([...productos, res.data]);
      setForm({ nombre: "", descripcion: "", precio: 0, imagen_url: "", id_empresa: 1, id_categoria: 1, estado: "activo" });
    } catch {
      setError("No se pudo crear el producto.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
  await axiosInstance.delete(`/marketplace/${id}`);
      setProductos(productos.filter(p => p.id_marketplace !== id));
    } catch {
      setError("No se pudo eliminar el producto.");
    }
    setLoading(false);
  };

  return (
    <section className="marketplace-section py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Marketplace</h2>
      {rol === "admin" && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg shadow p-4 mb-8 max-w-xl mx-auto flex flex-col gap-3">
          <h3 className="text-lg font-semibold mb-2">Agregar producto/servicio</h3>
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required className="border rounded px-3 py-2" />
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required className="border rounded px-3 py-2" />
          <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" required min={0} className="border rounded px-3 py-2" />
          <input name="imagen_url" value={form.imagen_url} onChange={handleChange} placeholder="URL de imagen" className="border rounded px-3 py-2" />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Agregar</button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      )}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-48"
        />
        <input
          type="number"
          placeholder="Precio mínimo"
          value={minPrecio}
          min={0}
          onChange={e => setMinPrecio(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrecio}
          min={0}
          onChange={e => setMaxPrecio(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
        />
      </div>
      {loading ? (
        <div className="text-center text-blue-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No se encontraron productos.</div>
          ) : (
            productosFiltrados.map((p) => (
              <div key={p.id_marketplace} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <img src={p.imagen_url} alt={p.nombre} className="w-32 h-32 object-cover rounded mb-4" />
                <h3 className="text-xl font-semibold mb-2">{p.nombre}</h3>
                <p className="text-gray-600 mb-2">{p.descripcion}</p>
                <p className="text-lg font-bold text-blue-600 mb-2">${p.precio}</p>
                <span className="text-sm text-gray-500 mb-2">ID Empresa: {p.id_empresa}</span>
                {rol === "admin" && (
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition mb-2" onClick={() => handleDelete(p.id_marketplace)}>Eliminar</button>
                )}
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Comprar</button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
