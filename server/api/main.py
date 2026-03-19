"""Entrada principal de la API con manejo seguro de arranque y registro de errores.

Esta versión carga routers dinámicamente en el evento de `startup` y registra
excepciones para ayudar a identificar fallos silenciosos durante la inicialización.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
import logging
from fastapi.middleware.cors import CORSMiddleware
from importlib import import_module
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager

logger = logging.getLogger("uvicorn.error")


class LogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        logger.info("Request: %s %s", request.method, request.url)
        response = await call_next(request)
        logger.info("Response status: %s", response.status_code)
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crear tablas y seed mínimo
    try:
        from api.db.conexion import get_engine, Base
        from sqlalchemy.orm import sessionmaker

        logger.info("Creando tablas (si no existen) en la base de datos")
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.exception("Error al inicializar la base de datos: %s", e)

    # Seed básico para tests locales: asegurar que existan categorías (1..4)
    try:
        from api.models.models import Categoria, Departamento, Municipio

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        try:
            for cid in range(1, 5):
                exists = db.query(Categoria).filter(Categoria.id_categoria == cid).first()
                if not exists:
                    db.add(Categoria(id_categoria=cid, nombre=f"Categoria {cid}", descripcion="Seed"))

            dep = db.query(Departamento).filter(Departamento.id_departamento == 1).first()
            if not dep:
                dep = Departamento(id_departamento=1, nombre="Departamento Seed")
                db.add(dep)

            mun = db.query(Municipio).filter(Municipio.id_municipio == 1).first()
            if not mun:
                db.add(Municipio(id_municipio=1, nombre="Municipio Seed", id_departamento=1))

            db.commit()
            logger.info("Seed inicial insertado (categorias y municipio)")
        finally:
            db.close()
    except Exception as e:
        logger.exception("Error insertando seed inicial: %s", e)

    yield


app = FastAPI(title="Directorio API", description="API del Sistema de Directorio Empresarial", version="1.0.0", lifespan=lifespan)

origins = ["http://localhost", "http://localhost:4321", "https://paginas-amarillas.vercel.app/"]

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
    ("api.api.paises", "/api", "Paises"),
    ("api.api.productos", "/api", "Productos"),
    ("api.api.auditoria", "/api", "Auditoria"),
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

