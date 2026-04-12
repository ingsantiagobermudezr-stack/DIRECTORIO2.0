from enum import Enum


class TipoNotificacion(str, Enum):
    """Tipos de notificaciones soportadas por el sistema"""
    
    # Mensajes
    NEW_MESSAGE = "new_message"  # Nuevo mensaje en chat
    MESSAGE_REPLY = "message_reply"  # Respuesta a mensaje
    
    # Reviews
    NEW_REVIEW = "new_review"  # Nueva reseña recibida
    REVIEW_RESPONSE = "review_response"  # Respuesta a reseña
    
    # Marketplace
    NEW_PRODUCT = "new_product"  # Nuevo producto publicado
    PRICE_CHANGE = "price_change"  # Cambio de precio en producto favorito
    PRODUCT_SOLD = "product_sold"  # Producto vendido
    
    # Comprobantes
    COMPROBANTE_APROBADO = "comprobante_aprobado"  # Comprobante aprobado
    COMPROBANTE_RECHAZADO = "comprobante_rechazado"  # Comprobante rechazado
    COMPROBANTE_PENDING = "comprobante_pending"  # Comprobante pendiente de revisión
    
    # Sistema
    SYSTEM_NOTIFICATION = "system_notification"  # Notificación del sistema
    WELCOME = "welcome"  # Bienvenida al usuario


# Mapeo de tipos a iconos (para frontend)
NOTIFICACION_ICONOS = {
    "new_message": "fa-comment",
    "message_reply": "fa-reply",
    "new_review": "fa-star",
    "review_response": "fa-comment-dots",
    "new_product": "fa-box",
    "price_change": "fa-tag",
    "product_sold": "fa-check-circle",
    "comprobante_aprobado": "fa-check",
    "comprobante_rechazado": "fa-times",
    "comprobante_pending": "fa-clock",
    "system_notification": "fa-bell",
    "welcome": "fa-hand-wave",
}


# Mapeo de tipos a colores (para frontend)
NOTIFICACION_COLORES = {
    "new_message": "blue",
    "message_reply": "blue",
    "new_review": "yellow",
    "review_response": "yellow",
    "new_product": "green",
    "price_change": "orange",
    "product_sold": "green",
    "comprobante_aprobado": "green",
    "comprobante_rechazado": "red",
    "comprobante_pending": "orange",
    "system_notification": "gray",
    "welcome": "purple",
}
