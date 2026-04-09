import { useState } from "react";
import { DataTable } from "../components/common/DataTable";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, reviewsApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { PermissionGate } from "../components/common/PermissionGate";

export function ReviewsPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [empresaFiltro, setEmpresaFiltro] = useState("");
  const [editForm, setEditForm] = useState({ id: "", id_empresa: "", comentario: "", calificacion: "" });
  const [form, setForm] = useState({ id_empresa: "", id_usuario: String(user?.id_usuario || ""), comentario: "", calificacion: "" });

  const reviews = useAsyncData(async () => {
    if (empresaFiltro) {
      return (await reviewsApi.listEmpresa(Number(empresaFiltro))).data;
    }
    return (await reviewsApi.list({ limit: 50 })).data;
  }, empresaFiltro);
  const empresas = useAsyncData(async () => (await empresasApi.list({ limit: 200 })).data);

  const crear = async (event) => {
    event.preventDefault();
    try {
      await reviewsApi.create({
        id_empresa: Number(form.id_empresa),
        id_usuario: Number(form.id_usuario || user?.id_usuario),
        comentario: form.comentario,
        calificacion: Number(form.calificacion),
      });
      pushToast({ title: "Reseña creada", message: "La calificación fue registrada", type: "success" });
      setForm({ id_empresa: "", id_usuario: String(user?.id_usuario || ""), comentario: "", calificacion: "" });
      reviews.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const prepararEdicion = (row) => {
    setEditForm({
      id: String(row.id),
      id_empresa: String(row.id_empresa),
      comentario: row.comentario || "",
      calificacion: String(row.calificacion ?? ""),
    });
  };

  const actualizar = async (event) => {
    event.preventDefault();
    try {
      await reviewsApi.update(Number(editForm.id), {
        id_empresa: Number(editForm.id_empresa),
        id_usuario: Number(user?.id_usuario),
        comentario: editForm.comentario,
        calificacion: Number(editForm.calificacion),
      });
      pushToast({ title: "Reseña actualizada", message: "Cambios guardados", type: "success" });
      reviews.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminar = async (reviewId) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar esta reseña?");
    if (!confirmado) {
      return;
    }
    try {
      await reviewsApi.remove(reviewId);
      pushToast({ title: "Reseña eliminada", message: `Reseña ${reviewId} desactivada`, type: "success" });
      reviews.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Filtros de reseñas</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
            <option value="">Todas las empresas</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={reviews.reload}>Refrescar</button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "id_empresa", label: "Empresa" },
          { key: "id_usuario", label: "Usuario" },
          { key: "calificacion", label: "Calificación" },
          { key: "comentario", label: "Comentario" },
          {
            key: "acciones",
            label: "Acciones",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white" onClick={() => prepararEdicion(row)}>
                  Editar
                </button>
                <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminar(row.id)}>
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        rows={reviews.data || []}
      />

      <PermissionGate
        anyOf={["modificar_reviews"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `modificar_reviews` para editar o eliminar reseñas.
          </article>
        }
      >
        <form onSubmit={actualizar} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Editar reseña</h3>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID reseña" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} required />
          <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_empresa} onChange={(e) => setEditForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
            <option value="">Selecciona empresa</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Calificación (1-5)" type="number" min="1" max="5" step="0.1" value={editForm.calificacion} onChange={(e) => setEditForm((prev) => ({ ...prev, calificacion: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Comentario" value={editForm.comentario} onChange={(e) => setEditForm((prev) => ({ ...prev, comentario: e.target.value }))} required />
          <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Guardar edición</button>
        </form>
      </PermissionGate>

      <PermissionGate
        anyOf={["crear_reviews"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `crear_reviews` para crear reseñas.
          </article>
        }
      >
        <form onSubmit={crear} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Crear reseña</h3>

          <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_empresa} onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))} required>
            <option value="">Selecciona empresa</option>
            {(empresas.data || []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
            ))}
          </select>

          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID usuario" value={form.id_usuario} onChange={(e) => setForm((prev) => ({ ...prev, id_usuario: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Calificación (1-5)" type="number" min="1" max="5" step="0.1" value={form.calificacion} onChange={(e) => setForm((prev) => ({ ...prev, calificacion: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Comentario" value={form.comentario} onChange={(e) => setForm((prev) => ({ ...prev, comentario: e.target.value }))} required />
          <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Crear reseña</button>
        </form>
      </PermissionGate>
    </section>
  );
}
