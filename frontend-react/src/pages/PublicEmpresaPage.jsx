import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuilding,
  faChartLine,
  faEnvelope,
  faImage,
  faLocationDot,
  faMessage,
  faPhone,
  faStar,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, marketplaceApi, reviewsApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const pickNumber = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return 0;
};

function ProductCard({ producto }) {
  const navigate = useNavigate();

  const imagenes = producto.imagenes || [];
  const totalImagenes = imagenes.length;
  const primeraImagen = imagenes.length > 0 ? imagenes[0] : null;
  const precio = producto.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  // Get image URL
  const getImageUrl = (img) => {
    if (!img) return "";
    const url = typeof img === "string" ? img : img.imagen_url || img.url || "";
    return url.startsWith("/") ? url.slice(1) : url;
  };

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 to-slate-50 aspect-square">
        {primeraImagen ? (
          <img
            src={`${API_BASE_URL}/${getImageUrl(primeraImagen)}`}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faStore} size="3x" />
          </div>
        )}

        {/* Image Count Badge */}
        {totalImagenes > 1 && (
          <div className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur">
            <FontAwesomeIcon icon={faImage} className="mr-1" />
            {totalImagenes}
          </div>
        )}

        {producto.stock === 0 && (
          <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            Sin stock
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
          {producto.nombre}
        </h3>
        <p className="mt-2 text-xl font-bold text-slate-900">{precioFormateado}</p>
        <p className="mt-1 text-xs text-slate-500">{producto.stock ?? 0} disponibles</p>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-200 text-sm font-bold text-primary-700">
            {review.usuario?.nombre?.[0] || "U"}
          </div>
          <span className="font-semibold text-slate-900">
            {review.usuario?.nombre || "Usuario"} {review.usuario?.apellido || ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              className={
                star <= Math.round(pickNumber(review.calificacion))
                  ? "text-yellow-400"
                  : "text-slate-300"
              }
              size="xs"
            />
          ))}
          <span className="ml-1 text-xs text-slate-500">
            {pickNumber(review.calificacion).toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-700">{review.comentario || "Sin comentario"}</p>
      {review.fecha && (
        <p className="mt-2 text-xs text-slate-500">
          {new Date(review.fecha).toLocaleDateString("es-CO")}
        </p>
      )}
    </div>
  );
}

export function PublicEmpresaPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState("productos");

  const idEmpresa = Number(empresaId);

  const empresa = useAsyncData(async () => {
    if (!idEmpresa) return null;
    return (await empresasApi.get(idEmpresa)).data;
  }, idEmpresa);

  const productos = useAsyncData(async () => {
    if (!idEmpresa) return [];
    return (await marketplaceApi.list({ id_empresa: idEmpresa, limit: 100, ordenar: "fecha_publicacion" })).data || [];
  }, idEmpresa);

  const reviews = useAsyncData(async () => {
    if (!idEmpresa) return [];
    return (await reviewsApi.listEmpresa(idEmpresa)).data || [];
  }, idEmpresa);

  if (empresa.loading || productos.loading || reviews.loading) {
    return <Loading text="Cargando ficha de empresa..." />;
  }

  if (!empresa.data) {
    return <EmptyState title="Empresa no encontrada" description="Verifica el enlace o intenta desde el listado de empresas." />;
  }

  const data = empresa.data;
  const productosList = Array.isArray(productos.data) ? productos.data : [];
  const reviewsList = Array.isArray(reviews.data) ? reviews.data : [];

  const promedioRating =
    reviewsList.length > 0
      ? reviewsList.reduce((acc, item) => acc + pickNumber(item.calificacion), 0) / reviewsList.length
      : 0;

  const totalClicks = productosList.reduce(
    (acc, item) => acc + pickNumber(item.total_clicks, item.clicks, item.cantidad_clicks),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-primary-600">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/empresas" className="hover:text-primary-600">
              Empresas
            </Link>
            <span>/</span>
            <span className="text-slate-900">{data.nombre}</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {data.logo_url ? (
                <img
                  src={`${API_BASE_URL}/empresas/${data.id}/logo`}
                  alt={`Logo de ${data.nombre}`}
                  className="h-24 w-24 rounded-xl border-2 border-slate-200 object-cover shadow-sm md:h-32 md:w-32"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 md:h-32 md:w-32">
                  <FontAwesomeIcon icon={faBuilding} className="text-slate-400" size="2x" />
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-slate-900">{data.nombre}</h1>
                {data.categoria && (
                  <span className="mt-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                    {data.categoria.nombre}
                  </span>
                )}
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {data.correo && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary-500" />
                      <span>{data.correo}</span>
                    </div>
                  )}
                  {data.telefono && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="text-primary-500" />
                      <span>{data.telefono}</span>
                    </div>
                  )}
                  {data.direccion && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="text-primary-500" />
                      <span>{data.direccion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isAuthenticated && (
                <a
                  href={`mailto:${data.correo}`}
                  className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-primary-400"
                >
                  <FontAwesomeIcon icon={faMessage} />
                  Contactar
                </a>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <div className="flex items-center justify-center text-2xl font-bold text-primary-600">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
                {promedioRating.toFixed(1)}
              </div>
              <p className="mt-1 text-xs text-slate-600">Rating promedio</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{reviewsList.length}</div>
              <p className="mt-1 text-xs text-slate-600">Reseñas</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{productosList.length}</div>
              <p className="mt-1 text-xs text-slate-600">Productos</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <div className="flex items-center justify-center text-2xl font-bold text-primary-600">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                {totalClicks}
              </div>
              <p className="mt-1 text-xs text-slate-600">Clics totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("productos")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "productos"
                ? "border-b-2 border-primary-500 text-primary-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faStore} className="mr-2" />
            Productos ({productosList.length})
          </button>
          <button
            onClick={() => setActiveTab("resenas")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "resenas"
                ? "border-b-2 border-primary-500 text-primary-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faStar} className="mr-2" />
            Reseñas ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "productos" && (
          <div>
            {productosList.length === 0 ? (
              <EmptyState
                title="Sin productos"
                description="Esta empresa aún no tiene productos publicados"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {productosList.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "resenas" && (
          <div className="space-y-4">
            {reviewsList.length === 0 ? (
              <EmptyState
                title="Sin reseñas"
                description="Aún no hay reseñas para esta empresa"
              />
            ) : (
              reviewsList.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
