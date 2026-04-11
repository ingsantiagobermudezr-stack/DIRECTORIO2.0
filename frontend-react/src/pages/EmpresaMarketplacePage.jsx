import { useState, useMemo } from "react";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { Input } from "../components/common/Input";
import { ReactSelect } from "../components/common/ReactSelect";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, catalogosApi, empresasApi, marketplaceApi } from "../services/api";
import { useToast } from "../context/ToastContext";

export function EmpresaMarketplacePage() {
  const { pushToast } = useToast();
  const [search, setSearch] = useState("");
  const [filtros, setFiltros] = useState({
    id_empresa: "",
    id_categoria: "",
    id_estado: "",
    precio_min: "",
    precio_max: "",
    ordenar: "fecha_publicacion",
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

  // Load user's companies
  const misEmpresas = useAsyncData(async () => {
    try {
      return (await empresasApi.misEmpresas({ limit: 200 })).data;
    } catch {
      return [];
    }
  });

  // Load products from user's companies
  const marketplace = useAsyncData(async () => {
    const params = {
      search: search || undefined,
      limit: 100,
      id_empresa: filtros.id_empresa || undefined,
      id_categoria: filtros.id_categoria || undefined,
      id_estado: filtros.id_estado || undefined,
      precio_min: filtros.precio_min || undefined,
      precio_max: filtros.precio_max || undefined,
      ordenar: filtros.ordenar || "fecha_publicacion",
    };

    const { data } = await marketplaceApi.misProductos(params);
    return data || [];
  }, `${search}-${JSON.stringify(filtros)}`);

  const categorias = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const estados = useAsyncData(async () => (await catalogosApi.estadosMarketplace({ limit: 100 })).data);

  // ReactSelect options
  const empresaOptions = useMemo(
    () => [{ value: "", label: "Todas mis empresas" }, ...(misEmpresas.data || []).map((e) => ({ value: String(e.id), label: e.nombre }))],
    [misEmpresas.data],
  );
  const categoriaOptions = useMemo(
    () => [{ value: "", label: "Todas las categorías" }, ...(categorias.data || []).map((c) => ({ value: String(c.id), label: c.nombre }))],
    [categorias.data],
  );
  const estadoOptions = useMemo(
    () => [{ value: "", label: "Todos los estados" }, ...(estados.data || []).map((e) => ({ value: String(e.id), label: e.nombre }))],
    [estados.data],
  );

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      minHeight: "44px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fef08a" : state.isFocused ? "#fefce8" : base.backgroundColor,
      color: "#0f172a",
    }),
  };

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

  if (marketplace.loading || misEmpresas.loading) {
    return <Loading />;
  }

  const hasEmpresas = misEmpresas.data && misEmpresas.data.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Mis Productos</h3>
        <p className="mt-1 text-sm text-slate-600">Gestiona los productos de tus empresas en el marketplace</p>
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Buscar producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={marketplace.reload}>
            Refrescar
          </button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <ReactSelect
            value={empresaOptions.find((o) => o.value === filtros.id_empresa) || null}
            onChange={(selected) => setFiltros((prev) => ({ ...prev, id_empresa: selected?.value || "" }))}
            options={empresaOptions}
            placeholder="Mi empresa"
            isSearchable
            isClearable
            styles={selectStyles}
          />
          <ReactSelect
            value={categoriaOptions.find((o) => o.value === filtros.id_categoria) || null}
            onChange={(selected) => setFiltros((prev) => ({ ...prev, id_categoria: selected?.value || "" }))}
            options={categoriaOptions}
            placeholder="Categoría"
            isSearchable
            isClearable
            styles={selectStyles}
          />
          <ReactSelect
            value={estadoOptions.find((o) => o.value === filtros.id_estado) || null}
            onChange={(selected) => setFiltros((prev) => ({ ...prev, id_estado: selected?.value || "" }))}
            options={estadoOptions}
            placeholder="Estado"
            isSearchable
            isClearable
            styles={selectStyles}
          />
          <Input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Precio mínimo"
            type="number"
            value={filtros.precio_min}
            onChange={(e) => setFiltros((prev) => ({ ...prev, precio_min: e.target.value }))}
          />
          <Input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Precio máximo"
            type="number"
            value={filtros.precio_max}
            onChange={(e) => setFiltros((prev) => ({ ...prev, precio_max: e.target.value }))}
          />
        </div>
      </div>

      {/* Products Table */}
      {!marketplace.loading && !hasEmpresas ? (
        <EmptyState
          title="Sin empresas"
          description="Primero necesitas crear una empresa antes de publicar productos."
        />
      ) : null}

      {!marketplace.loading && hasEmpresas && (marketplace.data || []).length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="Aún no tienes productos publicados. Crea tu primer producto desde el formulario."
        />
      ) : null}

      {!marketplace.loading && hasEmpresas && (marketplace.data || []).length > 0 ? (
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
                    <span className="inline-block mt-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
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
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-xs font-bold text-white">
                        {row.empresa.nombre[0].toUpperCase()}
                      </div>
                      <p className="truncate text-xs font-medium text-slate-700">{row.empresa.nombre}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">-</p>
                  )}
                </div>
              ),
            },
            {
              key: "acciones",
              label: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white"
                    onClick={() => cargarDetalle(row.id)}
                  >
                    Detalle
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white"
                    onClick={() => eliminarProducto(row.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={marketplace.data || []}
        />
      ) : null}

      {/* Product Detail */}
      {productoDetalle ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detalle producto #{productoDetalle.id}</h3>
          <p className="mt-1 text-sm text-slate-600">{productoDetalle.nombre} | {productoDetalle.descripcion}</p>
          <p className="mt-1 text-xs text-slate-500">Precio: {productoDetalle.precio} | Stock: {productoDetalle.stock}</p>
        </article>
      ) : null}

      {/* Edit Product */}
      {productoDetalle && (
        <form onSubmit={actualizarProducto} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-xl font-bold text-slate-900">Editar producto</h3>
          <Input label="Nombre" value={editForm.nombre} onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
          <Input label="Descripción" value={editForm.descripcion} onChange={(e) => setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
          <Input label="Precio" type="number" min="0" value={editForm.precio} onChange={(e) => setEditForm((prev) => ({ ...prev, precio: e.target.value }))} required />
          <Input label="Stock" type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))} required />

          <ReactSelect
            label="Empresa"
            value={empresaOptions.find((o) => o.value === editForm.id_empresa) || null}
            onChange={(selected) => setEditForm((prev) => ({ ...prev, id_empresa: selected?.value || "" }))}
            options={empresaOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona empresa"
            isClearable={false}
            styles={selectStyles}
            required
          />
          <ReactSelect
            label="Categoría"
            value={categoriaOptions.find((o) => o.value === editForm.id_categoria) || null}
            onChange={(selected) => setEditForm((prev) => ({ ...prev, id_categoria: selected?.value || "" }))}
            options={categoriaOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona categoría"
            isClearable={false}
            styles={selectStyles}
            required
          />
          <ReactSelect
            label="Estado"
            value={estadoOptions.find((o) => o.value === editForm.id_estado) || null}
            onChange={(selected) => setEditForm((prev) => ({ ...prev, id_estado: selected?.value || "" }))}
            options={estadoOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona estado"
            isClearable
            styles={selectStyles}
          />

          <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700">
            Guardar cambios
          </button>
        </form>
      )}

      {/* Upload Images */}
      {productoDetalle && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Subir imágenes</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImagenesArchivos(Array.from(e.target.files || []))}
            />
            <button className="rounded-xl bg-teal-600 px-4 py-2 text-white" onClick={subirImagenes}>
              Subir imágenes
            </button>
          </div>
        </div>
      )}

      {/* Create Product */}
      {hasEmpresas && (
        <form onSubmit={crearProducto} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-xl font-bold text-slate-900">Crear producto</h3>
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
          <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
          <Input label="Precio" type="number" min="0" value={form.precio} onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))} required />
          <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} required />

          <ReactSelect
            label="Empresa"
            value={empresaOptions.find((o) => o.value === form.id_empresa) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_empresa: selected?.value || "" }))}
            options={empresaOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona empresa"
            isClearable={false}
            styles={selectStyles}
            required
          />

          <ReactSelect
            label="Categoría"
            value={categoriaOptions.find((o) => o.value === form.id_categoria) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_categoria: selected?.value || "" }))}
            options={categoriaOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona categoría"
            isClearable={false}
            styles={selectStyles}
            required
          />

          <ReactSelect
            label="Estado"
            value={estadoOptions.find((o) => o.value === form.id_estado) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_estado: selected?.value || "" }))}
            options={estadoOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona estado"
            isClearable
            styles={selectStyles}
          />

          <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700">
            Crear producto
          </button>
        </form>
      )}
    </section>
  );
}
