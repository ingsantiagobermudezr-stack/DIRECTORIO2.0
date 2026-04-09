"""Entrada principal de la API con manejo seguro de arranque y registro de errores.

Esta versión carga routers dinámicamente en el evento de `startup` y registra
excepciones para ayudar a identificar fallos silenciosos durante la inicialización.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.staticfiles import StaticFiles
import logging
import json
from fastapi.middleware.cors import CORSMiddleware
from importlib import import_module
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
from api.utils.logging_setup import configure_daily_logging

configure_daily_logging()

from api.db.conexion import lifespan

logger = logging.getLogger("uvicorn.error")


class LogMiddleware(BaseHTTPMiddleware):
    @staticmethod
    def _serialize_body(body: bytes, content_type: str | None) -> str:
        if not body:
            return "<empty>"

        max_chars = 4000
        content_type = (content_type or "").lower()

        if "application/json" in content_type:
            try:
                payload = json.loads(body.decode("utf-8"))
                if isinstance(payload, dict):
                    for key in ("password", "token", "access_token"):
                        if key in payload:
                            payload[key] = "***"
                serialized = json.dumps(payload, ensure_ascii=False)
            except Exception:
                serialized = body.decode("utf-8", errors="replace")
        elif content_type.startswith("multipart/form-data"):
            serialized = f"<multipart/form-data {len(body)} bytes>"
        else:
            serialized = body.decode("utf-8", errors="replace")

        if len(serialized) > max_chars:
            return f"{serialized[:max_chars]}... <truncated>"
        return serialized

    async def dispatch(self, request, call_next):
        body = await request.body()
        body_preview = self._serialize_body(body, request.headers.get("content-type"))

        async def receive():
            return {"type": "http.request", "body": body, "more_body": False}

        request = Request(request.scope, receive)

        logger.info("Request: %s %s | body=%s", request.method, request.url, body_preview)
        response = await call_next(request)
        logger.info("Response status: %s", response.status_code)
        return response

app = FastAPI(title="Directorio API", description="API del Sistema de Directorio Empresarial", version="1.0.0", lifespan=lifespan)

uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

origins = ["*"]  # Permitir todas las fuentes; ajustar en producción para mayor seguridad

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LogMiddleware)
# Lista de routers que la aplicación expone en tiempo de importación.
# Incluir routers al importar el módulo permite que los endpoints estén
# disponibles incluso si la fase `startup` tiene problemas con la base de datos
# (útil para tests). El `startup_event` seguirá creando tablas y seed.
routers = [
    ("api.api.auth", "/api", "Autenticación"),
    ("api.api.categorias", "/api", "Categorías"),
    ("api.api.departamentos", "/api", "Departamentos"),
    ("api.api.empresas", "/api", "Empresas"),
    ("api.api.municipios", "/api", "Municipios"),
    ("api.api.publicidad", "/api", "Publicidad"),
    ("api.api.resultados", "/api", "Resultados"),
    ("api.api.review", "/api", "Reviews"),
    ("api.api.usuarios", "/api", "Usuarios"),
    ("api.api.marketplace", "/api", "Marketplace"),
    ("api.api.roles", "/api", "Roles"),
    ("api.api.permisos", "/api", "Permisos"),
    ("api.api.mensajes", "/api", "Mensajes"),
    ("api.api.archivos_mensajes", "/api", "ArchivosMensajes"),
    ("api.api.comprobantes", "/api", "Comprobantes"),
    ("api.api.paises", "/api", "Paises"),
    ("api.api.favoritos", "/api", "Favoritos"),
    ("api.api.busqueda", "/api", "Búsqueda"),
    ("api.api.notificaciones", "/api", "Notificaciones"),
    ("api.api.reportes", "/api", "Reportes"),
    ("api.api.admin", "/api", "Admin"),
]

for module_path, prefix, tag in routers:
    try:
        logger.info("Importando router %s", module_path)
        module = import_module(module_path)
        router = getattr(module, "router", None)
        if router is None:
            logger.warning("Módulo %s no expone `router`", module_path)
            continue
        app.include_router(router, prefix=prefix, tags=[tag])
        logger.info("Router %s incluido", module_path)
    except Exception as e:
        logger.exception("Error importando/incluyendo %s: %s", module_path, e)
        # No elevar aquí para permitir arrancar la app en entornos sin todas las
        # dependencias; reportamos la excepción y seguimos.


# NOTE: startup/shutdown handled by `lifespan` above (recommended over on_event)


@app.get("/", tags=["root"])
def read_root():
    return {"message": "¡API FastAPI funcionando correctamente!"}


# Manejador de HTTPException para devolver JSON consistente
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Manejador générico para capturar excepciones no controladas
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


