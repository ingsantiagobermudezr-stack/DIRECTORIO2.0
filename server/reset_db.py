from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
admin_url = "postgresql+psycopg://postgres:12345@localhost:5432/postgres"
engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

try:
    with engine.connect() as conn:
        conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'directorio'"))
        conn.execute(text("DROP DATABASE IF EXISTS directorio"))
        conn.execute(text("CREATE DATABASE directorio"))
    print("Base de datos recreada exitosamente")
except Exception as e:
    print(f"Error: {str(e)}")
