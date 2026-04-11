import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceApi, mensajesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/common/Loading";

export function ChatRoomDetailPage() {
  const { marketplaceId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { pushToast } = useToast();
  
  const [marketplace, setMarketplace] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const ws = useRef(null);
  const mensajesEndRef = useRef(null);

  // Load marketplace details
  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const { data } = await marketplaceApi.get(marketplaceId);
        setMarketplace(data);
      } catch (error) {
        pushToast({
          title: "Error",
          message: error?.response?.data?.detail || "No se pudo cargar el producto",
          type: "error",
        });
        navigate("/chat");
      } finally {
        setLoading(false);
      }
    };

    loadMarketplace();
  }, [marketplaceId, navigate, pushToast]);

  // Load messages for this marketplace
  useEffect(() => {
    const loadMensajes = async () => {
      try {
        const { data } = await mensajesApi.list({ id_marketplace: marketplaceId });
        setMensajes(data || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    if (marketplaceId) {
      loadMensajes();
    }
  }, [marketplaceId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!token || !user?.id || !marketplaceId) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/notificaciones/${user.id}?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
    };

    ws.current.onmessage = () => {
      // When we get a notification, reload messages
      mensajesApi.list({ id_marketplace: marketplaceId }).then(({ data: msgs }) => {
        setMensajes(msgs || []);
      }).catch(console.error);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        if (user && token) {
          ws.current = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/notificaciones/${user.id}?token=${token}`);
        }
      }, 3000);
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [token, user?.id, marketplaceId]);

  // Group messages by user (for left sidebar)
  const chatsPorUsuario = useMemo(() => {
    const grouped = {};
    
    mensajes.forEach(mensaje => {
      const userId = mensaje.id_usuario_enviador_mensaje;
      
      if (!grouped[userId]) {
        grouped[userId] = {
          userId,
          mensajes: [],
          ultimoMensaje: null,
        };
      }
      
      grouped[userId].mensajes.push(mensaje);
      grouped[userId].ultimoMensaje = mensaje;
    });

    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.ultimoMensaje.fecha_hora);
      const dateB = new Date(b.ultimoMensaje.fecha_hora);
      return dateB - dateA;
    });
  }, [mensajes]);

  // Get messages with selected user
  const mensajesConUsuario = useMemo(() => {
    if (!selectedUserId) return [];
    
    return mensajes
      .filter(m => m.id_usuario_enviador_mensaje === selectedUserId)
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  }, [mensajes, selectedUserId]);

  // Auto-select first user when messages load
  useEffect(() => {
    if (!selectedUserId && chatsPorUsuario.length > 0) {
      setSelectedUserId(chatsPorUsuario[0].userId);
    }
  }, [chatsPorUsuario, selectedUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesConUsuario]);

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();

    if (!nuevoMensaje.trim() || enviando || !user) return;

    const mensajeTexto = nuevoMensaje.trim();
    const userId = user.id_usuario || user.id;
    
    if (!userId) {
      pushToast({
        title: "Error",
        message: "No se pudo identificar tu usuario.",
        type: "error",
      });
      return;
    }

    const payload = {
      id_marketplace: Number(marketplaceId),
      id_usuario_creador_chat: Number(marketplace.id_empresa || userId),
      id_usuario_enviador_mensaje: Number(userId),
      mensaje: mensajeTexto,
    };

    console.log("Admin - Enviando mensaje con payload:", payload);
    
    setNuevoMensaje("");
    setEnviando(true);

    try {
      await mensajesApi.create(payload);

      pushToast({
        title: "Mensaje enviado",
        message: "Tu mensaje ha sido enviado exitosamente",
        type: "success",
      });

      setEnviando(false);
    } catch (error) {
      console.error("Admin - Error enviando mensaje:", error);
      const errorMsg = error?.response?.data?.detail 
        ? (typeof error.response.data.detail === 'string' 
            ? error.response.data.detail 
            : JSON.stringify(error.response.data.detail))
        : "No se pudo enviar el mensaje";
      
      pushToast({
        title: "Error",
        message: errorMsg,
        type: "error",
      });
      setEnviando(false);
      setNuevoMensaje(mensajeTexto);
    }
  };

  const formatMessageTime = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatPreviewFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return "Ahora";
    if (hours < 24) return `${Math.floor(hours)}h`;
    if (hours < 168) return `${Math.floor(hours / 24)}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return <Loading />;
  }

  if (!marketplace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Producto no encontrado</h2>
          <button
            onClick={() => navigate("/chat")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{marketplace.nombre}</h1>
              <p className="text-sm text-gray-500">
                {marketplace.empresa?.nombre} · ${marketplace.precio?.toLocaleString()}
              </p>
            </div>
          </div>
          {wsConnected && (
            <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En línea
            </span>
          )}
        </div>
      </div>

      {/* WhatsApp-style Layout */}
      <div className="flex h-[calc(100vh-130px)]">
        {/* Left Sidebar - Chat List */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Conversaciones ({chatsPorUsuario.length})
            </h2>
          </div>

          {chatsPorUsuario.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No hay conversaciones aún</p>
            </div>
          ) : (
            chatsPorUsuario.map((chat) => (
              <div
                key={chat.userId}
                onClick={() => setSelectedUserId(chat.userId)}
                className={`flex items-start gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedUserId === chat.userId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {chat.userId}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      Usuario #{chat.userId}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatPreviewFecha(chat.ultimoMensaje?.fecha_hora)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.ultimoMensaje?.mensaje}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUserId}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Usuario #{selectedUserId}</h3>
                    <p className="text-xs text-gray-500">
                      {mensajesConUsuario.length} mensaje(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mensajesConUsuario.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No hay mensajes aún</p>
                  </div>
                ) : (
                  mensajesConUsuario.map((mensaje, index) => {
                    const isCurrentUser = mensaje.id_usuario_enviador_mensaje === user?.id;
                    const showDate = index === 0 || 
                      formatFecha(mensaje.fecha_hora) !== formatFecha(mensajesConUsuario[index - 1]?.fecha_hora);

                    return (
                      <div key={mensaje.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                              {formatFecha(mensaje.fecha_hora)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            <p className="text-sm break-words">{mensaje.mensaje}</p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTime(mensaje.fecha_hora)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={mensajesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleEnviarMensaje} className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={enviando}
                  />
                  <button
                    type="submit"
                    disabled={!nuevoMensaje.trim() || enviando}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-semibold">Selecciona una conversación</p>
                <p className="text-sm mt-2">Elige un usuario de la lista para ver el chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
