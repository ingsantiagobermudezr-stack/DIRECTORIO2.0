import { useState, useMemo, useEffect, useCallback } from "react";
import numeral from "numeral";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faImage, faPlus } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, catalogosApi, empresasApi, marketplaceApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/env";

export function EmpresaMarketplacePage() {
  const { pushToast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_empresa: "",
    id_categoria: "",
    id_estado: "",
  });
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
  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_estado: "",
  });

  // Load user's companies
  const misEmpresas = useAsyncData(async () => {
    try {
      return (await empresasApi.misEmpresas({ limit: 200 })).data;
    } catch {
      return [];
    }
  });

  // Stable key for user's empresa IDs
  const empresaIdsKey = useMemo(
    () => (misEmpresas.data && misEmpresas.data.length > 0)
      ? JSON.stringify(misEmpresas.data.map((e) => e.id).sort())
      : null,
    [misEmpresas.data]
  );

  // Load products using plain useEffect to avoid useAsyncData complexity
  const [marketplace, setMarketplace] = useState({ data: [], loading: false, error: null });

  const reloadMarketplace = useCallback(async () => {
    const userEmpresaIds = JSON.parse(empresaIdsKey || "[]");
    if (userEmpresaIds.length === 0) {
      setMarketplace({ data: [], loading: false, error: null });
      return;
    }

    setMarketplace((prev) => ({ ...prev, loading: true }));
    try {
      const allProducts = [];
      
      for (const empresaId of userEmpresaIds) {
        const params = {
          id_empresa: empresaId,
          limit: 100,
        };
        
        if (search) params.search = search;
        if (filtros.id_categoria) params.id_categoria = filtros.id_categoria;
        if (filtros.id_estado) params.id_estado = filtros.id_estado;

        const { data } = await marketplaceApi.list(params);
        if (data?.length > 0) {
          allProducts.push(...data);
        }
      }

      setMarketplace({ data: allProducts, loading: false, error: null });
    } catch (err) {
      setMarketplace({ data: [], loading: false, error: err });
    }
  }, [empresaIdsKey, search, filtros.id_categoria, filtros.id_estado]);

  // Reload when key changes
  useEffect(() => {
    reloadMarketplace(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [reloadMarketplace]);

  const categorias = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const estados = useAsyncData(async () => (await catalogosApi.estadosMarketplace({ limit: 100 })).data);

  // Select options
  const empresaOptions = useMemo(
    () => (misEmpresas.data || []).map((e) => ({ value: String(e.id), label: e.nombre })),
    [misEmpresas.data]
  );

  const categoriaOptions = useMemo(
    () => [{ value: "", label: "Todas las categorías" }, ...(categorias.data || []).map((c) => ({ value: String(c.id), label: c.nombre }))],
    [categorias.data]
  );

  const estadoOptions = useMemo(
    () => [{ value: "", label: "Todos los estados" }, ...(estados.data || []).map((e) => ({ value: String(e.id), label: e.nombre }))],
    [estados.data]
  );

  // Check if user is creator of any empresa (required to publish products)
  const isEmpresaCreator = useMemo(() => {
    if (!misEmpresas.data || !user) return false;
    const userId = user.id_usuario || user.id;
    return misEmpresas.data.some((e) => String(e.id_usuario_creador) === String(userId));
  }, [misEmpresas.data, user]);

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      id_empresa: "",
      id_categoria: "",
      id_estado: "",
    });
  };

  const resetEditForm = () => {
    setEditForm({
      id: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      id_empresa: "",
      id_categoria: "",
      id_estado: "",
    });
    setSelectedImages([]);
    setPreviewUrls([]);
  };

  const crearProducto = async (event) => {
    event.preventDefault();
    if (!form.id_empresa) {
      pushToast({ title: "Campo requerido", message: "Selecciona una empresa", type: "error" });
      return;
    }
    try {
      await marketplaceApi.create({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        id_empresa: Number(form.id_empresa),
        id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
        id_estado: form.id_estado ? Number(form.id_estado) : null,
      });
      pushToast({ title: "Producto creado", message: "Alta de marketplace exitosa", type: "success" });
      resetForm();
      reloadMarketplace();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const iniciarEdicion = (row) => {
    setEditForm({
      id: String(row.id),
      nombre: row.nombre || "",
      descripcion: row.descripcion || "",
      precio: String(row.precio ?? ""),
      stock: String(row.stock ?? ""),
      id_empresa: String(row.id_empresa || row.empresa?.id || ""),
      id_categoria: String(row.id_categoria || row.categoria?.id || ""),
      id_estado: String(row.id_estado || row.estado?.id || ""),
    });
    setSelectedImages([]);
    setPreviewUrls([]);
    setShowEditModal(true);
  };

  const cerrarModal = () => {
    setShowEditModal(false);
    resetEditForm();
  };

  const actualizarProducto = async (event) => {
    event.preventDefault();
    if (!editForm.id_empresa) {
      pushToast({ title: "Campo requerido", message: "Selecciona una empresa", type: "error" });
      return;
    }
    try {
      await marketplaceApi.update(Number(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
        id_empresa: Number(editForm.id_empresa),
        id_categoria: editForm.id_categoria ? Number(editForm.id_categoria) : null,
        id_estado: editForm.id_estado ? Number(editForm.id_estado) : null,
      });
      pushToast({ title: "Producto actualizado", message: "Cambios guardados", type: "success" });
      await cerrarModal();
      reloadMarketplace();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminarProducto = async (idMarketplace) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar este producto?");
    if (!confirmado) return;
    try {
      await marketplaceApi.remove(idMarketplace);
      pushToast({ title: "Producto eliminado", message: "Producto desactivado", type: "success" });
      reloadMarketplace();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files);
    
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImagePreview = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const subirImagenes = async (productoId) => {
    if (!productoId || selectedImages.length === 0) {
      pushToast({ title: "Dato requerido", message: "Selecciona al menos una imagen", type: "error" });
      return;
    }
    try {
      await marketplaceApi.uploadImagenes(productoId, selectedImages);
      pushToast({ title: "Imágenes subidas", message: `${selectedImages.length} imagen(es) cargada(s)`, type: "success" });
      setSelectedImages([]);
      setPreviewUrls([]);
      reloadMarketplace();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudieron subir imágenes", type: "error" });
    }
  };

  const formatPrice = (price) => {
    return numeral(price || 0).format("$0,0");
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("/") ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
  };

  if (marketplace.loading || misEmpresas.loading || categorias.loading || estados.loading) {
    return <Loading />;
  }

  const hasEmpresas = misEmpresas.data && misEmpresas.data.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Mis Productos</h3>
        <p className="mt-1 text-sm text-slate-600">Gestiona los productos de tus empresas en el marketplace</p>
        
        {/* Search & Filters */}
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Buscar producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={reloadMarketplace}>
            Refrescar
          </button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Select
            value={categoriaOptions.find((o) => o.value === filtros.id_categoria) || null}
            onChange={(selected) => setFiltros((prev) => ({ ...prev, id_categoria: selected?.value || "" }))}
            options={categoriaOptions}
            placeholder="Categoría"
            isClearable
            styles={{
              control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
            }}
          />
          <Select
            value={estadoOptions.find((o) => o.value === filtros.id_estado) || null}
            onChange={(selected) => setFiltros((prev) => ({ ...prev, id_estado: selected?.value || "" }))}
            options={estadoOptions}
            placeholder="Estado"
            isClearable
            styles={{
              control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
            }}
          />
        </div>
      </div>

      {/* Empty States */}
      {!hasEmpresas ? (
        <EmptyState
          title="Sin empresas"
          description="Primero necesitas crear una empresa antes de publicar productos."
        />
      ) : null}

      {hasEmpresas && (marketplace.data || []).length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="Aún no tienes productos publicados. Crea tu primer producto desde el formulario."
        />
      ) : null}

      {/* Products Table */}
      {hasEmpresas && (marketplace.data || []).length > 0 ? (
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
                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
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
                  {formatPrice(row.precio)}
                </span>
              ),
            },
            {
              key: "stock",
              label: "Stock",
              render: (row) => {
                const stock = row.stock ?? 0;
                return (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    stock === 0 ? "bg-red-100 text-red-700" : stock <= 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${
                      stock === 0 ? "bg-red-500" : stock <= 5 ? "bg-orange-500" : "bg-green-500"
                    }`} />
                    {Math.floor(stock)}
                  </span>
                );
              },
            },
            {
              key: "acciones",
              label: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    onClick={() => iniciarEdicion(row)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="mr-1" />
                    Editar
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700"
                    onClick={() => eliminarProducto(row.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={marketplace.data || []}
        />
      ) : null}

      {/* Create Product Form - only for empresa creators */}
      {hasEmpresas && !isEmpresaCreator ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900">No puedes publicar productos</h4>
              <p className="mt-1 text-sm text-amber-700">
                Solo el propietario de la empresa (quien la creó) puede publicar productos en el marketplace.
                Si necesitas agregar productos, contacta al propietario de la empresa.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {hasEmpresas && isEmpresaCreator && (
        <form onSubmit={crearProducto} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Crear producto</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Precio</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                value={form.precio}
                onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Empresa</label>
              <Select
                options={empresaOptions}
                value={empresaOptions.find((o) => o.value === form.id_empresa) || null}
                onChange={(opt) => setForm((prev) => ({ ...prev, id_empresa: opt?.value || "" }))}
                placeholder="Selecciona empresa"
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</label>
              <Select
                options={categoriaOptions.filter((o) => o.value !== "")}
                value={categoriaOptions.find((o) => o.value === form.id_categoria) || null}
                onChange={(opt) => setForm((prev) => ({ ...prev, id_categoria: opt?.value || "" }))}
                placeholder="Selecciona categoría"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Estado</label>
              <Select
                options={estadoOptions.filter((o) => o.value !== "")}
                value={estadoOptions.find((o) => o.value === form.id_estado) || null}
                onChange={(opt) => setForm((prev) => ({ ...prev, id_estado: opt?.value || "" }))}
                placeholder="Selecciona estado"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700"
          >
            Crear producto
          </button>
        </form>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={cerrarModal}
        title={`Editar producto #${editForm.id}`}
        size="lg"
      >
        <form onSubmit={actualizarProducto} className="space-y-5">
          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={editForm.nombre}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={editForm.descripcion}
                onChange={(e) => setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Precio</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                value={editForm.precio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, precio: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                value={editForm.stock}
                onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Empresa</label>
              <Select
                options={empresaOptions}
                value={empresaOptions.find((o) => o.value === editForm.id_empresa) || null}
                onChange={(opt) => setEditForm((prev) => ({ ...prev, id_empresa: opt?.value || "" }))}
                placeholder="Selecciona empresa"
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</label>
              <Select
                options={categoriaOptions.filter((o) => o.value !== "")}
                value={categoriaOptions.find((o) => o.value === editForm.id_categoria) || null}
                onChange={(opt) => setEditForm((prev) => ({ ...prev, id_categoria: opt?.value || "" }))}
                placeholder="Selecciona categoría"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Estado</label>
              <Select
                options={estadoOptions.filter((o) => o.value !== "")}
                value={estadoOptions.find((o) => o.value === editForm.id_estado) || null}
                onChange={(opt) => setEditForm((prev) => ({ ...prev, id_estado: opt?.value || "" }))}
                placeholder="Selecciona estado"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={cerrarModal}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>

          {/* Image Upload Section */}
          <div className="border-t border-slate-200 pt-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Imágenes del producto</h4>
            
            {/* Existing Images */}
            {marketplace.data?.find(p => String(p.id) === editForm.id)?.imagenes?.length > 0 && (
              <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {marketplace.data.find(p => String(p.id) === editForm.id).imagenes.map((img, idx) => {
                  const url = typeof img === "string" ? img : img.imagen_url;
                  return (
                    <img
                      key={idx}
                      src={getImageUrl(url)}
                      alt={`Imagen ${idx + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                  );
                })}
              </div>
            )}

            {/* Preview New Images */}
            {previewUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImagePreview(index)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 hover:border-teal-500 hover:bg-teal-50 transition">
                <FontAwesomeIcon icon={faImage} className="text-slate-500" />
                <span className="text-sm text-slate-700">
                  {selectedImages.length > 0
                    ? `${selectedImages.length} imagen(es)`
                    : "Agregar imágenes"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              
              {selectedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => subirImagenes(Number(editForm.id))}
                  className="rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Subir {selectedImages.length} imagen(es)
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
}
