import { useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faImage, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, catalogosApi, publicidadesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../config/env";

export function EmpresaPublicidadesPage() {
  const { pushToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [form, setForm] = useState({
    id_empresa: "",
    id_tipo_anuncio: "",
    descripcion: "",
    fecha_inicio: new Date(),
    fecha_fin: null,
  });
  const [editForm, setEditForm] = useState({
    id: "",
    id_empresa: "",
    id_tipo_anuncio: "",
    descripcion: "",
    fecha_inicio: new Date(),
    fecha_fin: null,
  });

  // Load user's companies
  const misEmpresas = useAsyncData(async () => {
    try {
      return (await empresasApi.misEmpresas({ limit: 200 })).data;
    } catch {
      return [];
    }
  });

  // Load all advertisements
  const publicidades = useAsyncData(async () => {
    const { data } = await publicidadesApi.list({ limit: 100 });
    return data || [];
  }, []);

  const tiposAnuncio = useAsyncData(async () => (await catalogosApi.tiposAnuncio({ limit: 100 })).data);

  // Select options
  const empresaOptions = useMemo(
    () => (misEmpresas.data || []).map((e) => ({ value: String(e.id), label: e.nombre })),
    [misEmpresas.data]
  );

  const tipoAnuncioOptions = useMemo(
    () => (tiposAnuncio.data || []).map((t) => ({ value: String(t.id), label: t.nombre })),
    [tiposAnuncio.data]
  );

  const resetForm = () => {
    setForm({
      id_empresa: "",
      id_tipo_anuncio: "",
      descripcion: "",
      fecha_inicio: new Date(),
      fecha_fin: null,
    });
  };

  const resetEditForm = () => {
    setEditForm({
      id: "",
      id_empresa: "",
      id_tipo_anuncio: "",
      descripcion: "",
      fecha_inicio: new Date(),
      fecha_fin: null,
    });
    setSelectedImages([]);
    setPreviewUrls([]);
  };

  const crear = async (event) => {
    event.preventDefault();
    if (!form.id_empresa || !form.id_tipo_anuncio) {
      pushToast({ title: "Campos requeridos", message: "Selecciona empresa y tipo de anuncio", type: "error" });
      return;
    }
    try {
      await publicidadesApi.create({
        id_empresa: Number(form.id_empresa),
        id_tipo_anuncio: Number(form.id_tipo_anuncio),
        descripcion: form.descripcion,
        fecha_inicio: form.fecha_inicio.toISOString(),
        fecha_fin: form.fecha_fin?.toISOString() || null,
      });
      pushToast({ title: "Publicidad creada", message: "Alta registrada correctamente", type: "success" });
      resetForm();
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const iniciarEdicion = (row) => {
    setEditForm({
      id: String(row.id),
      id_empresa: String(row.id_empresa),
      id_tipo_anuncio: String(row.id_tipo_anuncio),
      descripcion: row.descripcion || "",
      fecha_inicio: new Date(row.fecha_inicio),
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin) : null,
    });
    setSelectedImages([]);
    setPreviewUrls([]);
    setShowEditModal(true);
  };

  const actualizar = async (event) => {
    event.preventDefault();
    if (!editForm.id_empresa || !editForm.id_tipo_anuncio) {
      pushToast({ title: "Campos requeridos", message: "Selecciona empresa y tipo de anuncio", type: "error" });
      return;
    }
    try {
      await publicidadesApi.update(Number(editForm.id), {
        id_empresa: Number(editForm.id_empresa),
        id_tipo_anuncio: Number(editForm.id_tipo_anuncio),
        descripcion: editForm.descripcion,
        fecha_inicio: editForm.fecha_inicio.toISOString(),
        fecha_fin: editForm.fecha_fin?.toISOString() || null,
      });
      pushToast({ title: "Publicidad actualizada", message: "Cambios guardados", type: "success" });
      await cerrarModal();
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminar = async (publicidadId) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar esta publicidad?");
    if (!confirmado) return;
    try {
      await publicidadesApi.remove(publicidadId);
      pushToast({ title: "Publicidad eliminada", message: "Publicidad desactivada", type: "success" });
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const cerrarModal = async () => {
    setShowEditModal(false);
    resetEditForm();
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

  const subirImagenes = async (publicidadId) => {
    if (!publicidadId || selectedImages.length === 0) {
      pushToast({ title: "Dato requerido", message: "Selecciona al menos una imagen", type: "error" });
      return;
    }
    try {
      await publicidadesApi.uploadImagenes(publicidadId, selectedImages);
      pushToast({ title: "Imágenes subidas", message: `${selectedImages.length} imagen(es) cargada(s)`, type: "success" });
      setSelectedImages([]);
      setPreviewUrls([]);
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudieron subir imágenes", type: "error" });
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("/") ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
  };

  if (publicidades.loading || misEmpresas.loading || tiposAnuncio.loading) {
    return <Loading />;
  }

  const hasEmpresas = misEmpresas.data && misEmpresas.data.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Mis Publicidades</h3>
        <p className="mt-1 text-sm text-slate-600">Gestiona las campañas publicitarias de tus empresas</p>
      </div>

      {!hasEmpresas ? (
        <EmptyState
          title="Sin empresas"
          description="Primero necesitas crear una empresa antes de crear publicidades."
        />
      ) : null}

      {hasEmpresas && (publicidades.data || []).length === 0 ? (
        <EmptyState
          title="Sin publicidades"
          description="Aún no tienes campañas publicitarias. Crea tu primera publicidad desde el formulario."
        />
      ) : null}

      {/* Advertisements Table */}
      {hasEmpresas && (publicidades.data || []).length > 0 ? (
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "descripcion", label: "Descripción" },
            {
              key: "imagenes",
              label: "Imágenes",
              render: (row) => {
                const imgs = row.imagenes || [];
                if (imgs.length === 0) return <span className="text-xs text-slate-400">Sin imágenes</span>;
                return (
                  <div className="flex gap-1">
                    {imgs.slice(0, 3).map((url, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(url)}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    ))}
                    {imgs.length > 3 && (
                      <span className="text-xs text-slate-500 self-center">+{imgs.length - 3}</span>
                    )}
                  </div>
                );
              },
            },
            {
              key: "fecha_inicio",
              label: "Inicio",
              render: (row) => new Date(row.fecha_inicio).toLocaleDateString("es-ES"),
            },
            {
              key: "fecha_fin",
              label: "Fin",
              render: (row) => row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString("es-ES") : "Sin fecha",
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
                    onClick={() => eliminar(row.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={publicidades.data || []}
        />
      ) : null}

      {/* Create Form */}
      {hasEmpresas && (
        <form onSubmit={crear} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Crear publicidad</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Empresa</label>
              <Select
                options={empresaOptions}
                value={empresaOptions.find((o) => o.value === form.id_empresa) || null}
                onChange={(opt) => setForm((prev) => ({ ...prev, id_empresa: opt?.value || "" }))}
                placeholder="Selecciona empresa"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de anuncio</label>
              <Select
                options={tipoAnuncioOptions}
                value={tipoAnuncioOptions.find((o) => o.value === form.id_tipo_anuncio) || null}
                onChange={(opt) => setForm((prev) => ({ ...prev, id_tipo_anuncio: opt?.value || "" }))}
                placeholder="Selecciona tipo de anuncio"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Descripción de la publicidad"
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha de inicio</label>
              <DatePicker
                selected={form.fecha_inicio}
                onChange={(date) => setForm((prev) => ({ ...prev, fecha_inicio: date }))}
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholderText="Selecciona fecha y hora"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha de fin (opcional)</label>
              <DatePicker
                selected={form.fecha_fin}
                onChange={(date) => setForm((prev) => ({ ...prev, fecha_fin: date }))}
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholderText="Selecciona fecha y hora"
                isClearable
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear publicidad
          </button>
        </form>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={cerrarModal}
        title={`Editar publicidad #${editForm.id}`}
        size="lg"
      >
        <form onSubmit={actualizar} className="space-y-5">
          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Empresa</label>
              <Select
                options={empresaOptions}
                value={empresaOptions.find((o) => o.value === editForm.id_empresa) || null}
                onChange={(opt) => setEditForm((prev) => ({ ...prev, id_empresa: opt?.value || "" }))}
                placeholder="Selecciona empresa"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de anuncio</label>
              <Select
                options={tipoAnuncioOptions}
                value={tipoAnuncioOptions.find((o) => o.value === editForm.id_tipo_anuncio) || null}
                onChange={(opt) => setEditForm((prev) => ({ ...prev, id_tipo_anuncio: opt?.value || "" }))}
                placeholder="Selecciona tipo de anuncio"
                isClearable
                styles={{
                  control: (base) => ({ ...base, borderRadius: "0.75rem", minHeight: "44px" }),
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={editForm.descripcion}
                onChange={(e) => setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha de inicio</label>
              <DatePicker
                selected={editForm.fecha_inicio}
                onChange={(date) => setEditForm((prev) => ({ ...prev, fecha_inicio: date }))}
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholderText="Selecciona fecha y hora"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha de fin (opcional)</label>
              <DatePicker
                selected={editForm.fecha_fin}
                onChange={(date) => setEditForm((prev) => ({ ...prev, fecha_fin: date }))}
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholderText="Selecciona fecha y hora"
                isClearable
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
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Imágenes de publicidad</h4>
            
            {/* Existing Images */}
            {publicidades.data?.find(p => String(p.id) === editForm.id)?.imagenes?.length > 0 && (
              <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {publicidades.data.find(p => String(p.id) === editForm.id).imagenes.map((url, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(url)}
                    alt={`Imagen ${idx + 1}`}
                    className="h-20 w-full rounded-lg object-cover"
                  />
                ))}
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
