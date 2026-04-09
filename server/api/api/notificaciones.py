from datetime import datetime
from typing import Dict, Set

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.db.conexion import get_db
from api.models.models import Notificacion, Usuario
from api.schemas.schemas import NotificacionResponseDetallado, NotificacionCreate
from api.api.auth import get_current_user, require_permission, get_user, SECRET_KEY, ALGORITHM
from seeders.seed_permisos import Permisos

router = APIRouter()

class ConnectionManager:
    """Gestor de conexiones WebSocket para notificaciones en tiempo real"""
    
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        """Registrar una nueva conexión WebSocket"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    def disconnect(self, user_id: int, websocket: WebSocket):
        """Desconectar un cliente"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def broadcast_to_user(self, user_id: int, message: dict):
        """Enviar mensaje a todas las conexiones de un usuario"""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            
            # Limpiar conexiones cerradas
            for connection in disconnected:
                self.active_connections[user_id].discard(connection)


manager = ConnectionManager()


def _extract_ws_token(websocket: WebSocket) -> str | None:
    """Extrae JWT desde query param `token` o header Authorization."""
    token = websocket.query_params.get("token")
    if token:
        return token

    auth_header = websocket.headers.get("authorization")
    if not auth_header:
        return None

    parts = auth_header.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]


async def _authenticate_ws_user(websocket: WebSocket, db: AsyncSession) -> Usuario | None:
    """Valida JWT para conexiones WebSocket y retorna usuario autenticado."""
    token = _extract_ws_token(websocket)
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo = payload.get("sub")
        if not correo:
            return None
    except JWTError:
        return None

    return await get_user(db, correo)


@router.get("/notificaciones/usuario/", response_model=list[NotificacionResponseDetallado])
async def listar_mis_notificaciones(
    skip: int = 0,
    limit: int = 50,
    leidas: bool = Query(None),  # None = todas, True = solo leídas, False = solo no leídas
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtener lista de notificaciones del usuario autenticado
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id_usuario_destinatario == current_user["id"],
            Notificacion.deleted_at.is_(None)
        )
    ).options(
        joinedload(Notificacion.usuario_remitente)
    )
    
    # Filtrar por estado de lectura si se especifica
    if leidas is not None:
        query = query.where(Notificacion.leido == leidas)
    
    # Ordenar por fecha más reciente primero
    query = query.order_by(Notificacion.fecha_creacion.desc())
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.unique().scalars().all()


@router.get("/notificaciones/usuario/contar/")
async def contar_notificaciones(
    sin_leer: bool = Query(False),  # Si True, contar solo las no leídas
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Contar notificaciones del usuario autenticado
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id_usuario_destinatario == current_user["id"],
            Notificacion.deleted_at.is_(None)
        )
    )
    
    if sin_leer:
        query = query.where(Notificacion.leido == False)
    
    result = await db.execute(query)
    notificaciones = result.scalars().all()

    if sin_leer:
        return {"cantidad_sin_leer": len(notificaciones)}

    return {"cantidad_total": len(notificaciones)}


@router.get("/notificaciones/usuario/sin-leer/")
async def contar_sin_leer(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Contar notificaciones sin leer del usuario
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id_usuario_destinatario == current_user["id"],
            Notificacion.leido == False,
            Notificacion.deleted_at.is_(None)
        )
    )
    
    result = await db.execute(query)
    notificaciones = result.scalars().all()
    
    return {"sin_leer": len(notificaciones)}


@router.post("/notificaciones/marcar-como-leida/{id_notificacion}")
async def marcar_como_leida(
    id_notificacion: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marcar una notificación como leída
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id == id_notificacion,
            Notificacion.id_usuario_destinatario == current_user["id"]
        )
    )
    
    result = await db.execute(query)
    notificacion = result.scalars().first()
    
    if not notificacion:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notificacion.leido = True
    await db.commit()
    await db.refresh(notificacion)
    
    return {"message": "Notificación marcada como leída", "id": notificacion.id}


