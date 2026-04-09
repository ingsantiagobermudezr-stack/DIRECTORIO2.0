import { useState } from "react";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { useAsyncData } from "../hooks/useAsyncData";
import { comprobantesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";

export function ComprobantesPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { pushToast } = useToast();
  const [filtros, setFiltros] = useState({ estado: "", evaluador: "", texto: "", desde: "", hasta: "" });
  const [detalleId, setDetalleId] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [form, setForm] = useState({
    id_mensaje: "",
    id_empleado_evaluador: String(user?.id_usuario || ""),
    recibo_valido: true,
    cantidad_recibida: "",
    archivo: null,
  });

  const comprobantes = useAsyncData(async () => (await comprobantesApi.list({ limit: 50 })).data);

  const comprobantesFiltrados = (comprobantes.data || []).filter((row) => {
    const matchEstado = filtros.estado ? String(row.estado || "").toLowerCase() === String(filtros.estado).toLowerCase() : true;
    const matchEvaluador = filtros.evaluador ? Number(row.id_empleado_evaluador) === Number(filtros.evaluador) : true;
    const text = (filtros.texto || "").trim().toLowerCase();
    const matchTexto = text
      ? [row.id, row.id_mensaje, row.id_archivo].some((v) => String(v || "").toLowerCase().includes(text))
      : true;

    const fecha = row.fecha_creacion ? new Date(row.fecha_creacion) : null;
    const matchDesde = filtros.desde && fecha ? fecha >= new Date(filtros.desde) : true;
    const matchHasta = filtros.hasta && fecha ? fecha <= new Date(filtros.hasta) : true;

    return matchEstado && matchEvaluador && matchTexto && matchDesde && matchHasta;
  });

  const cargarTimeline = async (id) => {
    try {
      const { data } = await comprobantesApi.timeline(id);
      setTimeline(data);
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar timeline", type: "error" });
    }
  };

  const cargarDetalle = async () => {
    if (!detalleId) {
      return;
    }
    try {
      const { data } = await comprobantesApi.get(Number(detalleId));
      setDetalle(data);
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar detalle", type: "error" });
    }
  };

  const puedeResolver = (row) => isAdmin || Number(row.id_empleado_evaluador) === Number(user?.id_usuario);

  const resolver = async (row, action) => {
    if (!puedeResolver(row)) {
      pushToast({
        title: "Sin acceso",
        message: "Solo el evaluador asignado o admin puede resolver este comprobante",
        type: "error",
      });
      return;
    }

    try {
      if (action === "aprobar") {
        await comprobantesApi.aprobar(row.id);
      } else {
        await comprobantesApi.rechazar(row.id);
      }
      pushToast({ title: "Comprobante actualizado", message: `Estado: ${action}`, type: "success" });
      comprobantes.reload();
      cargarTimeline(row.id);
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo resolver", type: "error" });
    }
  };

  const registrar = async (event) => {
    event.preventDefault();
    if (!form.archivo) {
      pushToast({ title: "Archivo requerido", message: "Adjunta imagen del comprobante", type: "error" });
      return;
    }

    try {
      await comprobantesApi.registrarDesdeArchivo({
        id_mensaje: Number(form.id_mensaje),
        id_empleado_evaluador: Number(form.id_empleado_evaluador),
        recibo_valido: form.recibo_valido,
        cantidad_recibida: Number(form.cantidad_recibida),
        archivo: form.archivo,
      });
      pushToast({ title: "Comprobante registrado", message: "Operación completada", type: "success" });
      setForm({
        id_mensaje: "",
        id_empleado_evaluador: String(user?.id_usuario || ""),
        recibo_valido: true,
        cantidad_recibida: "",
        archivo: null,
      });
      comprobantes.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo registrar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Filtros de comprobantes</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Estado" value={filtros.estado} onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID evaluador" value={filtros.evaluador} onChange={(e) => setFiltros((prev) => ({ ...prev, evaluador: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Buscar por ID mensaje/archivo" value={filtros.texto} onChange={(e) => setFiltros((prev) => ({ ...prev, texto: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={filtros.desde} onChange={(e) => setFiltros((prev) => ({ ...prev, desde: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={filtros.hasta} onChange={(e) => setFiltros((prev) => ({ ...prev, hasta: e.target.value }))} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Detalle por ID</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID comprobante" value={detalleId} onChange={(e) => setDetalleId(e.target.value)} />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={cargarDetalle}>Consultar</button>
        </div>
        {detalle ? (
          <p className="mt-2 text-sm text-slate-600">Detalle: comprobante #{detalle.id} | estado {detalle.estado} | archivo {detalle.id_archivo}</p>
        ) : null}
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "id_archivo", label: "Archivo" },
          { key: "estado", label: "Estado" },
          {
            key: "acciones",
            label: "Acciones",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => cargarTimeline(row.id)}>Timeline</button>
                <button
                  className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => resolver(row, "aprobar")}
                  disabled={!puedeResolver(row)}
                  title={!puedeResolver(row) ? "Solo evaluador asignado o admin" : "Aprobar comprobante"}
                >
                  Aprobar
                </button>
                <button
                  className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => resolver(row, "rechazar")}
                  disabled={!puedeResolver(row)}
                  title={!puedeResolver(row) ? "Solo evaluador asignado o admin" : "Rechazar comprobante"}
                >
                  Rechazar
                </button>
              </div>
            ),
          },
        ]}
        rows={comprobantesFiltrados}
      />

      {timeline ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Timeline comprobante #{timeline.comprobante_id}</h3>
          <div className="mt-3 space-y-2">
            {(timeline.timeline || []).map((paso) => (
              <article key={paso.paso} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{paso.paso}</p>
                <p className="text-xs text-slate-600">{paso.descripcion}</p>
                <p className="text-xs text-slate-500">Estado: {paso.estado}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="Sin timeline cargado" description="Selecciona un comprobante para ver su flujo." />
      )}

      <form onSubmit={registrar} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Registrar comprobante desde archivo</h3>
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID mensaje" value={form.id_mensaje} onChange={(e) => setForm((prev) => ({ ...prev, id_mensaje: e.target.value }))} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID evaluador" value={form.id_empleado_evaluador} onChange={(e) => setForm((prev) => ({ ...prev, id_empleado_evaluador: e.target.value }))} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Cantidad recibida" value={form.cantidad_recibida} onChange={(e) => setForm((prev) => ({ ...prev, cantidad_recibida: e.target.value }))} required />
        <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.recibo_valido} onChange={(e) => setForm((prev) => ({ ...prev, recibo_valido: e.target.checked }))} />
          Recibo válido
        </label>
        <input className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2" type="file" onChange={(e) => setForm((prev) => ({ ...prev, archivo: e.target.files?.[0] || null }))} required />
        <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Registrar comprobante</button>
      </form>
    </section>
  );
}
