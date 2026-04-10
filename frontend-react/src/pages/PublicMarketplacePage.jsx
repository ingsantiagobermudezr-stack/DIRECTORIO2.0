import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faHeart,
  faImage,
  faSearch,
  faStar,
  faStore,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, empresasApi, marketplaceApi, favoritosApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatCompact, parseInput } from "../lib/numbers";

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
  const empresaId = producto.empresa?.id || producto.id_empresa;
  const categoriaNombre = producto.categoria?.nombre || producto.categoria || null;
  const estadoNombre = producto.estado?.nombre || null;
  const imagenes = producto.imagenes || [];
  const totalImagenes = imagenes.length;
  const primeraImagen = imagenes.length > 0 ? imagenes[0] : null;
  const precio = producto.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  const esSinStock = estadoNombre?.toLowerCase().includes("sin stock") || estadoNombre?.toLowerCase().includes("inactivo") || producto.stock === 0;

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

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/95 p-2.5 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`transition-colors duration-200 ${isFavorite ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          />
        </button>

        {/* Stock Badge */}
        {esSinStock && (
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            Sin stock
          </div>
        )}

        {/* Low Stock Badge */}
        {!esSinStock && producto.stock > 0 && producto.stock <= 5 && (
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            ¡Últimos {Math.floor(producto.stock)}!
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

        {/* Product Name */}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
          {producto.nombre}
        </h3>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{precioFormateado}</span>
        </div>

        {/* Rating */}
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

        {/* Stock & Date */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <div className={`h-2 w-2 rounded-full ${esSinStock ? "bg-red-500" : producto.stock > 10 ? "bg-green-500" : "bg-orange-500"}`} />
            {Math.floor(producto.stock ?? 0)} disponibles
          </span>
          {producto.fecha_publicacion && (
            <span className="text-xs text-slate-500">
              {new Date(producto.fecha_publicacion).toLocaleDateString("es-CO", { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PublicMarketplacePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    id_categoria: searchParams.get("id_categoria") || "",
    id_empresa: searchParams.get("id_empresa") || "",
    precio_min: searchParams.get("precio_min") || "",
    precio_max: searchParams.get("precio_max") || "",
    ordenar: searchParams.get("ordenar") || "fecha_publicacion",
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filtros.id_categoria) params.set("id_categoria", filtros.id_categoria);
    if (filtros.id_empresa) params.set("id_empresa", filtros.id_empresa);
    if (filtros.precio_min) params.set("precio_min", parseInput(filtros.precio_min));
    if (filtros.precio_max) params.set("precio_max", parseInput(filtros.precio_max));
    if (filtros.ordenar) params.set("ordenar", filtros.ordenar);
    setSearchParams(params);
  };

  const productos = useAsyncData(async () => {
    const params = {
      search: search || undefined,
      limit: 50,
      id_categoria: filtros.id_categoria || undefined,
      id_empresa: filtros.id_empresa || undefined,
      precio_min: filtros.precio_min || undefined,
      precio_max: filtros.precio_max || undefined,
      ordenar: filtros.ordenar || "fecha_publicacion",
    };

    const { data } = await marketplaceApi.list(params);
    return data || [];
  }, `${search}-${JSON.stringify(filtros)}`);

  const categoriasData = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const empresasData = useAsyncData(async () => (await empresasApi.list({ limit: 200 })).data);

  // Prepare options for react-select (después de declarar categorias/empresas)
  const categoriaOptions = useMemo(
    () => (categoriasData.data || []).map((c) => ({ value: c.id, label: c.nombre })),
    [categoriasData.data],
  );

  const empresaOptions = useMemo(
    () => (empresasData.data || []).map((e) => ({ value: e.id, label: e.nombre })),
    [empresasData.data],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Custom select styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      minHeight: "40px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fef08a" : state.isFocused ? "#fefce8" : base.backgroundColor,
      color: "#0f172a",
    }),
  };

  const clearFilters = () => {
    setFiltros({
      id_categoria: "",
      id_empresa: "",
      precio_min: "",
      precio_max: "",
      ordenar: "fecha_publicacion",
    });
    setSearch("");
    setSearchParams({});
  };

  const activeFiltersCount = [
    filtros.id_categoria,
    filtros.id_empresa,
    filtros.precio_min,
    filtros.precio_max,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              Inicio
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-sm font-semibold text-slate-700">Marketplace</span>
          </div>

          <form onSubmit={handleSearch} className="mt-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-primary-400"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Categoría</label>
                <Select
                  value={categoriaOptions.find((c) => c.value === filtros.id_categoria) || null}
                  onChange={(selected) =>
                    setFiltros((prev) => ({ ...prev, id_categoria: selected ? selected.value : "" }))
                  }
                  options={categoriaOptions}
                  placeholder="Todas las categorías"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Company Filter */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Empresa</label>
                <Select
                  value={empresaOptions.find((e) => e.value === filtros.id_empresa) || null}
                  onChange={(selected) =>
                    setFiltros((prev) => ({ ...prev, id_empresa: selected ? selected.value : "" }))
                  }
                  options={empresaOptions}
                  placeholder="Todas las empresas"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Precio {filtros.precio_min && `(${formatPrice(parseInput(filtros.precio_min))})`}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ej: 2k, 500, 1.5m"
                    value={filtros.precio_min}
                    onChange={(e) => setFiltros((prev) => ({ ...prev, precio_min: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Ej: 10k, 5000"
                    value={filtros.precio_max}
                    onChange={(e) => setFiltros((prev) => ({ ...prev, precio_max: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-slate-900 transition hover:bg-primary-400"
              >
                Aplicar filtros
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="min-w-0 flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-slate-900">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{formatCompact(productos.data?.length || 0)}</span>{" "}
                  productos encontrados
                </p>
              </div>

              <select
                value={filtros.ordenar}
                onChange={(e) => setFiltros((prev) => ({ ...prev, ordenar: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fecha_publicacion">Más recientes</option>
                <option value="precio">Menor precio</option>
                <option value="precio">Mayor precio</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 lg:hidden">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Filtros</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FontAwesomeIcon icon={faXmark} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Categoría</label>
                    <select
                      value={filtros.id_categoria}
                      onChange={(e) => setFiltros((prev) => ({ ...prev, id_categoria: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Todas</option>
                      {(categoriasData.data || []).map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Precio</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filtros.precio_min}
                        onChange={(e) => setFiltros((prev) => ({ ...prev, precio_min: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filtros.precio_max}
                        onChange={(e) => setFiltros((prev) => ({ ...prev, precio_max: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                    className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-slate-900"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {productos.loading ? (
              <Loading text="Cargando productos..." />
            ) : productos.data?.length === 0 ? (
              <EmptyState
                title="No se encontraron productos"
                description="Intenta con otros filtros o términos de búsqueda"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {(productos.data || []).map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
