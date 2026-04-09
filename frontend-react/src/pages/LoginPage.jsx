import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { signin, signup } = useAuth();
  const { pushToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    correo: "",
  });

  const onSubmit = async (event) => {
    event.preventDefault();
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
      pushToast({ title: "Sesión iniciada", message: "Bienvenido al panel", type: "success" });
      navigate("/");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-100 via-white to-emerald-100 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">{APP_NAME}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Conexión directa con FastAPI en entorno productivo.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isRegister ? (
            <>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Apellido"
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                type="email"
                placeholder="Correo"
                value={form.correo}
                onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
                required
              />
            </>
          ) : (
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Correo"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          )}

          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : isRegister ? "Registrarme" : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsRegister((prev) => !prev)}
          className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          {isRegister ? "Ya tengo cuenta" : "No tengo cuenta"}
        </button>
      </div>
    </div>
  );
}
