import { useMemo, useState } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataTable } from "../components/common/DataTable";
import { StatCard } from "../components/common/StatCard";
import { Loading } from "../components/common/Loading";
import { reportesApi } from "../services/api";

export function ReportesPage() {
  const [filtros, setFiltros] = useState({ desde: "", hasta: "", id_empresa: "", limit: "10" });

  const params = useMemo(
    () => ({
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
      id_empresa: filtros.id_empresa || undefined,
      limit: filtros.limit || undefined,
    }),
    [filtros],
  );

  const resumen = useAsyncData(async () => (await reportesApi.transaccionesResumen(params)).data, JSON.stringify(params));
  const evaluadores = useAsyncData(async () => (await reportesApi.tasaAprobacionEvaluadores(params)).data, JSON.stringify(params));
  const topProductos = useAsyncData(async () => (await reportesApi.topProductosChats(params)).data, JSON.stringify(params));
  const topEmpresas = useAsyncData(async () => (await reportesApi.topEmpresasRating(params)).data, JSON.stringify(params));

  const comparativo = useAsyncData(async () => {
    if (!filtros.desde || !filtros.hasta) {
      return null;
    }
    const desdeActual = new Date(filtros.desde);
    const hastaActual = new Date(filtros.hasta);
    const duracionMs = hastaActual.getTime() - desdeActual.getTime();
    if (!Number.isFinite(duracionMs) || duracionMs <= 0) {
      return null;
    }
    const hastaPrev = new Date(desdeActual.getTime() - 1);
    const desdePrev = new Date(hastaPrev.getTime() - duracionMs);

    const actual = await reportesApi.transaccionesResumen(params);
    const previo = await reportesApi.transaccionesResumen({
      ...params,
      desde: desdePrev.toISOString(),
      hasta: hastaPrev.toISOString(),
    });

    const montoActual = actual.data?.resumen_global?.monto_total_valido || 0;
    const montoPrevio = previo.data?.resumen_global?.monto_total_valido || 0;
    const delta = montoActual - montoPrevio;
    const deltaPct = montoPrevio ? (delta / montoPrevio) * 100 : 0;

    return {
      montoActual,
      montoPrevio,
      delta,
      deltaPct,
    };
  }, `${JSON.stringify(params)}-comparativo`);

  if (resumen.loading || evaluadores.loading || topProductos.loading || topEmpresas.loading || comparativo.loading) {
    return <Loading text="Calculando reportes" />;
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Filtros de negocio</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={filtros.desde} onChange={(e) => setFiltros((prev) => ({ ...prev, desde: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="datetime-local" value={filtros.hasta} onChange={(e) => setFiltros((prev) => ({ ...prev, hasta: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID empresa" value={filtros.id_empresa} onChange={(e) => setFiltros((prev) => ({ ...prev, id_empresa: e.target.value }))} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Limit" type="number" min="1" value={filtros.limit} onChange={(e) => setFiltros((prev) => ({ ...prev, limit: e.target.value }))} />
        </div>
        {comparativo.data ? (
          <p className="mt-3 text-sm text-slate-600">
            Comparación período anterior: monto actual <strong>{comparativo.data.montoActual}</strong> vs previo <strong>{comparativo.data.montoPrevio}</strong> ({comparativo.data.delta >= 0 ? "+" : ""}{comparativo.data.deltaPct.toFixed(2)}%).
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Define fecha desde/hasta para ver comparación con período anterior.</p>
        )}
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Transacciones" value={resumen.data?.resumen_global?.total_transacciones || 0} />
        <StatCard title="Monto válido" value={resumen.data?.resumen_global?.monto_total_valido || 0} />
        <StatCard title="Tasa validez" value={`${resumen.data?.resumen_global?.tasa_validez_porcentaje || 0}%`} />
      </div>

      <DataTable
        columns={[
          { key: "evaluador", label: "Evaluador" },
          { key: "total_comprobantes", label: "Total" },
          { key: "aprobados", label: "Aprobados" },
          { key: "tasa_aprobacion_porcentaje", label: "% Aprobación" },
        ]}
        rows={evaluadores.data?.items || []}
      />

      <DataTable
        columns={[
          { key: "producto", label: "Producto" },
          { key: "empresa", label: "Empresa" },
          { key: "chats_iniciados", label: "Chats" },
          { key: "total_mensajes", label: "Mensajes" },
        ]}
        rows={topProductos.data?.items || []}
      />

      <DataTable
        columns={[
          { key: "empresa", label: "Empresa" },
          { key: "rating_promedio", label: "Rating" },
          { key: "total_reviews", label: "Reviews" },
        ]}
        rows={topEmpresas.data?.items || []}
      />
    </section>
  );
}
