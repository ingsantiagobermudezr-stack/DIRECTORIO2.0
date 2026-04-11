import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuilding,
  faCartShopping,
  faCheck,
  faComment,
  faHeart,
  faImage,
  faLocationDot,
  faMessage,
  faPhone,
  faShare,
  faStar,
  faStore,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { favoritosApi, marketplaceApi, mensajesApi, reviewsApi } from "../services/api";
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

function ImageGallery({ imagenes, productId, nombre }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Get image URL - handle both array of strings and array of objects
  const getImageUrl = (img) => {
    if (!img) return "";
    const url = typeof img === "string" ? img : img.imagen_url || img.url || "";
    // Remove leading slash if present to avoid double slashes
    return url.startsWith("/") ? url.slice(1) : url;
  };

  const totalImages = imagenes?.length || 0;
  const hasImages = totalImages > 0;

  if (!hasImages) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50">
        <FontAwesomeIcon icon={faImage} size="4x" className="text-slate-400" />
      </div>
    );
  }

  const currentImageUrl = getImageUrl(imagenes[currentIndex]);

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 aspect-square cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={`${API_BASE_URL}/${currentImageUrl}`}
          alt={`${nombre} - Imagen ${currentIndex + 1}`}
          className={`h-full w-full object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
        />
        
        {/* Image Counter Badge */}
        {totalImages > 1 && (
          <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {currentIndex + 1} / {totalImages}
          </div>
        )}

        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition hover:bg-white hover:scale-110"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-slate-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition hover:bg-white hover:scale-110"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-slate-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {totalImages > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {imagenes.map((imagen, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                index === currentIndex
                  ? "border-primary-500 ring-2 ring-primary-500/30"
                  : "border-transparent hover:border-slate-300 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={`${API_BASE_URL}/${getImageUrl(imagen)}`}
                alt={`${nombre} - Thumbnail ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ idEmpresa }) {
  const [showForm, setShowForm] = useState(false);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const { isAuthenticated } = useAuth();
  const { pushToast } = useToast();

  const reviews = useAsyncData(async () => {
    return (await reviewsApi.listEmpresa(idEmpresa)).data || [];
  }, idEmpresa);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      pushToast({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para dejar una reseña",
        type: "info",
      });
      return;
    }

    if (!comentario.trim()) {
      pushToast({
        title: "Error",
        message: "El comentario no puede estar vacío",
        type: "error",
      });
      return;
    }

    try {
      await reviewsApi.create({
        id_empresa: idEmpresa,
        comentario,
        calificacion: Number(calificacion),
      });

      pushToast({
        title: "Reseña creada",
        message: "Tu reseña ha sido publicada exitosamente",
        type: "success",
      });

      setComentario("");
      setCalificacion(5);
      setShowForm(false);
      reviews.reload();
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo crear la reseña",
        type: "error",
      });
    }
  };

  const promedioRating =
    reviews.data?.length > 0
      ? reviews.data.reduce((acc, item) => acc + pickNumber(item.calificacion), 0) / reviews.data.length
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Reseñas y Calificaciones</h3>
          {promedioRating > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={
                      star <= Math.round(promedioRating)
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {promedioRating.toFixed(1)} ({reviews.data?.length || 0} reseñas)
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-primary-400"
          >
            {showForm ? "Cancelar" : "Escribir reseña"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Calificación
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCalificacion(star)}
                >
                  <FontAwesomeIcon
                    icon={faStar}
                    className={
                      star <= calificacion
                        ? "text-yellow-400 text-2xl"
                        : "text-slate-300 text-2xl"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Comentario
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos tu experiencia con esta empresa..."
              rows="4"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-slate-900 hover:bg-primary-400"
          >
            Publicar reseña
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.loading ? (
        <Loading text="Cargando reseñas..." />
      ) : reviews.data?.length === 0 ? (
        <p className="text-center text-sm text-slate-500">
          Aún no hay reseñas para esta empresa
        </p>
      ) : (
        <div className="space-y-4">
          {(reviews.data || [])
            .slice(0, 10)
            .map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
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
            ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { pushToast } = useToast();
  const [mensaje, setMensaje] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const producto = useAsyncData(async () => {
    if (!productId) return null;
    try {
      return (await marketplaceApi.get(productId)).data;
    } catch (error) {
      pushToast({
        title: "Error",
        message: "No se pudo cargar el producto",
        type: "error",
      });
      return null;
    }
  }, productId);

  // Check if product is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !productId) return;
      try {
        const { data } = await favoritosApi.verificar(productId);
        setIsFavorite(data.en_favoritos);
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };
    checkFavorite();
  }, [isAuthenticated, productId]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      pushToast({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para agregar favoritos",
        type: "info",
      });
      navigate(`/login?next=/producto/${productId}`);
      return;
    }

    try {
      if (isFavorite) {
        await favoritosApi.eliminar(productId);
        setIsFavorite(false);
        pushToast({ title: "Eliminado", message: "Producto eliminado de favoritos", type: "success" });
      } else {
        await favoritosApi.agregar(productId);
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

  const handleChat = async () => {
    if (!isAuthenticated) {
      pushToast({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para chatear con el vendedor",
        type: "info",
      });
      navigate(`/login?next=/producto/${productId}`);
      return;
    }

    if (!mensaje.trim()) {
      pushToast({
        title: "Error",
        message: "Escribe un mensaje para iniciar el chat",
        type: "error",
      });
      return;
    }

    const userId = user.id_usuario || user.id;
    
    if (!userId) {
      pushToast({
        title: "Error",
        message: "No se pudo identificar tu usuario.",
        type: "error",
      });
      return;
    }

    try {
      await mensajesApi.create({
        id_marketplace: Number(productId),
        id_usuario_creador_chat: Number(userId),
        id_usuario_enviador_mensaje: Number(userId),
        mensaje,
      });

      pushToast({
        title: "Mensaje enviado",
        message: "Tu mensaje ha sido enviado al vendedor",
        type: "success",
      });

      setMensaje("");
      navigate(`/mis-chats`);
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo enviar el mensaje",
        type: "error",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: producto.data?.nombre,
        text: producto.data?.descripcion,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      pushToast({
        title: "Enlace copiado",
        message: "El enlace ha sido copiado al portapapeles",
        type: "success",
      });
    }
  };

  if (producto.loading) {
    return <Loading text="Cargando producto..." />;
  }

  if (!producto.data) {
    return <EmptyState title="Producto no encontrado" description="Verifica el enlace o busca otro producto" />;
  }

  const data = producto.data;
  const precio = data.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  const imagenes = data.imagenes || [];
  const empresaNombre = data.empresa?.nombre || null;
  const empresaId = data.id_empresa || data.empresa?.id;

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
            <Link to="/marketplace" className="hover:text-primary-600">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-slate-900">{data.nombre}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Images */}
          <div>
            <ImageGallery imagenes={imagenes} nombre={data.nombre} />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Category Badge */}
            {data.categoria && (
              <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                {data.categoria.nombre}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900">{data.nombre}</h1>

            {/* Price */}
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Precio</p>
              <p className="text-4xl font-bold text-slate-900">{precioFormateado}</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={data.stock > 0 ? faCheck : faXmark}
                className={data.stock > 0 ? "text-green-500" : "text-red-500"}
              />
              <span className="text-sm font-semibold text-slate-700">
                {data.stock > 0 ? `${data.stock} disponibles` : "Sin stock"}
              </span>
            </div>

            {/* Description */}
            {data.descripcion && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Descripción</h3>
                <p className="text-slate-700">{data.descripcion}</p>
              </div>
            )}

            {/* Seller Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Vendido por</h3>
              <div className="flex items-start gap-3">
                {empresaNombre ? (
                  <>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 text-xl font-bold text-slate-900 shadow-md">
                      {empresaNombre[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/empresa/${empresaId}`}
                        className="text-lg font-bold text-slate-900 transition hover:text-primary-600"
                      >
                        {empresaNombre}
                      </Link>
                      {data.empresa?.municipio && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                          <FontAwesomeIcon icon={faLocationDot} className="text-primary-500" />
                          <span>{data.empresa.municipio.nombre}</span>
                        </div>
                      )}
                      <Link
                        to={`/empresa/${empresaId}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        <FontAwesomeIcon icon={faStore} />
                        Ver empresa
                        <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-xs" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Vendedor independiente</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Información de empresa no disponible
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Chat Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FontAwesomeIcon icon={faMessage} className="text-primary-500" />
                  Contactar al vendedor
                </h3>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Hola, me interesa este producto. ¿Podrías darme más información?"
                  rows="3"
                  className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleChat}
                  className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-slate-900 transition hover:bg-primary-400"
                >
                  <FontAwesomeIcon icon={faComment} className="mr-2" />
                  Enviar mensaje
                </button>
                {!isAuthenticated && (
                  <p className="mt-2 text-xs text-slate-500">
                    ¿No tienes cuenta?{" "}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                      Inicia sesión
                    </Link>
                  </p>
                )}
              </div>

              {/* Favorite & Share Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 rounded-lg border-2 py-3 font-semibold transition ${
                    isFavorite
                      ? "border-red-500 bg-red-50 text-red-500"
                      : "border-slate-300 text-slate-700 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className="mr-2" />
                  {isFavorite ? "En favoritos" : "Agregar a favoritos"}
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-lg border-2 border-slate-300 px-4 py-3 text-slate-700 transition hover:border-primary-300 hover:bg-primary-50"
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {empresaId && (
          <div className="mt-8">
            <ReviewsSection idEmpresa={empresaId} />
          </div>
        )}
      </div>
    </div>
  );
}
