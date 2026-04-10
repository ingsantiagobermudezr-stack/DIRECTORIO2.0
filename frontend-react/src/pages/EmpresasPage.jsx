import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faImage, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { Loading } from "../components/common/Loading";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, empresasApi, geoApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { PermissionGate } from "../components/common/PermissionGate";
import { API_BASE_URL } from "../config/env";

export function EmpresasPage({ readOnly = false }) {
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nombre, setNombre] = useState(searchParams.get("search") || "");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    nombre: "",
    nit: "",
    correo: "",
    direccion: "",
    telefono: "",
    id_categoria: "",
    id_municipio: "",
  });
  const [logoArchivo, setLogoArchivo] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    correo: "",
    direccion: "",
    telefono: "",
    id_categoria: "",
    id_pais: "",
    id_departamento: "",
    id_municipio: "",
  });

  const categorias = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const paises = useAsyncData(async () => (await geoApi.paises({ limit: 200 })).data);
  const departamentos = useAsyncData(
    async () => (await geoApi.departamentos({ id_pais: form.id_pais || undefined, limit: 300 })).data,
    form.id_pais,
  );
  const municipios = useAsyncData(
    async () => (await geoApi.municipios({ id_departamento: form.id_departamento || undefined, limit: 400 })).data,
    form.id_departamento,
  );

  const empresas = useAsyncData(async () => {
    const { data } = await empresasApi.list({ search: nombre || undefined, limit: 30 });
    return data;
  }, nombre);

  const crearEmpresa = async (event) => {
    event.preventDefault();
    try {
      await empresasApi.create({
        nombre: form.nombre,
        nit: form.nit,
        correo: form.correo,
        direccion: form.direccion,
        telefono: form.telefono,
        id_categoria: Number(form.id_categoria),
        id_municipio: Number(form.id_municipio),
      });
      pushToast({ title: "Empresa creada", message: "Registro completado", type: "success" });
      setForm({
        nombre: "",
        nit: "",
        correo: "",
        direccion: "",
        telefono: "",
        id_categoria: "",
        id_pais: "",
        id_departamento: "",
        id_municipio: "",
      });
      empresas.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const cargarDetalle = async (idEmpresa) => {
    try {
      const { data } = await empresasApi.get(idEmpresa);
      setEmpresaSeleccionada(data);
      setEditForm({
        id: data.id,
        nombre: data.nombre || "",
        nit: data.nit || "",
        correo: data.correo || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        id_categoria: String(data.id_categoria || data.categoria?.id || ""),
        id_municipio: String(data.id_municipio || data.municipio?.id || ""),
      });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar detalle", type: "error" });
    }
  };

  const actualizarEmpresa = async (event) => {
    event.preventDefault();
    try {
      await empresasApi.update(Number(editForm.id), {
        nombre: editForm.nombre,
        nit: editForm.nit,
        correo: editForm.correo,
        direccion: editForm.direccion,
        telefono: editForm.telefono,
        id_categoria: Number(editForm.id_categoria),
        id_municipio: Number(editForm.id_municipio),
      });
      pushToast({ title: "Empresa actualizada", message: "Cambios guardados", type: "success" });
      await cargarDetalle(Number(editForm.id));
      empresas.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const subirLogo = async () => {
    if (!editForm.id || !logoArchivo) {
      pushToast({ title: "Dato requerido", message: "Selecciona una empresa y un archivo", type: "error" });
      return;
    }
    try {
      await empresasApi.uploadLogo(Number(editForm.id), logoArchivo);
      pushToast({ title: "Logo actualizado", message: "Archivo subido correctamente", type: "success" });
      setLogoArchivo(null);
      await cargarDetalle(Number(editForm.id));
      empresas.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo subir logo", type: "error" });
    }
  };

  const eliminarEmpresa = async (idEmpresa) => {
    const confirmado = window.confirm("¿Seguro que deseas desactivar esta empresa?");
    if (!confirmado) {
      return;
    }
    try {
      await empresasApi.remove(idEmpresa);
      pushToast({ title: "Empresa desactivada", message: `Empresa ${idEmpresa} eliminada`, type: "success" });
      if (Number(editForm.id) === Number(idEmpresa)) {
        setEmpresaSeleccionada(null);
        setEditForm({ id: "", nombre: "", nit: "", correo: "", direccion: "", telefono: "", id_categoria: "", id_municipio: "" });
      }
      empresas.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const marketplacePath = readOnly ? "/marketplace" : "/admin/marketplace";

  if (readOnly) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Empresas</h3>
          <p className="mt-1 text-sm text-slate-600">Selecciona una empresa para ver su ficha completa, productos y métricas.</p>
          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Buscar por nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={empresas.reload}>
              Refrescar
            </button>
          </div>
        </div>

        {empresas.loading ? <Loading /> : null}
        {!empresas.loading && (empresas.data || []).length === 0 ? (
          <EmptyState title="Sin empresas" description="No hay empresas publicadas en este momento." />
        ) : null}

        {!empresas.loading && (empresas.data || []).length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(empresas.data || []).map((empresa) => (
              <article
                key={empresa.id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/empresa/${empresa.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    {empresa.logo_url ? (
                      <img
                        src={`${API_BASE_URL}/empresas/${empresa.id}/logo`} // Cache busting
                        alt={`Logo de ${empresa.nombre}`}
                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-semibold text-slate-900">{empresa.nombre || "Empresa sin nombre"}</h4>
                      <p className="mt-1 truncate text-sm text-slate-500">{empresa.correo || "Correo no disponible"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">NIT: {empresa.nit || "-"}</div>
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">Contacto: {empresa.correo}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-semibold text-teal-700">
                    <span>Ver ficha completa</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="transition group-hover:translate-x-0.5" />
                  </div>
                </button>
              </article>
            ))}
          </div>
        ) : null}

        <article className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-teal-800">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} />
            <span>Explora empresas y entra a sus fichas para revisar productos, calificaciones y popularidad.</span>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Empresas</h3>
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Buscar por nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={empresas.reload}>
            Refrescar
          </button>
        </div>
      </div>

      {empresas.loading ? <Loading /> : null}
      {!empresas.loading && (empresas.data || []).length === 0 ? (
        <EmptyState
          title="Sin empresas"
          description={readOnly ? "No hay empresas publicadas en este momento." : "Crea el primer registro desde el formulario."}
        />
      ) : null}
      {!empresas.loading && (empresas.data || []).length > 0 ? (
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "nombre", label: "Nombre" },
            { key: "correo", label: "Correo" },
            { key: "nit", label: "NIT" },
            {
              key: "acciones",
              label: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => cargarDetalle(row.id)}>
                    Detalle
                  </button>
                  <button
                    className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white"
                    onClick={() => navigate(`${marketplacePath}?id_empresa=${row.id}`)}
                  >
                    Ver articulos
                  </button>
                  {!readOnly ? (
                    <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminarEmpresa(row.id)}>
                      Eliminar
                    </button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={empresas.data || []}
        />
      ) : null}

      {empresaSeleccionada ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detalle empresa #{empresaSeleccionada.id}</h3>
          <p className="mt-1 text-sm text-slate-600">{empresaSeleccionada.nombre} | {empresaSeleccionada.correo}</p>
          {empresaSeleccionada.logo_url ? (
            <p className="mt-1 text-xs text-slate-500">Logo: {empresaSeleccionada.logo_url}</p>
          ) : null}
        </div>
      ) : null}

      {!readOnly ? (
        <>
          <PermissionGate
            anyOf={["modificar_empresas"]}
            fallback={
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                No tienes permiso `modificar_empresas` para editar o eliminar empresas.
              </article>
            }
          >
            <form onSubmit={actualizarEmpresa} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Editar empresa</h3>
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID empresa" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="NIT" value={editForm.nit} onChange={(e) => setEditForm((prev) => ({ ...prev, nit: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Correo" type="email" value={editForm.correo} onChange={(e) => setEditForm((prev) => ({ ...prev, correo: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Dirección" value={editForm.direccion} onChange={(e) => setEditForm((prev) => ({ ...prev, direccion: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Teléfono" value={editForm.telefono} onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))} required />

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_categoria} onChange={(e) => setEditForm((prev) => ({ ...prev, id_categoria: e.target.value }))} required>
                <option value="">Selecciona categoría</option>
                {(categorias.data || []).map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={editForm.id_municipio} onChange={(e) => setEditForm((prev) => ({ ...prev, id_municipio: e.target.value }))} required>
                <option value="">Selecciona municipio</option>
                {(municipios.data || []).map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>{municipio.nombre}</option>
                ))}
              </select>

              <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Guardar cambios</button>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Subir logo</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID empresa" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} />
                <input className="rounded-xl border border-slate-300 px-3 py-2" type="file" onChange={(e) => setLogoArchivo(e.target.files?.[0] || null)} />
                <button className="rounded-xl bg-teal-600 px-4 py-2 text-white" onClick={subirLogo}>Subir logo</button>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate
            anyOf={["crear_empresa"]}
            fallback={
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                No tienes permiso `crear_empresa` para registrar nuevas empresas.
              </article>
            }
          >
            <form onSubmit={crearEmpresa} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Crear empresa</h3>
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="NIT" value={form.nit} onChange={(e) => setForm((prev) => ({ ...prev, nit: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Correo" type="email" value={form.correo} onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Dirección" value={form.direccion} onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))} required />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} required />

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_categoria} onChange={(e) => setForm((prev) => ({ ...prev, id_categoria: e.target.value }))} required>
                <option value="">Selecciona categoría</option>
                {(categorias.data || []).map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>

              <select
                className="rounded-xl border border-slate-300 px-3 py-2"
                value={form.id_pais}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, id_pais: e.target.value, id_departamento: "", id_municipio: "" }))
                }
                required
              >
                <option value="">Selecciona país</option>
                {(paises.data || []).map((pais) => (
                  <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                ))}
              </select>

              <select
                className="rounded-xl border border-slate-300 px-3 py-2"
                value={form.id_departamento}
                onChange={(e) => setForm((prev) => ({ ...prev, id_departamento: e.target.value, id_municipio: "" }))}
                required
                disabled={!form.id_pais}
              >
                <option value="">Selecciona departamento</option>
                {(departamentos.data || []).map((departamento) => (
                  <option key={departamento.id} value={departamento.id}>{departamento.nombre}</option>
                ))}
              </select>

              <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.id_municipio} onChange={(e) => setForm((prev) => ({ ...prev, id_municipio: e.target.value }))} required disabled={!form.id_departamento}>
                <option value="">Selecciona municipio</option>
                {(municipios.data || []).map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>{municipio.nombre}</option>
                ))}
              </select>

              <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Crear empresa</button>
            </form>
          </PermissionGate>
        </>
      ) : null}
    </section>
  );
}
