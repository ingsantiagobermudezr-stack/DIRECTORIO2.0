
import React, { useState, useMemo, useEffect } from "react";
import { axiosInstance } from "../utils/axiosInstance";
import type { MarketplaceResponse } from "../types/marketplace";
import "../styles/marketplace.css";
import "../styles/botones.css";
import Button from "./commons/Button";

export function Marketplace({ rol = "user", productos: initialProductos = [] }: { rol?: string; productos?: MarketplaceResponse[] }) {
  const [productos, setProductos] = useState<MarketplaceResponse[]>(initialProductos as MarketplaceResponse[]);
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

  const handleBuy = (id:number) => {
    // placeholder - implementar flujo de compra
    try {
      window.alert('Función de compra aún no implementada');
    } catch (e) {
      console.log('Compra:', e);
    }
  };

  const formatPrice = (value?: number | null) => {
    try {
      return (value ?? 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });
    } catch {
      return `$${value ?? 0}`;
    }
  };

  return (
    <section className="marketplace-section py-8 px-4" aria-label="Marketplace">
      <h2 className="text-3xl font-bold mb-6 text-center">Marketplace</h2>
      {rol === "admin" && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg shadow p-4 mb-8 max-w-xl mx-auto flex flex-col gap-3">
          <h3 className="text-lg font-semibold mb-2">Agregar producto/servicio</h3>
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required className="border rounded px-3 py-2" />
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required className="border rounded px-3 py-2" />
          <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" required min={0} className="border rounded px-3 py-2" />
          <input name="imagen_url" value={form.imagen_url} onChange={handleChange} placeholder="URL de imagen" className="border rounded px-3 py-2" />
          <Button type="submit" variant="primary">Agregar</Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      )}
      <div className="marketplace-filters">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-48"
          aria-label="Buscar productos"
        />
        <input
          type="number"
          placeholder="Precio mínimo"
          value={minPrecio}
          min={0}
          onChange={e => setMinPrecio(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
          aria-label="Precio mínimo"
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrecio}
          min={0}
          onChange={e => setMaxPrecio(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
          aria-label="Precio máximo"
        />
      </div>
      {loading ? (
        <div className="text-center text-blue-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mp-grid">
          {productosFiltrados.length === 0 ? (
            <div className="mp-empty">No se encontraron productos.</div>
          ) : (
            productosFiltrados.map((p) => (
              <article key={p.id_marketplace} className="mp-card" role="article" aria-labelledby={`mp-${p.id_marketplace}`}>
                <img src={p.imagen_url || 'https://via.placeholder.com/160x120?text=Sin+imagen'} alt={p.nombre || 'Imagen del producto'} />
                <h3 id={`mp-${p.id_marketplace}`} className="mp-name">{p.nombre}</h3>
                <p className="mp-desc">{p.descripcion}</p>
                <div className="mp-price">{formatPrice(p.precio ?? 0)}</div>
                <span className="text-sm text-gray-500 mb-2">ID Empresa: {p.id_empresa}</span>
                <div className="mp-actions">
                  {rol === "admin" && (
                    <Button ariaLabel={`Eliminar ${p.nombre}`} variant="delete" onClick={() => handleDelete(p.id_marketplace)}>Eliminar</Button>
                  )}
                  <Button ariaLabel={`Comprar ${p.nombre}`} variant="secondary" onClick={() => handleBuy(p.id_marketplace)}>Comprar</Button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
