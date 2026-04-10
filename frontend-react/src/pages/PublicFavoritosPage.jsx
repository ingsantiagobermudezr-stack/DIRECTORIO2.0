import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHeart, faMessage, faStore, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { favoritosApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";

function FavoriteCard({ favorito, onRemove }) {
  const navigate = useNavigate();
  const producto = favorito.marketplace;

  if (!producto) return null;

  const precio = producto.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  const empresaNombre = producto.empresa?.nombre || "Vendedor desconocido";

  return (
    <div className="product-card group rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="relative cursor-pointer overflow-hidden rounded-t-xl bg-slate-100 aspect-square"
        onClick={() => navigate(`/producto/${producto.id}`)}
      >
        {producto.imagenes && producto.imagenes.length > 0 ? (
          <img
            src={`${API_BASE_URL}${producto.imagenes[0]}`}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faStore} size="2x" />
          </div>
        )}

        {producto.stock === 0 && (
          <div className="absolute top-2 left-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            Sin stock
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500">{empresaNombre}</p>
        <h3
          className="mt-1 line-clamp-2 cursor-pointer text-sm font-semibold text-slate-900 hover:text-primary-600"
          onClick={() => navigate(`/producto/${producto.id}`)}
        >
          {producto.nombre}
        </h3>

        <div className="mt-3">
          <span className="text-2xl font-bold text-slate-900">{precioFormateado}</span>
        </div>

        <p className="mt-2 text-xs text-slate-500">{producto.stock ?? 0} disponibles</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/producto/${producto.id}`)}
            className="flex-1 rounded-lg bg-primary-500 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-400"
          >
            <FontAwesomeIcon icon={faMessage} className="mr-2" />
            Contactar
          </button>
          <button
            onClick={() => onRemove(producto.id)}
            className="rounded-lg border-2 border-slate-300 px-3 py-2 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FavoritosPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login?next=/favoritos");
    return null;
  }

  const favoritos = useAsyncData(async () => {
    const { data } = await favoritosApi.misFavoritos({ limit: 100 });
    return data || [];
  });

  const handleRemove = async (idMarketplace) => {
    try {
      await favoritosApi.eliminar(idMarketplace);
      pushToast({
        title: "Eliminado",
        message: "Producto eliminado de favoritos",
        type: "success",
      });
      favoritos.reload();
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo eliminar de favoritos",
        type: "error",
      });
    }
  };

  if (favoritos.loading) {
    return <Loading text="Cargando tus favoritos..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Volver al inicio
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FontAwesomeIcon icon={faHeart} size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mis Favoritos</h1>
              <p className="text-sm text-slate-600">
                {favoritos.data?.length || 0} producto{favoritos.data?.length !== 1 ? "s" : ""} guardado
                {favoritos.data?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {favoritos.data?.length === 0 ? (
          <EmptyState
            title="No tienes favoritos aún"
            description="Explora el marketplace y guarda los productos que te interesen"
            actionLabel="Ver marketplace"
            actionLink="/marketplace"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(favoritos.data || []).map((favorito) => (
              <FavoriteCard
                key={favorito.id}
                favorito={favorito}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
