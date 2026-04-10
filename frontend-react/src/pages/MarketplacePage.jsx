import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, catalogosApi, empresasApi, marketplaceApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { PermissionGate } from "../components/common/PermissionGate";

export function MarketplacePage({ readOnly = false }) {
  const { pushToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialEmpresaId = searchParams.get("id_empresa") || "";
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filtros, setFiltros] = useState({
    id_empresa: initialEmpresaId,
    id_categoria: "",
    id_estado: "",
    precio_min: "",
    precio_max: "",
    ordenar: "fecha_publicacion",
    solo_mis_productos: false,
  });
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [imagenesArchivos, setImagenesArchivos] = useState([]);
  const [editForm, setEditForm] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_empresa: "",
    id_categoria: "",
    id_estado: "",
  });
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "", id_empresa: "", id_categoria: "", id_estado: "" });

  const marketplace = useAsyncData(async () => {
    const params = {
      search: search || undefined,
      limit: 50,
      id_empresa: filtros.id_empresa || undefined,
      id_categoria: filtros.id_categoria || undefined,
      id_estado: filtros.id_estado || undefined,
      precio_min: filtros.precio_min || undefined,
      precio_max: filtros.precio_max || undefined,
      ordenar: filtros.ordenar || "fecha_publicacion",
    };

    const { data } = !readOnly && filtros.solo_mis_productos
      ? await marketplaceApi.misProductos(params)
      : await marketplaceApi.list(params);

    return data;
  }, `${search}-${JSON.stringify(filtros)}`);

  const empresas = useAsyncData(async () => {
    if (readOnly) {
      return (await empresasApi.list({ limit: 200 })).data;
    }

    try {
      return (await empresasApi.misEmpresas({ limit: 200 })).data;
    } catch {
      return (await empresasApi.list({ limit: 200 })).data;
    }
  });

  const categorias = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const estados = useAsyncData(async () => (await catalogosApi.estadosMarketplace({ limit: 100 })).data);

  const crearProducto = async (event) => {
    event.preventDefault();
    try {
      await marketplaceApi.create({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        id_empresa: Number(form.id_empresa),
        id_categoria: Number(form.id_categoria),
        id_estado: form.id_estado ? Number(form.id_estado) : null,
      });
      pushToast({ title: "Producto creado", message: "Alta de marketplace exitosa", type: "success" });
      setForm({ nombre: "", descripcion: "", precio: "", stock: "", id_empresa: "", id_categoria: "", id_estado: "" });
      marketplace.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const cargarDetalle = async (idMarketplace) => {
    try {
      const { data } = await marketplaceApi.get(idMarketplace);
      setProductoDetalle(data);
      setEditForm({
        id: data.id,
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: String(data.precio ?? ""),
        stock: String(data.stock ?? ""),
        id_empresa: String(data.id_empresa || data.empresa?.id || ""),
        id_categoria: String(data.id_categoria || data.categoria?.id || ""),
        id_estado: String(data.id_estado || data.estado?.id || ""),
      });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar detalle", type: "error" });
    }
  };

  const actualizarProducto = async (event) => {
    event.preventDefault();
    try {
      await marketplaceApi.update(Number(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
        id_empresa: Number(editForm.id_empresa),
        id_categoria: Number(editForm.id_categoria),
        id_estado: editForm.id_estado ? Number(editForm.id_estado) : null,
      });
      pushToast({ title: "Producto actualizado", message: "Cambios guardados", type: "success" });
      await cargarDetalle(Number(editForm.id));
      marketplace.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminarProducto = async (idMarketplace) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar este producto?");
    if (!confirmado) {
      return;
    }
    try {
      await marketplaceApi.remove(idMarketplace);
      pushToast({ title: "Producto eliminado", message: `Producto ${idMarketplace} desactivado`, type: "success" });
      if (Number(editForm.id) === Number(idMarketplace)) {
        setProductoDetalle(null);
      }
      marketplace.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const subirImagenes = async () => {
    if (!editForm.id || !imagenesArchivos.length) {
      pushToast({ title: "Dato requerido", message: "Selecciona un producto y al menos una imagen", type: "error" });
      return;
    }
    try {
      await marketplaceApi.uploadImagenes(Number(editForm.id), imagenesArchivos);
      pushToast({ title: "Imágenes subidas", message: "Carga de archivos exitosa", type: "success" });
      setImagenesArchivos([]);
      await cargarDetalle(Number(editForm.id));
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudieron subir imágenes", type: "error" });
    }
  };

  const registrarClick = async (idMarketplace) => {
    try {
      await marketplaceApi.click(idMarketplace);
      pushToast({ title: "Tracking", message: `Click registrado para producto ${idMarketplace}`, type: "success" });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo registrar click", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Marketplace</h3>
        {readOnly ? (
          <p className="mt-1 text-sm text-slate-600">Explora articulos de empresas publicadas. Para chatear con vendedores, inicia sesion.</p>
        ) : null}
        <div className="mt-3 flex gap-2">
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Buscar producto" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={marketplace.reload}>Refrescar</button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={filtros.id_empresa} onChange={(e) => setFiltros((prev) => ({ ...prev, id_empresa: e.target.value }))}>
            <option value="">Empresa</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={filtros.id_categoria} onChange={(e) => setFiltros((prev) => ({ ...prev, id_categoria: e.target.value }))}>
            <option value="">Categoría</option>
            {(categorias.data || []).map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={filtros.id_estado} onChange={(e) => setFiltros((prev) => ({ ...prev, id_estado: e.target.value }))}>
            <option value="">Estado</option>
            {(estados.data || []).map((estado) => (
              <option key={estado.id} value={estado.id}>{estado.nombre}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={filtros.ordenar} onChange={(e) => setFiltros((prev) => ({ ...prev, ordenar: e.target.value }))}>
            <option value="fecha_publicacion">Ordenar: fecha</option>
            <option value="precio">Ordenar: precio</option>
            <option value="nombre">Ordenar: nombre</option>
          </select>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Precio mínimo" type="number" value={filtros.precio_min} onChange={(e) => setFiltros((prev) => ({ ...prev, precio_min: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Precio máximo" type="number" value={filtros.precio_max} onChange={(e) => setFiltros((prev) => ({ ...prev, precio_max: e.target.value }))} />
          {!readOnly ? (
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={filtros.solo_mis_productos} onChange={(e) => setFiltros((prev) => ({ ...prev, solo_mis_productos: e.target.checked }))} />
              Mostrar solo mis productos
            </label>
          ) : null}
        </div>
      </div>

      {marketplace.loading ? <Loading /> : null}
      {!marketplace.loading && (marketplace.data || []).length === 0 ? (
        <EmptyState
          title="Sin productos"
          description={readOnly ? "No hay articulos disponibles para los filtros seleccionados." : "Publica el primer producto del marketplace."}
        />
      ) : null}
      {!marketplace.loading && (marketplace.data || []).length > 0 ? (
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { 
              key: "nombre", 
              label: "Producto",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-900">{row.nombre}</p>
                  {row.categoria?.nombre && (
                    <span className="inline-block mt-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {row.categoria.nombre}
                    </span>
                  )}
                </div>
              ),
            },
            { 
              key: "precio", 
              label: "Precio",
              render: (row) => (
                <span className="font-bold text-slate-900">
                  {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(row.precio ?? 0)}
                </span>
              ),
            },
            { 
              key: "stock", 
              label: "Stock",
              render: (row) => (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  row.stock === 0 ? "bg-red-100 text-red-700" : row.stock <= 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    row.stock === 0 ? "bg-red-500" : row.stock <= 5 ? "bg-orange-500" : "bg-green-500"
                  }`} />
                  {Math.floor(row.stock ?? 0)}
                </span>
              ),
            },
            { 
              key: "empresa", 
              label: "Empresa",
              render: (row) => (
                <div className="max-w-[150px]">
                  {row.empresa?.nombre ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-xs font-bold text-white">
                          {row.empresa.nombre[0].toUpperCase()}
                        </div>
                        <p className="truncate text-xs font-medium text-slate-700">{row.empresa.nombre}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">-</p>
                  )}
                </div>
              ),
            },
            { 
              key: "estado", 
              label: "Estado",
              render: (row) => (
                row.estado?.nombre ? (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    row.estado.nombre.toLowerCase().includes("sin stock") || row.estado.nombre.toLowerCase().includes("inactivo")
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {row.estado.nombre}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">-</span>
                )
              ),
            },
            {
              key: "acciones",
              label: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => cargarDetalle(row.id)}>
                    Detalle
                  </button>
                  <button className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white" onClick={() => registrarClick(row.id)}>
                    Click
                  </button>
                  {!readOnly ? (
                    <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminarProducto(row.id)}>
                      Eliminar
                    </button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={marketplace.data || []}
        />
      ) : null}

      {productoDetalle ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detalle producto #{productoDetalle.id}</h3>
          <p className="mt-1 text-sm text-slate-600">{productoDetalle.nombre} | {productoDetalle.descripcion}</p>
          <p className="mt-1 text-xs text-slate-500">Precio: {productoDetalle.precio} | Stock: {productoDetalle.stock}</p>
          {readOnly ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-teal-700">Inicia sesion para usar chat, favoritos y gestiones de compra.</p>
              <Link
                to={`/login?next=${encodeURIComponent(`/admin/mensajes?id_marketplace=${productoDetalle.id}`)}`}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Iniciar sesion para chatear
              </Link>
            </div>
          ) : null}
        </article>
      ) : null}

      {!readOnly ? (
        <>
          <PermissionGate
            anyOf={["modificar_marketplace"]}
            fallback={
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                No tienes permiso `modificar_marketplace` para editar, eliminar o subir imágenes.
              </article>
            }
          >
            <form onSubmit={actualizarProducto} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Editar producto</h3>
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID producto" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Descripción" value={editForm.descripcion} onChange={(e) => setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Precio" type="number" min="0" value={editForm.precio} onChange={(e) => setEditForm((prev) => ({ ...prev, precio: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Stock" type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))} required />

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_empresa} onChange={(e) => setEditForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
                <option value="">Selecciona empresa</option>
                {(empresas.data || []).map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                ))}
              </select>
              <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_categoria} onChange={(e) => setEditForm((prev) => ({ ...prev, id_categoria: e.target.value }))} required>
                <option value="">Selecciona categoría</option>
                {(categorias.data || []).map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>
              <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_estado} onChange={(e) => setEditForm((prev) => ({ ...prev, id_estado: e.target.value }))}>
                <option value="">Selecciona estado</option>
                {(estados.data || []).map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>

              <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Guardar cambios</button>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Subir imágenes</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID producto" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} />
                <input className="rounded-xl border border-slate-300 px-3 py-2" type="file" multiple onChange={(e) => setImagenesArchivos(Array.from(e.target.files || []))} />
                <button className="rounded-xl bg-teal-600 px-4 py-2 text-white" onClick={subirImagenes}>Subir imágenes</button>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate
            anyOf={["crear_marketplace"]}
            fallback={
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                No tienes permiso `crear_marketplace` para publicar productos.
              </article>
            }
          >
            <form onSubmit={crearProducto} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Crear producto</h3>
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Precio" type="number" min="0" value={form.precio} onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} required />

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_empresa} onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
                <option value="">Selecciona empresa</option>
                {(empresas.data || []).map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                ))}
              </select>

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_categoria} onChange={(e) => setForm((prev) => ({ ...prev, id_categoria: e.target.value }))} required>
                <option value="">Selecciona categoría</option>
                {(categorias.data || []).map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_estado} onChange={(e) => setForm((prev) => ({ ...prev, id_estado: e.target.value }))}>
                <option value="">Selecciona estado</option>
                {(estados.data || []).map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>

              <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Crear producto</button>
            </form>
          </PermissionGate>
        </>
      ) : null}
    </section>
  );
}
