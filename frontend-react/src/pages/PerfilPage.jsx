import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faBuilding,
  faShieldHalved,
  faSave,
  faUserGear,
  faIdBadge,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { usuariosApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Loading } from "../components/common/Loading";

export function PerfilPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "",
    id_rol: "",
    id_empresa: "",
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user?.id_usuario) {
        return;
      }
      setLoading(true);
      try {
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
      } catch (error) {
        pushToast({
          title: "Error",
          message: "No se pudo cargar el perfil",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, [user]);

  const guardar = async (event) => {
    event.preventDefault();
    setSaving(true);
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
      pushToast({
        title: "Perfil actualizado",
        message: "Tus datos han sido guardados exitosamente",
        type: "success",
      });
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo actualizar",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando perfil..." />;
  }

  const iniciales = `${form.nombre?.[0] || ""}${form.apellido?.[0] || ""}`.toUpperCase() || "U";

  return (
    <section className="space-y-6">
      {/* Header con Avatar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-500 to-primary-400 p-8 text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 text-4xl font-bold shadow-lg backdrop-blur">
            {iniciales}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {form.nombre || "-"} {form.apellido || "-"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-primary-50">
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{form.correo || "-"}</span>
              </div>
              {form.rol && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span className="capitalize">{form.rol}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ID Usuario */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faIdBadge} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">ID Usuario</p>
              <p className="text-lg font-bold text-slate-900">
                {perfil?.id || user?.id_usuario || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Rol ID */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faUserGear} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">ID Rol</p>
              <p className="text-lg font-bold text-slate-900">
                {form.id_rol || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Empresa ID */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">ID Empresa</p>
              <p className="text-lg font-bold text-slate-900">
                {form.id_empresa || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Edición */}
      <form onSubmit={guardar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
          <FontAwesomeIcon icon={faUserGear} className="text-primary-500" />
          Editar Información Personal
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Nombre"
            icon={faUser}
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            required
          />

          <Input
            label="Apellido"
            icon={faUser}
            placeholder="Tu apellido"
            value={form.apellido}
            onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
            required
          />

          <Input
            label="Correo"
            icon={faEnvelope}
            type="email"
            placeholder="tu@correo.com"
            value={form.correo}
            onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
            required
          />

          <Input
            label="Rol"
            icon={faShieldHalved}
            placeholder="Ej: admin, usuario"
            value={form.rol}
            onChange={(e) => setForm((prev) => ({ ...prev, rol: e.target.value }))}
            helperText="Rol del usuario en el sistema"
          />

          <Input
            label="ID Rol"
            icon={faUserGear}
            type="number"
            placeholder="Ej: 1"
            value={form.id_rol}
            onChange={(e) => setForm((prev) => ({ ...prev, id_rol: e.target.value }))}
            helperText="Identificador numérico del rol"
          />

          <Input
            label="ID Empresa"
            icon={faBuilding}
            type="number"
            placeholder="Ej: 1"
            value={form.id_empresa}
            onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))}
            helperText="Empresa asociada (opcional)"
          />
        </div>

        {/* Info Box */}
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-blue-600" />
          <p>
            Los cambios se aplicarán inmediatamente después de guardar. El campo de rol e IDs son
            configurables solo por administradores.
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            loading={saving}
            icon={faSave}
            variant="primary"
            size="lg"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </section>
  );
}
