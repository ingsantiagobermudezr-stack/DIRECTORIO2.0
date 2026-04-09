from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

from fastapi import FastAPI
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

USER = os.environ.get("USER")
PASSWORD = os.environ.get("PASSWORD")
HOST = os.environ.get("HOST")
DATABASE = os.environ.get("DATABASE")
PORT = os.environ.get("PORT", "5432")  # Puerto por defecto para PostgreSQL

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
    f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}", echo=True
)

# sesion para interactuar con la DB
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Clase base para las tablas como una plantilla
Base = declarative_base(metadata=MetaData())


@asynccontextmanager
async def get_session_async() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# Database session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


# Create tables before the app start
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield