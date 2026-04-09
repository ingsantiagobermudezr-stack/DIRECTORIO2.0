import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usuariosApi } from "../services/api";
import { useToast } from "../context/ToastContext";

export function PerfilPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", rol: "", id_rol: "", id_empresa: "" });

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user?.id_usuario) {
        return;
      }
      const { data } = await usuariosApi.get(user.id_usuario);
      setPerfil(data);
      setForm({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        correo: data.correo || "",
        rol: data.rol || "",
        id_rol: data.id_rol || "",
        id_empresa: data.id_empresa || "",
      });
    };
    cargarPerfil();
  }, [user]);

  const guardar = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        rol: form.rol || null,
        id_rol: form.id_rol ? Number(form.id_rol) : null,
        id_empresa: form.id_empresa ? Number(form.id_empresa) : null,
      };
      await usuariosApi.update(user.id_usuario, payload);
      pushToast({ title: "Perfil actualizado", message: "Datos guardados", type: "success" });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Mi perfil</h3>
        <p className="mt-1 text-sm text-slate-600">Usuario ID: {perfil?.id || user?.id_usuario || "-"}</p>
      </div>

      <form onSubmit={guardar} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Correo" type="email" value={form.correo} onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Rol" value={form.rol} onChange={(e) => setForm((prev) => ({ ...prev, rol: e.target.value }))} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID Rol" value={form.id_rol} onChange={(e) => setForm((prev) => ({ ...prev, id_rol: e.target.value }))} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID Empresa" value={form.id_empresa} onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))} />
        <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Guardar cambios</button>
      </form>
    </section>
  );
}
