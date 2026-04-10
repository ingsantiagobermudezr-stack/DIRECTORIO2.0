import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faChartLine,
  faChevronRight,
  faFire,
  faHeart,
  faImage,
  faMapMarkerAlt,
  faSearch,
  faStar,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, marketplaceApi, reportesApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { favoritosApi } from "../services/api";
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
  const { isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      pushToast({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para agregar favoritos",
        type: "info",
      });
      navigate(`/login?next=/producto/${producto.id}`);
      return;
    }

    try {
      if (isFavorite) {
        await favoritosApi.eliminar(producto.id);
        setIsFavorite(false);
        pushToast({ title: "Eliminado", message: "Producto eliminado de favoritos", type: "success" });
      } else {
        await favoritosApi.agregar(producto.id);
        setIsFavorite(true);
        pushToast({ title: "Agregado", message: "Producto agregado a favoritos", type: "success" });
      }
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo actualizar favoritos",
        type: "error",
      });
    }
  };

  const empresaNombre = producto.empresa?.nombre || null;
  const categoriaNombre = producto.categoria?.nombre || null;
  const estadoNombre = producto.estado?.nombre || null;
  const imagenes = producto.imagenes || [];
  const totalImagenes = imagenes.length;
  const precio = producto.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  const esSinStock = estadoNombre?.toLowerCase().includes("sin stock") || estadoNombre?.toLowerCase().includes("inactivo") || producto.stock === 0;

  // Get first image URL
  const primeraImagen = imagenes.length > 0 ? imagenes[0] : null;
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

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/95 p-2.5 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`transition-colors duration-200 ${isFavorite ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          />
        </button>

        {esSinStock && (
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            Sin stock
          </div>
        )}

        {/* Stock badge */}
        {!esSinStock && producto.stock > 0 && producto.stock <= 5 && (
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            ¡Últimos {producto.stock}!
          </div>
        )}

        {/* Category Badge */}
        {categoriaNombre && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur">
            {categoriaNombre}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Company Name */}
        {empresaNombre ? (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-xs font-bold text-slate-900">
              {empresaNombre[0].toUpperCase()}
            </div>
            <p className="text-xs font-medium text-slate-600 truncate">{empresaNombre}</p>
          </div>
        ) : (
          <p className="mb-2 text-xs text-slate-500">Vendedor independiente</p>
        )}

        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
          {producto.nombre}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{precioFormateado}</span>
        </div>

        {producto.rating_promedio && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={
                    star <= Math.round(pickNumber(producto.rating_promedio))
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }
                  size="xs"
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">
              ({producto.total_reviews || 0})
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <div className={`h-2 w-2 rounded-full ${esSinStock ? "bg-red-500" : producto.stock > 10 ? "bg-green-500" : "bg-orange-500"}`} />
            {producto.stock > 0 ? `${Math.floor(producto.stock)} disponibles` : "Agotado"}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmpresaCard({ empresa }) {
  const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      onClick={() => navigate(`/empresa/${empresa.id}`)}
    >
      <div className="flex items-start gap-4">
        {empresa.logo_url ? (
          <img
            src={`${API_BASE_URL}/empresas/${empresa.id}/logo`}
            alt={`Logo de ${empresa.nombre}`}
            className="h-20 w-20 rounded-xl border-2 border-slate-100 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
            <FontAwesomeIcon icon={faBuilding} className="text-slate-400" size="2x" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
            {empresa.nombre}
          </h3>
          <p className="mt-1.5 truncate text-sm text-slate-600">{empresa.correo}</p>
          {empresa.categoria && (
            <span className="mt-2 inline-block rounded-full bg-gradient-to-r from-primary-100 to-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
              {empresa.categoria.nombre}
            </span>
          )}
        </div>
      </div>

      {empresa.municipio && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-500" />
          <span className="font-medium">{empresa.municipio.nombre}</span>
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const productosDestacados = useAsyncData(async () => {
    const { data } = await marketplaceApi.list({ limit: 12, ordenar: "fecha_publicacion" });
    return data || [];
  });

  const empresasDestacadas = useAsyncData(async () => {
    const { data } = await empresasApi.list({ limit: 8 });
    return data || [];
  });

  const topEmpresas = useAsyncData(async () => {
    try {
      const { data } = await reportesApi.topEmpresasRating({ limit: 6 });
      return data.items || [];
    } catch {
      return [];
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busqueda?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const loading = productosDestacados.loading || empresasDestacadas.loading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Páginas Amarillas
              <span className="block text-slate-900">Marketplace</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-primary-50">
              Descubre empresas, productos y servicios. Conecta con vendedores al instante.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
              <div className="flex rounded-2xl bg-white p-2 shadow-2xl">
                <div className="relative flex-1">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué estás buscando?"
                    className="w-full rounded-l-xl border-0 py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Link
                to="/empresas"
                className="rounded-full bg-white/20 px-4 py-2 font-semibold backdrop-blur transition hover:bg-white/30"
              >
                Ver empresas
              </Link>
              <Link
                to="/marketplace"
                className="rounded-full bg-white/20 px-4 py-2 font-semibold backdrop-blur transition hover:bg-white/30"
              >
                Ver productos
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-white px-4 py-2 font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <FontAwesomeIcon icon={faFire} className="text-orange-500" />
              Productos Destacados
            </h2>
            <p className="mt-1 text-slate-600">Los más populares del marketplace</p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Ver todos
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando productos destacados..." />
        ) : productosDestacados.data?.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">Aún no hay productos publicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {(productosDestacados.data || []).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Companies */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <FontAwesomeIcon icon={faStore} className="text-primary-500" />
              Empresas Destacadas
            </h2>
            <p className="mt-1 text-slate-600">Conoce las mejores empresas del directorio</p>
          </div>
          <Link
            to="/empresas"
            className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Ver todas
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando empresas destacadas..." />
        ) : empresasDestacadas.data?.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">Aún no hay empresas publicadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(empresasDestacadas.data || []).map((empresa) => (
              <EmpresaCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated Companies */}
      {topEmpresas.data?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
              Mejor Valoradas
            </h2>
            <p className="mt-1 text-slate-600">Empresas con mejor calificación</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(topEmpresas.data || []).map((empresa, index) => (
              <div
                key={empresa.id_empresa}
                className="product-card cursor-pointer rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-white p-5 shadow-sm"
                onClick={() => navigate(`/empresa/${empresa.id_empresa}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{empresa.empresa}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" size="xs" />
                        <span>{empresa.rating_promedio?.toFixed(1) || "0.0"}</span>
                        <span className="text-xs text-slate-500">
                          ({empresa.total_reviews} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChartLine} className="text-yellow-500" size="lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center text-white shadow-xl md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">¿Tienes una empresa?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Registra tu empresa y comienza a vender tus productos en nuestro marketplace. ¡Es fácil!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-primary-400"
            >
              Crear cuenta
            </Link>
            <Link
              to="/empresas"
              className="rounded-xl border-2 border-white px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              Ver directorio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
