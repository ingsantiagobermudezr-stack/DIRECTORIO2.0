import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceApi, mensajesApi, empresasApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/common/Loading";
import { useAsyncData } from "../hooks/useAsyncData";

export function ChatRoomsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        // Load all marketplaces
        const { data: marketplaces } = await marketplaceApi.list({ limit: 100 });
        
        // Load all messages
        const { data: mensajes } = await mensajesApi.list({ limit: 500 });
        
        // Group messages by marketplace
        const mensajesPorMarketplace = mensajes?.reduce((acc, mensaje) => {
          if (!acc[mensaje.id_marketplace]) {
            acc[mensaje.id_marketplace] = [];
          }
          acc[mensaje.id_marketplace].push(mensaje);
          return acc;
        }, {}) || {};

        // Only show marketplaces that have messages
        const chatsActivos = marketplaces
          ?.filter(mp => mensajesPorMarketplace[mp.id])
          .map(mp => ({
            ...mp,
            mensajes: mensajesPorMarketplace[mp.id] || [],
            ultimoMensaje: mensajesPorMarketplace[mp.id]?.[mensajesPorMarketplace[mp.id].length - 1],
            cantidadMensajes: mensajesPorMarketplace[mp.id]?.length || 0,
          })) || [];

        setActiveChats(chatsActivos);
      } catch (error) {
        console.error("Error loading chats:", error);
        pushToast({
          title: "Error",
          message: "No se pudieron cargar los chats",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [pushToast]);

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin mensajes";
    const date = new Date(fecha);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return "Hace menos de 1 hora";
    if (hours < 24) return `Hace ${Math.floor(hours)} hora(s)`;
    if (hours < 168) return `Hace ${Math.floor(hours / 24)} día(s)`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chats Activos del Marketplace</h1>
          <p className="text-gray-600 mt-1">Conversa con los miembros de tu empresa sobre los productos</p>
        </div>

        {/* Chat Rooms Grid */}
        {activeChats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/admin/chat/${chat.id}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 truncate">
                      {chat.nombre}
                    </h3>
                    {chat.precio && (
                      <span className="ml-2 px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full font-semibold">
                        ${chat.precio.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {chat.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {chat.descripcion}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {chat.cantidadMensajes} mensaje(s)
                      </span>
                      <span className="text-xs text-gray-400">
                        {chat.empresa?.nombre || "Sin empresa"}
                      </span>
                    </div>

                    {chat.ultimoMensaje && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-gray-700 text-xs truncate">
                          <strong>Último:</strong> {chat.ultimoMensaje.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatFecha(chat.ultimoMensaje.fecha_hora)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay chats activos</h3>
            <p className="text-gray-600 mb-6">
              Los chats aparecerán aquí cuando envíes mensajes sobre productos del marketplace
            </p>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
