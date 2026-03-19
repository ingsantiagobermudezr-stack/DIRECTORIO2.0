from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    "SQLALCHEMY_DATABASE_URL",
    "sqlite:///./test.db"
)

engine = None


def get_engine():
    global engine
    if engine is None:
        if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                connect_args={"check_same_thread": False}
            )
        else:
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,
                pool_recycle=1800,
            )
    return engine


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


def get_db():
    # Ensure engine is created and SessionLocal is bound lazily
    engine = get_engine()
    SessionLocal.configure(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()