import { useState } from "react";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { Loading } from "../components/common/Loading";
import { useAsyncData } from "../hooks/useAsyncData";
import { favoritosApi } from "../services/api";
import { useToast } from "../context/ToastContext";

export function FavoritosPage() {
  const { pushToast } = useToast();
  const [idMarketplace, setIdMarketplace] = useState("");
  const [verificacion, setVerificacion] = useState(null);

  const favoritos = useAsyncData(async () => (await favoritosApi.misFavoritos({ limit: 50 })).data);
  const conteo = useAsyncData(async () => (await favoritosApi.contar()).data);

  const agregar = async () => {
    if (!idMarketplace) {
      return;
    }
    try {
      await favoritosApi.agregar(Number(idMarketplace));
      pushToast({ title: "Favorito agregado", message: "Producto añadido a tu lista", type: "success" });
      setIdMarketplace("");
      setVerificacion(true);
      favoritos.reload();
      conteo.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo agregar", type: "error" });
    }
  };

  const eliminar = async (row) => {
    try {
      await favoritosApi.eliminar(row.id_marketplace);
      pushToast({ title: "Favorito eliminado", message: "Se retiró de tu lista", type: "success" });
      favoritos.reload();
      conteo.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const verificar = async () => {
    if (!idMarketplace) {
      return;
    }
    try {
      const { data } = await favoritosApi.verificar(Number(idMarketplace));
      setVerificacion(Boolean(data?.en_favoritos));
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo verificar", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Wishlist y favoritos</h3>
        <p className="mt-1 text-sm text-slate-600">Total en favoritos: <strong>{conteo.data?.cantidad || 0}</strong></p>
        <div className="mt-3 flex gap-2">
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="ID marketplace" value={idMarketplace} onChange={(e) => setIdMarketplace(e.target.value)} />
          <button className="rounded-xl bg-teal-600 px-4 py-2 text-white" onClick={agregar}>Agregar</button>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={verificar}>Verificar</button>
        </div>
        {verificacion !== null ? (
          <p className="mt-2 text-xs font-semibold text-slate-600">
            Estado del producto consultado: {verificacion ? "Ya está en favoritos" : "No está en favoritos"}
          </p>
        ) : null}
      </div>

      {favoritos.loading ? <Loading /> : null}
      {!favoritos.loading && (favoritos.data || []).length === 0 ? (
        <EmptyState title="No tienes favoritos" description="Agrega productos para activar alertas de cambios de precio." />
      ) : null}
      {!favoritos.loading && (favoritos.data || []).length > 0 ? (
        <DataTable
          columns={[
            { key: "id", label: "ID favorito" },
            { key: "id_marketplace", label: "Producto" },
            { key: "fecha_agregado", label: "Fecha" },
            {
              key: "acciones",
              label: "Acción",
              render: (row) => (
                <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => eliminar(row)}>
                  Quitar
                </button>
              ),
            },
          ]}
          rows={favoritos.data || []}
        />
      ) : null}
    </section>
  );
}
