from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.db.conexion import Base, engine
from api.api import auth, categorias, departamentos, empresas, municipios, publicidad, resultados, review, usuarios, marketplace

from starlette.middleware.base import BaseHTTPMiddleware

class LogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print(f"Request: {request.method} {request.url}")
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response


# Crear instancia de FastAPI con metadata para Swagger UI
app = FastAPI(
    title="Directorio API",
    description="API del Sistema de Directorio Empresarial",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "auth",
            "description": "Autenticación"
        },
        {
            "name": "categorias",
            "description": "Categorías"
        },
        {
            "name": "departamentos",
            "description": "Departamentos"
        },
        {
            "name": "empresas",
            "description": "Empresas"
        },
        {
            "name": "municipios",
            "description": "Municipios"
        },
        {
            "name": "publicidad",
            "description": "Publicidad"
        },
        {
            "name": "resultados",
            "description": "Resultados"
        },
        {
            "name": "review",
            "description": "Reseñas"
        },
        {
            "name": "usuarios",
            "description": "Usuarios"
        },
        {
            "name": "marketplace",
            "description": "Marketplace"
        }
    ]
)

origins = [
    "http://localhost",
    "http://localhost:4321",
    "https://paginas-amarillas.vercel.app/",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LogMiddleware)
# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Incluir el enrutador en la aplicación principal de FastAPI
app.include_router(auth.router, prefix="/api", tags=["Autenticación"])
app.include_router(categorias.router, prefix="/api", tags=["Categorías"])
app.include_router(departamentos.router, prefix="/api", tags=["Departamentos"])
app.include_router(empresas.router, prefix="/api", tags=["Empresas"])
app.include_router(municipios.router, prefix="/api", tags=["Municipios"])
app.include_router(publicidad.router, prefix="/api", tags=["Publicidad"])
app.include_router(resultados.router, prefix="/api", tags=["Resultados"])
app.include_router(review.router, prefix="/api", tags=["Reviews"])
app.include_router(usuarios.router, prefix="/api", tags=["Usuarios"])
app.include_router(marketplace.router, prefix="/api", tags=["Marketplace"])

@app.get("/", tags=["root"])
def read_root():
    return {"message": "¡API FastAPI funcionando correctamente!"}
