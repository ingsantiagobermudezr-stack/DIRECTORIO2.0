import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faTrash, faUsers, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, usuariosApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function EquipoPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
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

    // Validar contraseña
    if (form.password.length < 8) {
      pushToast({ title: "Contraseña muy corta", message: "La contraseña debe tener al menos 8 caracteres", type: "error" });
      return;
    }

    try {
      await empresasApi.addUsuario(miEmpresa.data.id, {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        password: form.password,
      });
      pushToast({ title: "Miembro añadido", message: `${form.nombre} ${form.apellido} añadido a la empresa`, type: "success" });
      setForm({ nombre: "", apellido: "", correo: "", password: "" });
      setShowForm(false);
      equipo.reload();
    } catch (error) {
      // Manejar errores de validación del backend (array de objetos)
      let errorMsg = "No se pudo añadir el miembro";
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Pydantic validation errors
        errorMsg = detail.map((e) => e.msg || e.message).join(", ");
      } else if (typeof detail === "string") {
        errorMsg = detail;
      } else if (detail && typeof detail === "object") {
        errorMsg = detail.msg || detail.message || JSON.stringify(detail);
      }
      pushToast({ title: "Error", message: errorMsg, type: "error" });
    }
  };

  const abrirEdicion = (usuario) => {
    setSelectedUser(usuario);
    setEditForm({
      id: String(usuario.id),
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      correo: usuario.correo || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const cerrarEdicion = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditForm({ id: "", nombre: "", apellido: "", correo: "", password: "" });
  };

  const actualizarMiembro = async (event) => {
    event.preventDefault();
    if (!editForm.id) return;

    try {
      // Actualizar info del usuario
      const updateData = {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        correo: editForm.correo,
      };

      // Si cambió la contraseña, incluirla
      if (editForm.password) {
        if (editForm.password.length < 8) {
          pushToast({ title: "Contraseña muy corta", message: "La contraseña debe tener al menos 8 caracteres", type: "error" });
          return;
        }
        updateData.password = editForm.password;
      }

      await usuariosApi.update(Number(editForm.id), updateData);
      pushToast({ title: "Miembro actualizado", message: "Cambios guardados", type: "success" });
      cerrarEdicion();
      equipo.reload();
    } catch (error) {
      let errorMsg = "No se pudo actualizar el miembro";
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        errorMsg = detail.map((e) => e.msg || e.message).join(", ");
      } else if (typeof detail === "string") {
        errorMsg = detail;
      } else if (detail && typeof detail === "object") {
        errorMsg = detail.msg || detail.message || JSON.stringify(detail);
      }
      pushToast({ title: "Error", message: errorMsg, type: "error" });
    }
  };

  const desvincularMiembro = async (usuarioId, nombre) => {
    if (!miEmpresa.data) return;
    const confirmado = window.confirm(`¿Seguro que deseas desvincular a ${nombre} de la empresa?`);
    if (!confirmado) return;

    try {
      await empresasApi.removeUsuario(miEmpresa.data.id, usuarioId);
      pushToast({ title: "Miembro desvinculado", message: `${nombre} removido de la empresa`, type: "success" });
      cerrarEdicion();
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
                    <>
                      <button
                        className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        onClick={() => abrirEdicion(row)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="mr-1" />
                        Editar
                      </button>
                      <button
                        className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700"
                        onClick={() => desvincularMiembro(row.id, `${row.nombre} ${row.apellido}`)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Remover
                      </button>
                    </>
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
          <div>
            <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required minLength={8} />
            <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres</p>
          </div>

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

      {/* Edit Member Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={cerrarEdicion}
        title={`Editar miembro: ${selectedUser?.nombre} ${selectedUser?.apellido}`}
        size="md"
      >
        <form onSubmit={actualizarMiembro} className="space-y-5">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Apellido</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={editForm.apellido}
                onChange={(e) => setEditForm((prev) => ({ ...prev, apellido: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Correo</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="email"
                value={editForm.correo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, correo: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nueva contraseña (opcional)
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Dejar vacío para no cambiar"
              />
              <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres si deseas cambiarla</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => desvincularMiembro(Number(editForm.id), `${editForm.nombre} ${editForm.apellido}`)}
              className="rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white hover:bg-rose-700"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Desvincular
            </button>
            <button
              type="button"
              onClick={cerrarEdicion}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {!isCreator && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
          Solo el creador de la empresa puede gestionar el equipo.
        </div>
      )}
    </section>
  );
}
