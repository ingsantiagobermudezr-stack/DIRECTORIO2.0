import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { Input } from "../components/common/Input";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function EquipoPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    id_rol: "",
  });

  // Load user's company
  const miEmpresa = useAsyncData(async () => {
    try {
      const { data } = await empresasApi.miEmpresa();
      return data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  });

  // Load team members
  const equipo = useAsyncData(async () => {
    if (!miEmpresa.data) return [];
    try {
      const { data } = await empresasApi.getUsuarios(miEmpresa.data.id);
      return data || [];
    } catch {
      return [];
    }
  }, miEmpresa.data?.id);

  const agregarMiembro = async (event) => {
    event.preventDefault();
    if (!miEmpresa.data) return;

    try {
      await empresasApi.addUsuario(miEmpresa.data.id, {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        password: form.password,
        id_rol: form.id_rol ? Number(form.id_rol) : null,
      });
      pushToast({ title: "Miembro añadido", message: `${form.nombre} ${form.apellido} añadido a la empresa`, type: "success" });
      setForm({ nombre: "", apellido: "", correo: "", password: "", id_rol: "" });
      setShowForm(false);
      equipo.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo añadir el miembro", type: "error" });
    }
  };

  const removerMiembro = async (usuarioId, nombre) => {
    if (!miEmpresa.data) return;
    const confirmado = window.confirm(`¿Seguro que deseas remover a ${nombre} de la empresa?`);
    if (!confirmado) return;

    try {
      await empresasApi.removeUsuario(miEmpresa.data.id, usuarioId);
      pushToast({ title: "Miembro removido", message: `${nombre} removido de la empresa`, type: "success" });
      equipo.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo remover el miembro", type: "error" });
    }
  };

  // Check if user is the creator
  const isCreator = miEmpresa.data && user?.id_usuario === miEmpresa.data.id_usuario_creador;

  if (miEmpresa.loading || equipo.loading) {
    return <Loading />;
  }

  if (!miEmpresa.data) {
    return (
      <EmptyState
        title="Sin empresa"
        description="No perteneces a ninguna empresa."
      />
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Mi Equipo</h3>
            <p className="mt-1 text-sm text-slate-600">
              Miembros de {miEmpresa.data.nombre}
            </p>
          </div>
          {isCreator && (
            <button
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() => setShowForm(!showForm)}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Añadir Miembro</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Members Table */}
      {!equipo.loading && (equipo.data || []).length === 0 ? (
        <EmptyState
          title="Sin miembros"
          description="Aún no hay miembros en tu equipo."
        />
      ) : null}

      {!equipo.loading && (equipo.data || []).length > 0 ? (
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            {
              key: "nombre",
              label: "Nombre",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-900">
                    {row.nombre} {row.apellido}
                  </p>
                  <p className="text-xs text-slate-500">{row.correo}</p>
                </div>
              ),
            },
            { key: "id_rol", label: "Rol ID" },
            {
              key: "acciones",
              label: "Acciones",
              render: (row) => (
                <div className="flex gap-2">
                  {isCreator && row.id !== user?.id_usuario && (
                    <button
                      className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white"
                      onClick={() => removerMiembro(row.id, `${row.nombre} ${row.apellido}`)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" /> Remover
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={equipo.data || []}
        />
      ) : null}

      {/* Add Member Form (Creator only) */}
      {isCreator && showForm && (
        <form onSubmit={agregarMiembro} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 flex items-center gap-2 text-xl font-bold text-slate-900">
            <FontAwesomeIcon icon={faUsers} />
            Añadir nuevo miembro
          </h3>
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
          <Input label="Apellido" value={form.apellido} onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))} required />
          <Input label="Correo" type="email" value={form.correo} onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))} required />
          <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          <Input label="Rol ID (opcional)" type="number" value={form.id_rol} onChange={(e) => setForm((prev) => ({ ...prev, id_rol: e.target.value }))} />

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700"
            >
              Añadir miembro
            </button>
            <button
              type="button"
              className="rounded-xl bg-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-300"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!isCreator && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
          Solo el creador de la empresa puede gestionar el equipo.
        </div>
      )}
    </section>
  );
}
