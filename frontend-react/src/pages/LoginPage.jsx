import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faRightToBracket,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { APP_NAME } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signin, signup } = useAuth();
  const { pushToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    correo: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (isRegister) {
      if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
      if (!form.apellido.trim()) newErrors.apellido = "El apellido es requerido";
      if (!form.correo.trim()) {
        newErrors.correo = "El correo es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
        newErrors.correo = "El correo no tiene un formato válido";
      }
    } else {
      if (!form.username.trim()) {
        newErrors.username = "El correo es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username)) {
        newErrors.username = "El correo no tiene un formato válido";
      }
    }

    if (!form.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      pushToast({
        title: "Error de validación",
        message: "Por favor, corrige los errores en el formulario",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signup({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          password: form.password,
        });
      } else {
        await signin({ username: form.username, password: form.password });
      }
      const nextPath = searchParams.get("next");
      const safeNextPath = nextPath?.startsWith("/") ? nextPath : "/";
      pushToast({ title: "Sesión iniciada", message: "Bienvenido al marketplace", type: "success" });
      navigate(safeNextPath);
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No fue posible autenticar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-50 px-4 py-10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-300 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-400 opacity-20 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-xl rounded-3xl border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 shadow-lg">
            <span className="text-3xl font-bold text-slate-900">{APP_NAME[0]}</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{APP_NAME}</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {isRegister ? "Crear cuenta" : "¡Bienvenido de nuevo!"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isRegister
              ? "Regístrate para acceder al marketplace"
              : "Inicia sesión para continuar"}
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          {isRegister ? (
            <>
              <Input
                label="Nombre"
                icon={faUser}
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                error={errors.nombre}
                required
              />

              <Input
                label="Apellido"
                icon={faUser}
                placeholder="Tu apellido"
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                error={errors.apellido}
                required
              />

              <Input
                label="Correo"
                icon={faEnvelope}
                type="email"
                placeholder="tu@correo.com"
                value={form.correo}
                onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
                error={errors.correo}
                required
              />
            </>
          ) : (
            <Input
              label="Correo"
              icon={faEnvelope}
              type="email"
              placeholder="tu@correo.com"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              error={errors.username}
              required
            />
          )}

          <Input
            label="Contraseña"
            icon={faLock}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            rightIcon={showPassword ? faEyeSlash : faEye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            error={errors.password}
            helperText={!errors.password && "Mínimo 8 caracteres"}
            required
          />

          <Button
            type="submit"
            loading={loading}
            icon={isRegister ? faUserPlus : faRightToBracket}
            fullWidth
          >
            {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </Button>
        </form>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setIsRegister((prev) => !prev)}
          className="mt-6 w-full rounded-xl border-2 border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
        >
          <FontAwesomeIcon icon={isRegister ? faRightToBracket : faUserPlus} className="mr-2" />
          {isRegister ? "Ya tengo cuenta" : "No tengo cuenta"}
        </button>
      </div>
    </div>
  );
}