@router.post("/notificaciones/marcar-todas-como-leidas/")
async def marcar_todas_como_leidas(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marcar todas las notificaciones como leídas
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id_usuario_destinatario == current_user["id"],
            Notificacion.leido == False,
            Notificacion.deleted_at.is_(None)
        )
    )
    
    result = await db.execute(query)
    notificaciones = result.scalars().all()
    
    count = 0
    for notificacion in notificaciones:
        notificacion.leido = True
        count += 1
    
    await db.commit()
    
    return {"message": f"{count} notificaciones marcadas como leídas"}


@router.delete("/notificaciones/{id_notificacion}")
async def eliminar_notificacion(
    id_notificacion: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Eliminar (soft delete) una notificación
    """
    query = select(Notificacion).where(
        and_(
            Notificacion.id == id_notificacion,
            Notificacion.id_usuario_destinatario == current_user["id"]
        )
    )
    
    result = await db.execute(query)
    notificacion = result.scalars().first()
    
    if not notificacion:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notificacion.deleted_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Notificación eliminada"}


@router.post("/notificaciones/crear")
async def crear_notificacion(
    notificacion_data: NotificacionCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Crear una nueva notificación (típicamente usado internamente por otros endpoints)
    El id_usuario_remitente puede ser None para notificaciones del sistema
    """
    # Validar que el usuario destinatario existe
    query_usuario = select(Usuario).where(Usuario.id == notificacion_data.id_usuario_destinatario)
    result_usuario = await db.execute(query_usuario)
    usuario_dest = result_usuario.scalars().first()
    
    if not usuario_dest:
        raise HTTPException(status_code=404, detail="Usuario destinatario no encontrado")
    
    # Crear la notificación
    nueva_notificacion = Notificacion(
        id_usuario_remitente=notificacion_data.id_usuario_remitente or current_user["id"],
        id_usuario_destinatario=notificacion_data.id_usuario_destinatario,
        tipo=notificacion_data.tipo,
        contenido=notificacion_data.contenido,
        leido=False
    )
    
    db.add(nueva_notificacion)
    await db.commit()
    await db.refresh(nueva_notificacion)
    
    # Broadcast WebSocket a usuario destinatario
    await manager.broadcast_to_user(
        usuario_dest.id,
        {
            "tipo": "nueva_notificacion",
            "id": nueva_notificacion.id,
            "contenido": nueva_notificacion.contenido,
            "tipo_notificacion": nueva_notificacion.tipo,
            "fecha_creacion": nueva_notificacion.fecha_creacion.isoformat(),
            "remitente_id": nueva_notificacion.id_usuario_remitente
        }
    )
    
    return {"id": nueva_notificacion.id, "message": "Notificación creada correctamente"}


@router.get("/notificaciones/")
async def listar_todas_notificaciones(
    skip: int = 0,
    limit: int = 50,
    _: object = Depends(require_permission(Permisos.VER_NOTIFICACIONES)),
    db: AsyncSession = Depends(get_db),
):
    """
    Listar todas las notificaciones en el sistema (solo para admin)
    """
    query = select(Notificacion).where(
        Notificacion.deleted_at.is_(None)
    ).options(
        joinedload(Notificacion.usuario_remitente),
        joinedload(Notificacion.usuario_destinatario)
    ).order_by(Notificacion.fecha_creacion.desc())
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.unique().scalars().all()


# WebSocket para notificaciones en tiempo real
@router.websocket("/ws/notificaciones/{usuario_id}")
async def websocket_notificaciones(
    websocket: WebSocket,
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket para recibir notificaciones en tiempo real
    Conexión: ws://localhost:8000/api/ws/notificaciones/{usuario_id}
    
    Requiere que el usuario_id coincida con el usuario autenticado
    """
    usuario = await _authenticate_ws_user(websocket, db)
    if usuario is None:
        await websocket.close(code=1008, reason="No autenticado")
        return

    if usuario.id != usuario_id:
        await websocket.close(code=1008, reason="Usuario no autorizado para este canal")
        return

    await manager.connect(usuario_id, websocket)
    
    try:
        while True:
            # Mantener la conexión abierta esperando mensajes
            # Ping/pong para detectar desconexiones
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_json({"tipo": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(usuario_id, websocket)
    except Exception as e:
        manager.disconnect(usuario_id, websocket)
