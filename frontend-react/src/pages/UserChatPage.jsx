import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceApi, mensajesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/common/Loading";
import { API_BASE_URL } from "../config/env";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";
import { buildNotificationsSocketUrl } from "../lib/ws";

export function UserChatPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { pushToast } = useToast();
  
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState(null);
  const [marketplaces, setMarketplaces] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("todos"); // todos | pendientes | enviados

  const mensajesEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const prevCountRef = useRef(0);

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Two short beeps (like WhatsApp)
      [0, 0.15].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      });
    } catch {
      // Audio not available
    }
  };

  // Reload messages function
  const reloadMensajes = async () => {
    try {
      const currentUserId = user?.id_usuario || user?.id;
      if (!currentUserId) return;
      
      const { data } = await mensajesApi.list({ limit: 500 });
      const userMessages = data?.filter(
        (m) =>
          m.id_usuario_enviador_mensaje === currentUserId ||
          m.id_usuario_creador_chat === currentUserId
      ) || [];
      setMensajes(userMessages);
    } catch (error) {
      console.error("Error reloading messages:", error);
    }
  };

  // WebSocket para notificaciones en tiempo real
  const userId = user?.id_usuario || user?.id;
  const wsUrl = token && userId ? buildNotificationsSocketUrl(userId) : null;
  
  const { isConnected: wsConnected } = useWebSocketBackoff({
    url: wsUrl,
    enabled: !!token && !!userId,
    onMessage: async (event) => {
      try {
        const data = JSON.parse(event.data);
        // Cuando llega una notificación, recargar mensajes
        if (data.tipo === "nueva_notificacion") {
          await reloadMensajes();
          
          // Si es un mensaje nuevo, reproducir sonido
          if (data.tipo_notificacion === "new_message" || data.tipo_notificacion === "message_reply") {
            playNotificationSound();
            
            // Mostrar toast
            pushToast({
              title: "Nuevo mensaje",
              message: data.contenido,
              type: "info",
            });
          }
        }
      } catch (error) {
        console.error("Error procesando notificación WebSocket:", error);
      }
    },
  });

  // Load user's messages (both sent AND received)
  useEffect(() => {
    const loadMensajes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user.id_usuario || user.id;
        const { data } = await mensajesApi.list({ limit: 500 });
        // Filter messages where user is sender OR receiver (chat creator)
        const userMessages = data?.filter(
          (m) =>
            m.id_usuario_enviador_mensaje === userId ||
            m.id_usuario_creador_chat === userId
        ) || [];
        setMensajes(userMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMensajes();
  }, [user]);

  // Polling: Reload messages every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const userId = user.id_usuario || user.id;
        const { data } = await mensajesApi.list({ limit: 500 });
        const userMessages = data?.filter(
          (m) =>
            m.id_usuario_enviador_mensaje === userId ||
            m.id_usuario_creador_chat === userId
        ) || [];

        // Only update if message count changed AND new messages are received ones
        if (userMessages.length !== mensajes.length) {
          const lastMsg = userMessages[userMessages.length - 1];
          const isReceived = lastMsg?.id_usuario_enviador_mensaje !== userId;

          setMensajes(userMessages);
          if (isReceived && prevCountRef.current > 0) {
            playNotificationSound();
          }
          prevCountRef.current = userMessages.length;
        }
      } catch {
        // Silently fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, mensajes.length]);

  // Load marketplace details for messages
  useEffect(() => {
    const loadMarketplaces = async () => {
      if (mensajes.length === 0) return;

      try {
        const uniqueMarketplaceIds = [...new Set(mensajes.map(m => m.id_marketplace))];
        const marketplacePromises = uniqueMarketplaceIds.map(id =>
          marketplaceApi.get(id).catch(() => null)
        );
        const results = await Promise.all(marketplacePromises);
        const validMarketplaces = results
          .filter(r => r?.data)
          .map(r => r.data);
        setMarketplaces(validMarketplaces);
      } catch (error) {
        console.error("Error loading marketplaces:", error);
      }
    };

    if (mensajes.length > 0) {
      loadMarketplaces();
    }
  }, [mensajes]);

  // Group messages by marketplace (for left sidebar)
  const chatsPorProducto = useMemo(() => {
    const grouped = {};

    mensajes.forEach(mensaje => {
      const mpId = mensaje.id_marketplace;

      if (!grouped[mpId]) {
        grouped[mpId] = {
          marketplaceId: mpId,
          mensajes: [],
          ultimoMensaje: null,
        };
      }

      grouped[mpId].mensajes.push(mensaje);
    });

    // Sort messages within each chat by fecha_hora and set ultimoMensaje
    Object.values(grouped).forEach((chat) => {
      chat.mensajes.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
      chat.ultimoMensaje = chat.mensajes[chat.mensajes.length - 1];
    });

    // Enrich with marketplace data
    return Object.values(grouped)
      .map(chat => {
        const marketplace = marketplaces.find(mp => mp.id === chat.marketplaceId);
        return {
          ...chat,
          marketplace: marketplace || { id: chat.marketplaceId, nombre: "Producto", empresa: {}, imagenes: [] },
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.ultimoMensaje.fecha_hora);
        const dateB = new Date(b.ultimoMensaje.fecha_hora);
        return dateB - dateA;
      });
  }, [mensajes, marketplaces]);

  // Get messages with selected marketplace (sorted oldest first for display)
  const mensajesConProducto = useMemo(() => {
    if (!selectedMarketplaceId) return [];

    return mensajes
      .filter(m => m.id_marketplace === selectedMarketplaceId)
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  }, [mensajes, selectedMarketplaceId]);

  // Auto-select first marketplace when messages load
  useEffect(() => {
    if (!selectedMarketplaceId && chatsPorProducto.length > 0) {
      setSelectedMarketplaceId(chatsPorProducto[0].marketplaceId);
    }
  }, [chatsPorProducto, selectedMarketplaceId]);

  // Auto-scroll to bottom
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesConProducto]);

  // Reset image index when selecting a different product
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedMarketplaceId]);

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || enviando || !user || !selectedMarketplaceId) return;

    const mensajeTexto = nuevoMensaje.trim();
    const userId = user.id_usuario || user.id;
    
    if (!userId) {
      pushToast({
        title: "Error",
        message: "No se pudo identificar tu usuario. Intenta iniciar sesión nuevamente.",
        type: "error",
      });
      return;
    }

    const payload = {
      id_marketplace: Number(selectedMarketplaceId),
      id_usuario_creador_chat: Number(userId),
      id_usuario_enviador_mensaje: Number(userId),
      mensaje: mensajeTexto,
    };

    console.log("Enviando mensaje con payload:", payload);
    
    setNuevoMensaje("");
    setEnviando(true);

    try {
      await mensajesApi.create(payload);

      pushToast({
        title: "Mensaje enviado",
        message: "Tu mensaje ha sido enviado exitosamente",
        type: "success",
      });

      // Reload messages immediately
      await reloadMensajes();
      setEnviando(false);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
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

  const getImageUrl = (imagenes, index = 0) => {
    if (!imagenes || imagenes.length === 0) return null;
    const img = typeof imagenes[index] === "string" ? imagenes[index] : imagenes[index].imagen_url || imagenes[index].url;
    if (!img) return null;
    return img.startsWith("/") ? `${API_BASE_URL}${img}` : `${API_BASE_URL}/${img}`;
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

  const selectedProduct = chatsPorProducto.find(c => c.marketplaceId === selectedMarketplaceId)?.marketplace;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Chats</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Conversaciones con vendedores sobre productos
                </p>
              </div>
            </div>
            {wsConnected && (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                En línea
              </span>
            )}
          </div>
        </div>

        {/* WhatsApp-style Layout */}
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] mt-4 mb-8 mx-4">
          <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Left Sidebar - Product List */}
            <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Productos ({chatsPorProducto.length})
                </h2>
                {/* Filter Tabs */}
                <div className="mt-2 flex gap-1">
                  {[
                    { key: "todos", label: "Todos" },
                    { key: "pendientes", label: "Respuestas" },
                    { key: "enviados", label: "Enviados" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition ${
                        statusFilter === tab.key
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const userId = user.id_usuario || user.id;
                let filteredChats = chatsPorProducto;
                if (statusFilter === "pendientes") {
                  filteredChats = chatsPorProducto.filter(
                    (chat) => chat.ultimoMensaje?.id_usuario_enviador_mensaje !== userId
                  );
                } else if (statusFilter === "enviados") {
                  filteredChats = chatsPorProducto.filter(
                    (chat) => chat.ultimoMensaje?.id_usuario_enviador_mensaje === userId
                  );
                }

                return filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-6 text-center">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="font-medium">No tienes conversaciones</p>
                  <p className="text-sm mt-2">Envía un mensaje a un producto para empezar</p>
                  <button
                    onClick={() => navigate("/marketplace")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const imageUrl = getImageUrl(chat.marketplace.imagenes);
                  const userId = user.id_usuario || user.id;
                  const lastMsgFromSeller = chat.ultimoMensaje?.id_usuario_enviador_mensaje !== userId;
                  const hasNewReply = lastMsgFromSeller && selectedMarketplaceId !== chat.marketplaceId;

                  return (
                    <div
                      key={chat.marketplaceId}
                      onClick={() => setSelectedMarketplaceId(chat.marketplaceId)}
                      className={`flex flex-col gap-2 p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedMarketplaceId === chat.marketplaceId
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : hasNewReply
                          ? 'bg-amber-50 border-l-4 border-l-amber-400'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          {imageUrl ? (
                            <img src={imageUrl} alt={chat.marketplace.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`truncate text-sm ${hasNewReply ? "font-bold text-amber-900" : "font-semibold text-gray-900"}`}>
                              {chat.marketplace.nombre}
                            </h3>
                            <span className={`text-xs flex-shrink-0 ml-2 ${hasNewReply ? "text-amber-600 font-medium" : "text-gray-500"}`}>
                              {formatPreviewFecha(chat.ultimoMensaje?.fecha_hora)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {chat.marketplace.empresa?.nombre}
                          </p>
                          <p className={`truncate mt-1 text-sm ${hasNewReply ? "text-amber-700 font-medium" : "text-gray-700 font-medium"}`}>
                            {chat.ultimoMensaje?.mensaje}
                          </p>
                        </div>
                      </div>

                      {/* Status badges - below message */}
                      {hasNewReply && (
                        <div className="flex items-center gap-1 self-start rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Nueva respuesta
                        </div>
                      )}
                      {!hasNewReply && chat.ultimoMensaje && selectedMarketplaceId !== chat.marketplaceId && (
                        <div className="flex items-center gap-1 self-start rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Esperando respuesta
                        </div>
                      )}
                    </div>
                  );
                })
              );
              })()}
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedMarketplaceId ? (
                <>
                  {/* Chat Header */}
                  {(() => {
                    const currentChat = chatsPorProducto.find(c => c.marketplaceId === selectedMarketplaceId);
                    const imageUrl = currentChat ? getImageUrl(currentChat.marketplace.imagenes) : null;
                    
                    return currentChat ? (
                      <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {imageUrl ? (
                                <img src={imageUrl} alt={currentChat.marketplace.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{currentChat.marketplace.nombre}</h3>
                              <p className="text-xs text-gray-500">
                                {currentChat.marketplace.empresa?.nombre} · ${currentChat.marketplace.precio?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowProductModal(true);
                              setSelectedImageIndex(0);
                            }}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Info
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {mensajesConProducto.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No hay mensajes aún</p>
                      </div>
                    ) : (
                      mensajesConProducto.map((mensaje, index) => {
                        const userId = user.id_usuario || user.id;
                        const esMio = mensaje.id_usuario_enviador_mensaje === userId;
                        const showDate = index === 0 ||
                          formatFecha(mensaje.fecha_hora) !== formatFecha(mensajesConProducto[index - 1]?.fecha_hora);

                        return (
                          <div key={mensaje.id}>
                            {showDate && (
                              <div className="flex items-center justify-center my-4">
                                <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                                  {formatFecha(mensaje.fecha_hora)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-md px-4 py-2 rounded-lg shadow-sm rounded-br-none ${
                                  esMio
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-white text-gray-900 rounded-bl-none"
                                }`}
                              >
                                {!esMio && (
                                  <p className="text-xs font-semibold text-blue-600 mb-0.5">
                                    {mensaje.nombre_enviador || "Vendedor"}
                                  </p>
                                )}
                                <p className="text-sm break-words">{mensaje.mensaje}</p>
                                <p className={`text-xs mt-1 text-right ${
                                  esMio ? "text-blue-100" : "text-gray-400"
                                }`}>
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
                    <p className="text-lg font-semibold">Selecciona un producto</p>
                    <p className="text-sm mt-2">Elige un producto de la lista para ver la conversación</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Info Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Información del Producto</h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedImageIndex(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Images Gallery */}
              {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 && (
                <div className="mb-6">
                  {/* Main Image */}
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(selectedProduct.imagenes, selectedImageIndex)} 
                      alt={selectedProduct.nombre}
                      className="w-full h-auto max-h-[500px] object-contain"
                    />
                  </div>

                  {/* Thumbnails */}
                  {selectedProduct.imagenes.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {selectedProduct.imagenes.map((img, index) => {
                        const imgUrl = typeof img === "string" ? img : img.imagen_url || img.url;
                        const fullUrl = imgUrl ? (imgUrl.startsWith("/") ? `${API_BASE_URL}${imgUrl}` : `${API_BASE_URL}/${imgUrl}`) : null;
                        const isSelected = selectedImageIndex === index;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`rounded-lg overflow-hidden border-2 transition-all aspect-square bg-gray-100 ${
                              isSelected 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-transparent hover:border-blue-300'
                            }`}
                          >
                            {fullUrl ? (
                              <img 
                                src={fullUrl} 
                                alt={`${selectedProduct.nombre} - Imagen ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.nombre}</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">${selectedProduct.precio?.toLocaleString()}</p>
                </div>

                {selectedProduct.descripcion && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Descripción</h4>
                    <p className="text-gray-600">{selectedProduct.descripcion}</p>
                  </div>
                )}

                {selectedProduct.stock !== undefined && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Stock disponible</h4>
                    <p className="text-gray-600">{selectedProduct.stock} unidades</p>
                  </div>
                )}

                {selectedProduct.empresa && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Vendido por</h4>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">{selectedProduct.empresa.nombre}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      navigate(`/producto/${selectedProduct.id}`);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Ver Producto Completo
                  </button>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
