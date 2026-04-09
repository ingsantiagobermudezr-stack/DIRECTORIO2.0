import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChartLine,
  faImage,
  faMousePointer,
  faStore,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { EmptyState } from "../components/common/EmptyState";
import { Loading } from "../components/common/Loading";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, marketplaceApi, reportesApi, reviewsApi } from "../services/api";
import { API_BASE_URL } from "../config/env";

const pickNumber = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return 0;
};

export function PublicEmpresaDetallePage() {
  const { empresaId } = useParams();
  const idEmpresa = Number(empresaId);

  const empresa = useAsyncData(async () => {
    if (!idEmpresa) {
      return null;
    }
    return (await empresasApi.get(idEmpresa)).data;
  }, idEmpresa);

  const productos = useAsyncData(async () => {
    if (!idEmpresa) {
      return [];
    }
    return (await marketplaceApi.list({ id_empresa: idEmpresa, limit: 100, ordenar: "fecha_publicacion" })).data || [];
  }, idEmpresa);

  const reviews = useAsyncData(async () => {
    if (!idEmpresa) {
      return [];
    }
    return (await reviewsApi.listEmpresa(idEmpresa)).data || [];
  }, idEmpresa);

  const topProductosChat = useAsyncData(async () => {
    try {
      return (await reportesApi.topProductosChats({ limit: 200 })).data || [];
    } catch {
      return [];
    }
  }, idEmpresa);

  if (empresa.loading || productos.loading || reviews.loading || topProductosChat.loading) {
    return <Loading text="Cargando ficha de empresa" />;
  }

  if (!empresa.data) {
    return <EmptyState title="Empresa no encontrada" description="Verifica el enlace o intenta desde el listado de empresas." />;
  }

  const productosList = Array.isArray(productos.data) ? productos.data : [];
  const reviewsList = Array.isArray(reviews.data) ? reviews.data : [];
  const topChatsList = Array.isArray(topProductosChat.data) ? topProductosChat.data : [];

  const promedioRating =
    reviewsList.length > 0
      ? reviewsList.reduce((acc, item) => acc + pickNumber(item.calificacion), 0) / reviewsList.length
      : 0;

  const clicksTotales = productosList.reduce(
    (acc, item) =>
      acc +
      pickNumber(
        item.total_clicks,
        item.clicks,
        item.cantidad_clicks,
        item.contador_clicks,
      ),
    0,
  );

  const productoIds = new Set(productosList.map((item) => item.id));
  const chatsTotales = topChatsList.reduce((acc, item) => {
    const idMarketplace = pickNumber(item.id_marketplace, item.id, item.marketplace_id);
    if (!productoIds.has(idMarketplace)) {
      return acc;
    }
    return acc + pickNumber(item.total_chats, item.chats, item.cantidad_chats);
  }, 0);

  const scorePopularidad = Math.round(promedioRating * 15 + clicksTotales * 2 + chatsTotales * 3);

  const metricas = [
    { label: "Rating promedio", value: promedioRating ? promedioRating.toFixed(1) : "0.0", icon: faStar },
    { label: "Productos", value: String(productosList.length), icon: faStore },
    { label: "Clics", value: String(clicksTotales), icon: faMousePointer },
    { label: "Popularidad", value: String(scorePopularidad), icon: faChartLine },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/empresas" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a empresas
        </Link>
        <Link
          to={`/marketplace?id_empresa=${idEmpresa}`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ver articulos de esta empresa
        </Link>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {empresa.data.logo_url ? (
              <img
                src={`${API_BASE_URL}/empresas/${empresa.data.id}/logo`} // Cache busting
                alt={`Logo de ${empresa.data.nombre}`}
                className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <FontAwesomeIcon icon={faImage} size="lg" />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{empresa.data.nombre || "Empresa sin nombre"}</h2>
              <p className="mt-1 text-sm text-slate-600">{empresa.data.correo || "Correo no disponible"}</p>
              <p className="mt-1 text-sm text-slate-500">{empresa.data.direccion || "Dirección no registrada"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            NIT: {empresa.data.nit || "-"} | Tel: {empresa.data.telefono || "-"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricas.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <FontAwesomeIcon icon={item.icon} className="mr-1" />
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            </article>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Productos de la empresa</h3>
        {productosList.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Esta empresa todavía no tiene productos publicados.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {productosList.map((producto) => {
              const clicks = pickNumber(
                producto.total_clicks,
                producto.clicks,
                producto.cantidad_clicks,
                producto.contador_clicks,
              );
              return (
                <article key={producto.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{producto.nombre}</p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{producto.descripcion || "Sin descripción"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">Precio: {producto.precio ?? 0}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">Stock: {producto.stock ?? 0}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">Clics: {clicks}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Reseñas y percepción</h3>
        {reviewsList.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Aún no hay reseñas para esta empresa.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {reviewsList.slice(0, 8).map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Usuario #{review.id_usuario}</p>
                  <p className="text-sm font-semibold text-amber-600">{pickNumber(review.calificacion).toFixed(1)} / 5</p>
                </div>
                <p className="mt-1 text-sm text-slate-700">{review.comentario || "Sin comentario"}</p>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
