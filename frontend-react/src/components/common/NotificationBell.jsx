import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { notificacionesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useWebSocketBackoff } from "../../hooks/useWebSocketBackoff";
import { buildNotificationsSocketUrl } from "../../lib/ws";

const NOTIFICACION_ICONOS = {
  new_message: "fa-comment",
  message_reply: "fa-reply",
  new_review: "fa-star",
  review_response: "fa-comment-dots",
  new_product: "fa-box",
  price_change: "fa-tag",
  product_sold: "fa-check-circle",
  comprobante_aprobado: "fa-check",
  comprobante_rechazado: "fa-times",
  comprobante_pending: "fa-clock",
  system_notification: "fa-bell",
  welcome: "fa-hand-wave",
};

const NOTIFICACION_COLORES = {
  new_message: "bg-blue-500",
  message_reply: "bg-blue-500",
  new_review: "bg-yellow-500",
  review_response: "bg-yellow-500",
  new_product: "bg-green-500",
  price_change: "bg-orange-500",
  product_sold: "bg-green-500",
  comprobante_aprobado: "bg-green-500",
  comprobante_rechazado: "bg-red-500",
  comprobante_pending: "bg-orange-500",
  system_notification: "bg-gray-500",
  welcome: "bg-purple-500",
};

export function NotificationBell({ navigateTo }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userId = user?.id_usuario || user?.id;
  
  // Determinar ruta por defecto si no se proporciona
  const defaultNavigateTo = user?.rol === "admin" ? "/admin/notificaciones" : "/mis-chats";
  const targetRoute = navigateTo || defaultNavigateTo;

  // Cargar notificaciones iniciales
  const cargarNotificaciones = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [listaRes, sinLeerRes] = await Promise.all([
        notificacionesApi.listarUsuario({ limit: 10 }),
        notificacionesApi.contarSinLeer(),
      ]);
      
      setNotificaciones(listaRes.data || []);
      setSinLeer(sinLeerRes.data?.sin_leer || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  // WebSocket para notificaciones en tiempo real
  const wsUrl = userId ? buildNotificationsSocketUrl(userId) : null;
  
  useWebSocketBackoff({
    url: wsUrl,
    enabled: !!userId,
    onMessage: async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === "nueva_notificacion") {
          // Recargar contadores y lista
          await cargarNotificaciones();
        }
      } catch (error) {
        console.error("Error procesando notificación WebSocket:", error);
      }
    },
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marcarComoLeida = async (id) => {
    try {
      await notificacionesApi.marcarLeida(id);
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasLeidas();
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  const formatearTiempo = (fecha) => {
    if (!fecha) return "";
    
    const date = new Date(fecha);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        className="relative rounded-xl bg-gray-400/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-400/20"
        aria-label="Notificaciones"
      >
        <FontAwesomeIcon icon={faBell} className="text-xl" color="black" />
        
        {/* Badge de notificaciones sin leer */}
        {sinLeer > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {sinLeer > 99 ? "99+" : sinLeer}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Notificaciones {sinLeer > 0 && (
                  <span className="ml-2 text-xs font-medium text-red-600">
                    {sinLeer} nueva{sinLeer > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              {sinLeer > 0 && (
                <button
                  onClick={marcarTodasLeidas}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto max-h-[480px]">
            {notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <i className="fas fa-bell-slash text-4xl mb-3"></i>
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => {
                const icono = NOTIFICACION_ICONOS[notif.tipo] || "fa-bell";
                const color = NOTIFICACION_COLORES[notif.tipo] || "bg-gray-500";
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.leido) {
                        marcarComoLeida(notif.id);
                      }
                      navigate(targetRoute);
                      setMostrarDropdown(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notif.leido ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${color} bg-opacity-10 flex items-center justify-center`}>
                        <i className={`fas ${icono} ${color.replace("bg-", "text-")}`}></i>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.leido ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {notif.contenido}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatearTiempo(notif.fecha_creacion)}
                        </p>
                      </div>
                      
                      {/* Punto de no leído */}
                      {!notif.leido && (
                        <div className="flex-shrink-0 mt-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                navigate(targetRoute);
                setMostrarDropdown(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
