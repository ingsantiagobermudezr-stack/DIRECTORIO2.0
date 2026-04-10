import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faShieldHalved,
  faSave,
  faUserGear,
  faArrowLeft,
  faStore,
  faHeart,
  faBell,
  faMessage,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { authApi, usuariosApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Loading } from "../components/common/Loading";

export function PublicPerfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user?.id_usuario) {
        return;
      }
      setLoading(true);
      try {
        // Obtener datos completos del usuario desde la API
        const { data } = await usuariosApi.get(user.id_usuario);
        setPerfilCompleto(data);
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          password: "",
          confirmPassword: "",
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

    // Validar contraseñas
    if (form.password && form.password !== form.confirmPassword) {
      pushToast({
        title: "Error",
        message: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }

    if (form.password && form.password.length < 8) {
      pushToast({
        title: "Error",
        message: "La contraseña debe tener al menos 8 caracteres",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
      };

      // Solo incluir contraseña si se proporcionó
      if (form.password) {
        payload.password = form.password;
      }

      await authApi.updatePerfil(payload);

      pushToast({
        title: "Perfil actualizado",
        message: form.password 
          ? "Tus datos y contraseña han sido actualizados exitosamente"
          : "Tus datos han sido guardados exitosamente",
        type: "success",
      });

      // Limpiar campos de contraseña
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
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
  const isAdmin = user?.rol === "admin" || user?.permisos?.includes("crear_empresa");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-slate-50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
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
                {user?.rol && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span className="capitalize">{user.rol}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/favoritos"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FontAwesomeIcon icon={faHeart} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mis Favoritos</p>
              <p className="text-xs text-slate-600">Ver productos guardados</p>
            </div>
          </Link>

          <Link
            to="/admin/mensajes"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faMessage} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mensajes</p>
              <p className="text-xs text-slate-600">Chats con vendedores</p>
            </div>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <FontAwesomeIcon icon={faStore} size="lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Panel Admin</p>
                <p className="text-xs text-slate-600">Gestionar marketplace</p>
              </div>
            </Link>
          )}
        </div>

        {/* Formulario de Edición */}
        <form onSubmit={guardar} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          </div>

          {/* Sección de Contraseña */}
          <div className="mt-8">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FontAwesomeIcon icon={faLock} className="text-primary-500" />
              Cambiar Contraseña (opcional)
            </h4>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Nueva Contraseña"
                icon={faLock}
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                rightIcon={showPassword ? faEyeSlash : faEye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                helperText="Dejar vacío para mantener la contraseña actual"
              />

              <Input
                label="Confirmar Contraseña"
                icon={faLock}
                type={showPassword ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                helperText="Debe coincidir con la contraseña anterior"
              />
            </div>
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
      </div>
    </div>
  );
}
