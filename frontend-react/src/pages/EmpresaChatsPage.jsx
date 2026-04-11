import { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faStore,
  faComments,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { marketplaceApi, mensajesApi, empresasApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";

export function EmpresaChatsPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const mensajesEndRef = useRef(null);

  // Load user's company
  const miEmpresa = useAsyncData(async () => {
    try {
      const { data } = await empresasApi.miEmpresa();
      return data;
    } catch {
      return null;
    }
  });

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Polling: Reload conversation list every 10 seconds
  useEffect(() => {
    if (!miEmpresa.data) return;

    const interval = setInterval(async () => {
      try {
        const empresaId = miEmpresa.data?.id;
        if (!empresaId) return;

        const { data: marketplaces } = await marketplaceApi.list({
          id_empresa: empresaId,
          limit: 100,
        });

        if (!marketplaces || marketplaces.length === 0) return;

        const marketplaceIds = new Set(marketplaces.map((mp) => mp.id));
        const marketplaceMap = new Map(marketplaces.map((mp) => [mp.id, mp]));

        const { data: allMensajes } = await mensajesApi.list({ limit: 1000 });

        const convMap = new Map();
        (allMensajes || []).forEach((msg) => {
          if (!marketplaceIds.has(msg.id_marketplace)) return;

          const key = `${msg.id_marketplace}_${msg.id_usuario_creador_chat}`;

          if (!convMap.has(key)) {
            const mp = marketplaceMap.get(msg.id_marketplace);
            convMap.set(key, {
              id: key,
              marketplaceId: msg.id_marketplace,
              clientId: msg.id_usuario_creador_chat,
              marketplace: mp,
              mensajes: [],
              ultimoMensaje: null,
              cantidadMensajes: 0,
            });
          }

          const conv = convMap.get(key);
          conv.mensajes.push(msg);
          conv.ultimoMensaje = msg;
          conv.cantidadMensajes++;
        });

        const convList = Array.from(convMap.values()).sort((a, b) => {
          const dateA = a.ultimoMensaje?.fecha_hora || "";
          const dateB = b.ultimoMensaje?.fecha_hora || "";
          return new Date(dateB) - new Date(dateA);
        });

        setConversaciones(convList);
      } catch {
        // Silently fail on polling
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [miEmpresa.data]);

  // Polling: Reload messages every 5 seconds when a conversation is selected
  useEffect(() => {
    if (!selectedConv) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await mensajesApi.list({
          id_marketplace: selectedConv.marketplaceId,
          limit: 1000,
        });
        const mensajesConv = (data || [])
          .filter((m) => m.id_usuario_creador_chat === selectedConv.clientId)
          .reverse();

        // Only update if message count changed (avoid unnecessary re-renders)
        if (mensajesConv.length !== mensajes.length) {
          setMensajes(mensajesConv);
          setSelectedConv((prev) => ({
            ...prev,
            ultimoMensaje: mensajesConv[0] || prev.ultimoMensaje,
            cantidadMensajes: mensajesConv.length,
          }));
        }
      } catch {
        // Silently fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConv, mensajes.length]);

  // Load conversations grouped by (marketplace + client)
  useEffect(() => {
    const loadConversaciones = async () => {
      try {
        const empresaId = miEmpresa.data?.id;
        if (!empresaId) {
          setConversaciones([]);
          setLoading(false);
          return;
        }

        // Load products from user's company
        const { data: marketplaces } = await marketplaceApi.list({
          id_empresa: empresaId,
          limit: 100,
        });

        if (!marketplaces || marketplaces.length === 0) {
          setConversaciones([]);
          setLoading(false);
          return;
        }

        const marketplaceIds = new Set(marketplaces.map((mp) => mp.id));
        const marketplaceMap = new Map(marketplaces.map((mp) => [mp.id, mp]));

        // Load all messages
        const { data: allMensajes } = await mensajesApi.list({ limit: 1000 });

        // Group messages by (marketplace_id, id_usuario_creador_chat)
        // Each unique combination = a separate conversation thread
        const convMap = new Map();

        (allMensajes || []).forEach((msg) => {
          if (!marketplaceIds.has(msg.id_marketplace)) return;

          const key = `${msg.id_marketplace}_${msg.id_usuario_creador_chat}`;

          if (!convMap.has(key)) {
            const mp = marketplaceMap.get(msg.id_marketplace);
            convMap.set(key, {
              id: key,
              marketplaceId: msg.id_marketplace,
              clientId: msg.id_usuario_creador_chat,
              marketplace: mp,
              mensajes: [],
              ultimoMensaje: null,
              cantidadMensajes: 0,
            });
          }

          const conv = convMap.get(key);
          conv.mensajes.push(msg);
          conv.ultimoMensaje = msg;
          conv.cantidadMensajes++;
        });

        const convList = Array.from(convMap.values()).sort((a, b) => {
          const dateA = a.ultimoMensaje?.fecha_hora || "";
          const dateB = b.ultimoMensaje?.fecha_hora || "";
          return new Date(dateB) - new Date(dateA);
        });

        setConversaciones(convList);
      } catch (error) {
        console.error("Error loading conversations:", error);
        pushToast({
          title: "Error",
          message: "No se pudieron cargar las conversaciones",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (miEmpresa.data) {
      loadConversaciones();
    }
  }, [miEmpresa.data, pushToast]);

  // Load messages for selected conversation
  const cargarMensajes = async (conv) => {
    setSelectedConv(conv);
    try {
      const { data } = await mensajesApi.list({
        id_marketplace: conv.marketplaceId,
        limit: 1000,
      });

      // Filter messages for this specific conversation (same client)
      // Then reverse: newest first
      const mensajesConv = (data || [])
        .filter((m) => m.id_usuario_creador_chat === conv.clientId)
        .reverse();
      setMensajes(mensajesConv);
    } catch (error) {
      console.error("Error loading messages:", error);
      pushToast({
        title: "Error",
        message: "No se pudieron cargar los mensajes",
        type: "error",
      });
    }
  };

  // Send message
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedConv || enviando) return;

    setEnviando(true);
    try {
      await mensajesApi.create({
        id_marketplace: selectedConv.marketplaceId,
        id_usuario_creador_chat: Number(selectedConv.clientId),
        id_usuario_enviador_mensaje: Number(user?.id_usuario),
        mensaje: nuevoMensaje.trim(),
      });

      setNuevoMensaje("");

      // Reload messages for this conversation
      const { data } = await mensajesApi.list({
        id_marketplace: selectedConv.marketplaceId,
        limit: 1000,
      });
      const mensajesConv = (data || [])
        .filter((m) => m.id_usuario_creador_chat === selectedConv.clientId)
        .reverse();
      setMensajes(mensajesConv);

      // Refresh conversation list
      setSelectedConv((prev) => ({
        ...prev,
        ultimoMensaje: mensajesConv[mensajesConv.length - 1] || prev.ultimoMensaje,
        cantidadMensajes: mensajesConv.length,
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo enviar el mensaje",
        type: "error",
      });
    } finally {
      setEnviando(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return "Hace <1h";
    if (hours < 24) return `${Math.floor(hours)}h`;
    if (hours < 168) return `${Math.floor(hours / 24)}d`;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  };

  const formatFechaMensaje = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  // Filter conversations
  const filteredConvs = useMemo(() => {
    if (!searchFilter) return conversaciones;
    const filter = searchFilter.toLowerCase();
    return conversaciones.filter(
      (conv) =>
        conv.marketplace?.nombre?.toLowerCase().includes(filter) ||
        conv.marketplace?.empresa?.nombre?.toLowerCase().includes(filter)
    );
  }, [conversaciones, searchFilter]);

  if (loading || miEmpresa.loading) {
    return <Loading />;
  }

  if (!miEmpresa.data) {
    return (
      <EmptyState
        title="Sin empresa"
        description="No perteneces a ninguna empresa."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Left Sidebar - Conversation List */}
      <div
        className={`${
          selectedConv ? "hidden md:flex" : "flex"
        } w-full flex-col md:w-96 border-r border-slate-200`}
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faComments} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Chats con Clientes</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">{miEmpresa.data.nombre}</p>
          {/* Search */}
          <div className="mt-3 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Buscar conversación..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FontAwesomeIcon icon={faStore} className="mb-3 text-3xl text-slate-300" />
              <p className="text-sm text-slate-500">
                {conversaciones.length === 0 ? "Sin chats activos" : "Sin resultados"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {conversaciones.length === 0
                  ? "Los chats aparecerán cuando los clientes escriban sobre tus productos"
                  : "Intenta con otra búsqueda"}
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => cargarMensajes(conv)}
                className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                  selectedConv?.id === conv.id ? "bg-teal-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                    {conv.marketplace?.nombre?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-semibold text-slate-900">
                        {conv.marketplace?.nombre || "Producto"}
                      </p>
                      {conv.ultimoMensaje?.fecha_hora && (
                        <span className="ml-2 shrink-0 text-xs text-slate-400">
                          {formatFecha(conv.ultimoMensaje.fecha_hora)}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="truncate text-xs text-slate-500">
                        {conv.ultimoMensaje?.mensaje || "Sin mensajes"}
                      </p>
                      {conv.cantidadMensajes > 0 && (
                        <span className="ml-2 shrink-0 rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
                          {conv.cantidadMensajes}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Producto: {conv.marketplace?.nombre}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat View */}
      <div className={`${selectedConv ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden text-slate-600"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                {selectedConv.marketplace?.nombre?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                  {selectedConv.marketplace?.nombre || "Producto"}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedConv.marketplace?.empresa?.nombre || ""}
                  {selectedConv.marketplace?.precio
                    ? ` · $${selectedConv.marketplace.precio.toLocaleString()}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
              {mensajes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-slate-500">
                    No hay mensajes en esta conversación
                  </p>
                </div>
              ) : (() => {
                // Messages from the client (chat creator) go LEFT
                // Messages from me (seller) go RIGHT
                return mensajes.map((msg, idx) => {
                  const nextMsg = idx < mensajes.length - 1 ? mensajes[idx + 1] : null;
                  const showDate =
                    !nextMsg ||
                    new Date(msg.fecha_hora).toDateString() !==
                      new Date(nextMsg.fecha_hora).toDateString();

                  const esDelCliente = String(msg.id_usuario_enviador_mensaje) === String(selectedConv.clientId);

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                            {new Date(msg.fecha_hora).toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                      )}
                      <div
                        className={`mb-1 flex ${
                          esDelCliente ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
                            esDelCliente
                              ? "bg-white text-slate-900 rounded-bl-sm"
                              : "bg-teal-600 text-white rounded-br-sm"
                          }`}
                        >
                          {esDelCliente && (
                            <p className="text-xs font-semibold text-blue-600 mb-0.5">
                              {msg.nombre_enviador || "Cliente"}
                            </p>
                          )}
                          <p className="text-sm">{msg.mensaje}</p>
                          <p
                            className={`mt-0.5 text-right text-[10px] ${
                              esDelCliente ? "text-slate-400" : "text-teal-100"
                            }`}
                          >
                            {formatFechaMensaje(msg.fecha_hora)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <div ref={mensajesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={enviarMensaje}
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
            >
              <input
                className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                disabled={enviando}
              />
              <button
                type="submit"
                disabled={enviando || !nuevoMensaje.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <FontAwesomeIcon icon={faStore} className="mb-4 text-6xl text-slate-200" />
            <h4 className="text-lg font-semibold text-slate-700">
              Selecciona una conversación
            </h4>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Elige un chat de la lista para ver la conversación con el cliente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
