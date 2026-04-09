import { useState } from "react";
import { DataTable } from "../components/common/DataTable";
import { useAsyncData } from "../hooks/useAsyncData";
import { catalogosApi, empresasApi, publicidadesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { PermissionGate } from "../components/common/PermissionGate";

export function PublicidadesPage() {
  const { pushToast } = useToast();
  const [detalle, setDetalle] = useState(null);
  const [editForm, setEditForm] = useState({ id: "", id_empresa: "", id_tipo_anuncio: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
  const [imagenes, setImagenes] = useState([]);
  const [form, setForm] = useState({ id_empresa: "", id_tipo_anuncio: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });

  const publicidades = useAsyncData(async () => (await publicidadesApi.list({ limit: 50 })).data);
  const empresas = useAsyncData(async () => {
    try {
      return (await empresasApi.misEmpresas({ limit: 200 })).data;
    } catch {
      return (await empresasApi.list({ limit: 200 })).data;
    }
  });
  const tiposAnuncio = useAsyncData(async () => (await catalogosApi.tiposAnuncio({ limit: 100 })).data);

  const crear = async (event) => {
    event.preventDefault();
    try {
      await publicidadesApi.create({
        id_empresa: Number(form.id_empresa),
        id_tipo_anuncio: Number(form.id_tipo_anuncio),
        descripcion: form.descripcion,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
      });
      pushToast({ title: "Publicidad creada", message: "Alta registrada", type: "success" });
      setForm({ id_empresa: "", id_tipo_anuncio: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const cargarDetalle = async (publicidadId) => {
    try {
      const { data } = await publicidadesApi.get(publicidadId);
      setDetalle(data);
      setEditForm({
        id: String(data.id),
        id_empresa: String(data.id_empresa || ""),
        id_tipo_anuncio: String(data.id_tipo_anuncio || ""),
        descripcion: data.descripcion || "",
        fecha_inicio: data.fecha_inicio ? String(data.fecha_inicio).slice(0, 16) : "",
        fecha_fin: data.fecha_fin ? String(data.fecha_fin).slice(0, 16) : "",
      });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar detalle", type: "error" });
    }
  };

  const actualizar = async (event) => {
    event.preventDefault();
    try {
      await publicidadesApi.update(Number(editForm.id), {
        id_empresa: Number(editForm.id_empresa),
        id_tipo_anuncio: Number(editForm.id_tipo_anuncio),
        descripcion: editForm.descripcion,
        fecha_inicio: editForm.fecha_inicio,
        fecha_fin: editForm.fecha_fin || null,
      });
      pushToast({ title: "Publicidad actualizada", message: "Cambios guardados", type: "success" });
      await cargarDetalle(Number(editForm.id));
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const subirImagenes = async () => {
    if (!editForm.id || !imagenes.length) {
      pushToast({ title: "Dato requerido", message: "Selecciona una publicidad y al menos una imagen", type: "error" });
      return;
    }
    try {
      await publicidadesApi.uploadImagenes(Number(editForm.id), imagenes);
      pushToast({ title: "Imágenes subidas", message: "Carga completada", type: "success" });
      setImagenes([]);
      await cargarDetalle(Number(editForm.id));
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudieron subir imágenes", type: "error" });
    }
  };

  const eliminar = async (publicidadId) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar esta publicidad?");
    if (!confirmado) {
      return;
    }
    try {
      await publicidadesApi.remove(publicidadId);
      pushToast({ title: "Publicidad eliminada", message: `Publicidad ${publicidadId} desactivada`, type: "success" });
      if (Number(editForm.id) === Number(publicidadId)) {
        setDetalle(null);
      }
      publicidades.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "id_empresa", label: "Empresa" },
          { key: "id_tipo_anuncio", label: "Tipo" },
          { key: "descripcion", label: "Descripción" },
          {
            key: "acciones",
            label: "Acciones",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => cargarDetalle(row.id)}>
                  Detalle
                </button>
                <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminar(row.id)}>
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        rows={publicidades.data || []}
      />

      {detalle ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detalle publicidad #{detalle.id}</h3>
          <p className="mt-1 text-sm text-slate-600">Empresa {detalle.id_empresa} | Tipo anuncio {detalle.id_tipo_anuncio}</p>
          <p className="mt-1 text-xs text-slate-500">{detalle.descripcion}</p>
        </article>
      ) : null}

      <PermissionGate
        anyOf={["modificar_publicidades"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `modificar_publicidades` para editar, eliminar o subir imágenes.
          </article>
        }
      >
        <form onSubmit={actualizar} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Editar publicidad</h3>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID publicidad" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} required />
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_empresa} onChange={(e) => setEditForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
            <option value="">Selecciona empresa</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_tipo_anuncio} onChange={(e) => setEditForm((prev) => ({ ...prev, id_tipo_anuncio: e.target.value }))} required>
            <option value="">Selecciona tipo de anuncio</option>
            {(tiposAnuncio.data || []).map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
          <input className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2" placeholder="Descripción" value={editForm.descripcion} onChange={(e) => setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={editForm.fecha_inicio} onChange={(e) => setEditForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={editForm.fecha_fin} onChange={(e) => setEditForm((prev) => ({ ...prev, fecha_fin: e.target.value }))} />
          <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Guardar edición</button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Subir imágenes</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID publicidad" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" type="file" multiple onChange={(e) => setImagenes(Array.from(e.target.files || []))} />
            <button className="rounded-xl bg-teal-600 px-4 py-2 text-white" onClick={subirImagenes}>Subir imágenes</button>
          </div>
        </div>
      </PermissionGate>

      <PermissionGate
        anyOf={["crear_publicidades"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `crear_publicidades` para registrar campañas.
          </article>
        }
      >
        <form onSubmit={crear} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Crear publicidad</h3>

          <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_empresa} onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
            <option value="">Selecciona empresa</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>

          <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_tipo_anuncio} onChange={(e) => setForm((prev) => ({ ...prev, id_tipo_anuncio: e.target.value }))} required>
            <option value="">Selecciona tipo de anuncio</option>
            {(tiposAnuncio.data || []).map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>

          <input className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={form.fecha_fin} onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))} />
          <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Crear publicidad</button>
        </form>
      </PermissionGate>
    </section>
  );
}
