from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
# Conectar directamente a la base de datos directorio
db_url = "postgresql+psycopg://postgres:12345@localhost:5432/directorio"
engine = create_engine(db_url)

try:
    # Eliminar la tabla alembic_version si existe
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
        conn.commit()
    print("Tabla alembic_version eliminada")
except Exception as e:
    print(f"Error: {str(e)}")
