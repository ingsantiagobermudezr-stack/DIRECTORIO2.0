from logging.config import fileConfig
import asyncio
import os
import re
import sys

from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from dotenv import load_dotenv

# Añadir el directorio raíz "server" al path de Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Cargar variables de entorno
load_dotenv()

# Config de Alembic
config = context.config

def _expand_env_placeholders(value: str) -> str:
    """Soporta placeholders estilo {VAR} y ${VAR} dentro de la URL."""
    if not value:
        return value

    pattern = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\{([A-Za-z_][A-Za-z0-9_]*)\}")

    def replacer(match: re.Match[str]) -> str:
        var_name = match.group(1) or match.group(2)
        return os.getenv(var_name, match.group(0))

    return pattern.sub(replacer, value)


# Leer la URL desde .env y expandir placeholders de variables
raw_database_url = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./test.db")
SQLALCHEMY_DATABASE_URL = _expand_env_placeholders(raw_database_url)

# Sobrescribir la URL de SQLAlchemy en Alembic
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Importar metadata de los modelos
from api.models.models import Base
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in offline mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode."""
    db_url = config.get_main_option("sqlalchemy.url")

    if "+asyncpg" in db_url:
        asyncio.run(run_async_migrations())
        return

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations usando un motor asíncrono cuando la URL es asyncpg."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()