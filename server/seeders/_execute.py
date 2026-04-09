import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

USER = os.environ.get("USER")
PASSWORD = os.environ.get("PASSWORD")
HOST = os.environ.get("HOST")
DATABASE = os.environ.get("DATABASE")

if not USER:
    raise ValueError("La variable de entorno 'USER' no está definida.")
if not PASSWORD:
    raise ValueError("La variable de entorno 'PASSWORD' no está definida.")
if not HOST:
    raise ValueError("La variable de entorno 'HOST' no está definida.")
if not DATABASE:
    raise ValueError("La variable de entorno 'DATABASE' no está definida.")

print(USER, PASSWORD, HOST, DATABASE)
# Database connection
engine = create_async_engine(
    f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}/{DATABASE}", echo=True
)

# sesion para interactuar con la DB
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Ejecutar sentencias SQL
async def run_sql_statements(statements):
    async with async_session() as session:
        async with session.begin():
            for statement in statements:
                await session.execute(statement)
        await session.commit()

if __name__ == "__main__":
    import asyncio
    from categorias import seed_categorias
    from departamentos import seed_departamentos
    from estados_marketplace import seed_estados_marketplace
    from seed_admin_user import seed_admin_user
    from seed_roles import seed_roles
    from paises import seed_paises
    from municipios import seed_municipios
    from seed_permisos import seed_permisos
    from tipos_anuncio import seed_tipos_anuncio

    async def main():
        await seed_paises(run_sql_statements)
        await seed_departamentos(run_sql_statements)
        await seed_municipios(run_sql_statements)
        await seed_categorias(run_sql_statements)
        await seed_estados_marketplace(run_sql_statements)
        await seed_tipos_anuncio(run_sql_statements)
        await seed_roles(run_sql_statements)
        await seed_admin_user(run_sql_statements)
        await seed_permisos(run_sql_statements)
        
    asyncio.run(main())